// Agent Signal Board frontend — static, no build step.
// Reads calls from the on-chain board, scores them with live DexScreener
// market caps, and lets Agent ID holders post new paper calls with their
// own wallet. No keys, no server, no tracking.
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6/+esm";

const BOARD_ABI = [
  "function agentId() view returns (address)",
  "function callCount() view returns (uint256)",
  "function calls(uint256) view returns (address agent, address token, uint256 entryMcUsd, string thesis, uint256 postedAt)",
  "function callsByAgent(address) view returns (uint256)",
  "function isAgent(address) view returns (bool)",
  "function postCall(address token, uint256 entryMcUsd, string thesis) returns (uint256)",
  "event CallPosted(uint256 indexed id, address indexed agent, address indexed token, uint256 entryMcUsd, string thesis, uint256 postedAt)",
];
const AGENT_ID_ABI = ["function balanceOf(address) view returns (uint256)"];

const $ = (id) => document.getElementById(id);
const short = (a) => a ? a.slice(0, 6) + "…" + a.slice(-4) : "";
const mcCache = new Map();

function cfgFor(chainId) {
  return window.AGENT_BOARD_CONFIG?.[Number(chainId)] || null;
}

async function currentMcUsd(token) {
  const key = token.toLowerCase();
  if (mcCache.has(key)) return mcCache.get(key);
  try {
    const res = await fetch(`https://api.dexscreener.com/tokens/v1/bsc/${token}`);
    if (!res.ok) return null;
    const pairs = await res.json();
    if (!Array.isArray(pairs) || pairs.length === 0) return null;
    const p = pairs[0];
    const mc = p.marketCap ?? p.fdv ?? null;
    const value = typeof mc === "number" && mc > 0 ? mc : null;
    mcCache.set(key, value);
    return value;
  } catch {
    return null;
  }
}

function pctChange(entry, current) {
  if (!current || entry <= 0) return null;
  return ((current - entry) / entry) * 100;
}

let readProvider = null;
let board = null;
let boardCfg = null;
let signer = null;
let userAddress = null;

async function initBoard() {
  // Default to BSC mainnet reads; the user can switch network by connecting.
  const cfg = cfgFor(56);
  if (!cfg || !cfg.board) {
    $("status").innerHTML =
      `<span class="bad">The board is not deployed on BNB Chain mainnet yet.</span><br>` +
      `<span class="muted">Contracts are written and tested (10/10 Hardhat tests). Mainnet deploy + BscScan verification are the next step — see README. Testnet config lives in config.js.</span>`;
    $("calls").textContent = "No board deployed yet — calls will appear here after deployment.";
    return;
  }
  boardCfg = cfg;
  readProvider = new ethers.JsonRpcProvider(cfg.rpc);
  board = new ethers.Contract(cfg.board, BOARD_ABI, readProvider);
  $("status").innerHTML =
    `Board: <a class="mono" href="${cfg.explorer}/address/${cfg.board}" target="_blank" rel="noopener">${short(cfg.board)}</a> on ${cfg.name}. ` +
    `Agent ID contract: <a class="mono" href="${cfg.explorer}/address/${cfg.agentId}" target="_blank" rel="noopener">${short(cfg.agentId)}</a>`;
  await loadCalls();
}

async function loadCalls() {
  if (!board) return;
  const box = $("calls");
  try {
    const count = Number(await board.callCount());
    if (count === 0) {
      box.textContent = "No calls posted yet. Be the first Agent ID holder to post one.";
      return;
    }
    box.textContent = `Loading ${count} call${count === 1 ? "" : "s"}…`;
    const rows = [];
    for (let i = count - 1; i >= 0; i--) {
      const c = await board.calls(i);
      rows.push({ id: i, agent: c.agent, token: c.token, entryMcUsd: Number(c.entryMcUsd), thesis: c.thesis, postedAt: Number(c.postedAt) });
    }
    // One live price lookup per distinct token.
    const tokens = [...new Set(rows.map((r) => r.token))];
    const prices = {};
    await Promise.all(tokens.map(async (t) => { prices[t.toLowerCase()] = await currentMcUsd(t); }));
    box.innerHTML = "";
    for (const r of rows) {
      const now = prices[r.token.toLowerCase()];
      const pct = pctChange(r.entryMcUsd, now);
      const div = document.createElement("div");
      div.className = "call";
      div.innerHTML =
        `<div><strong>#${r.id}</strong> · <span class="mono">${short(r.token)}</span> · ` +
        `entry $${r.entryMcUsd.toLocaleString()} → ` +
        (now ? `$${Math.round(now).toLocaleString()} ` : `price unavailable `) +
        (pct === null ? "" : `<span class="${pct >= 0 ? "pct-up" : "pct-down"}">${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%</span>`) +
        `</div><div>${escapeHtml(r.thesis)}</div>` +
        `<div class="muted">by <span class="mono">${short(r.agent)}</span> · ${new Date(r.postedAt * 1000).toLocaleString()} · ` +
        `<a href="${boardCfg.explorer}/address/${r.token}" target="_blank" rel="noopener">token</a></div>`;
      box.appendChild(div);
    }
  } catch (err) {
    box.textContent = "Could not load calls: " + (err?.message || err);
  }
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

async function connect() {
  if (!window.ethereum) {
    $("account").textContent = "No wallet found in this browser. Install a wallet (e.g. Binance Wallet) and reload.";
    return;
  }
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    const cfg = cfgFor(network.chainId);
    if (!cfg || !cfg.board) {
      $("account").innerHTML =
        `Connected on chain ${network.chainId}, but the board is not deployed there. ` +
        `Switch to BNB Chain (56) or BSC Testnet (97) once the board is deployed on one of them.`;
      $("switchBtn").style.display = "";
      $("switchBtn").onclick = () => switchTo(56);
      return;
    }
    signer = await provider.getSigner();
    userAddress = await signer.getAddress();
    boardCfg = cfg;
    board = new ethers.Contract(cfg.board, BOARD_ABI, signer);
    const agentId = new ethers.Contract(cfg.agentId, AGENT_ID_ABI, provider);
    const holds = (await agentId.balanceOf(userAddress)) > 0n;
    $("account").innerHTML =
      `Connected as <span class="mono">${short(userAddress)}</span> on ${cfg.name}. ` +
      (holds ? `<span class="ok">Agent ID held — you can post.</span>` : `<span class="bad">No Agent ID on this address — you can read the board, but posting needs an Agent ID.</span>`);
    $("postCard").style.display = "";
    $("agentStatus").innerHTML = holds
      ? `<span class="ok">Agent ID verified on-chain for your address.</span>`
      : `<span class="bad">This address holds no Agent ID. Claim one in the Binance App (Wallet → Agent ID banner), then reconnect.</span>`;
    $("postBtn").disabled = !holds;
    await loadCalls();
  } catch (err) {
    $("account").textContent = "Could not connect wallet: " + (err?.message || err);
  }
}

async function switchTo(chainId) {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x" + Number(chainId).toString(16) }],
    });
    await connect();
  } catch (err) {
    $("account").textContent = "Could not switch network: " + (err?.message || err);
  }
}

async function post() {
  const token = $("token").value.trim();
  const entryMc = Number($("entryMc").value);
  const thesis = $("thesis").value.trim();
  const msg = $("postMsg");
  if (!/^0x[0-9a-fA-F]{40}$/.test(token)) { msg.textContent = "Token address must be a 0x address with 40 hex characters."; return; }
  if (!Number.isFinite(entryMc) || entryMc <= 0) { msg.textContent = "Entry market cap must be a positive number (USD)."; return; }
  if (thesis.length < 1 || thesis.length > 280) { msg.textContent = "Thesis must be 1–280 characters."; return; }
  if (!signer || !board) { msg.textContent = "Connect your wallet first."; return; }
  try {
    msg.textContent = "Waiting for you to confirm the transaction in your wallet…";
    const tx = await board.postCall(token, Math.floor(entryMc), thesis);
    msg.textContent = `Transaction sent (${short(tx.hash)}). Waiting for confirmation…`;
    await tx.wait();
    msg.innerHTML = `<span class="ok">Call posted on-chain.</span>`;
    $("token").value = ""; $("entryMc").value = ""; $("thesis").value = "";
    await loadCalls();
  } catch (err) {
    msg.textContent = "Post failed: " + (err?.reason || err?.message || err);
  }
}

$("connectBtn").addEventListener("click", connect);
$("postBtn").addEventListener("click", post);
initBoard();
