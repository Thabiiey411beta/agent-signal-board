# Deploy checklist — Agent Signal Board

Everything below is a step for the person finishing the submission (Newton
or the main agent). The code is done and tested; these are the external
steps that needed a human or a browser.

## 1. Create the GitHub repo (needed — the GitHub App cannot create repos)

- In the GitHub web UI, create an **empty public** repo:
  `Thabiiey411beta/agent-signal-board` (no README, no .gitignore, no licence
  — the push adds all of those). Do not initialise it with anything.
- Why manual: `create_repository` via the GitHub App returns
  `403 Resource not accessible by integration` — the App can write to
  selected repos but cannot create new ones.

## 2. Push the code (one command, from this VM)

```bash
github push-files --owner Thabiiey411beta --repo agent-signal-board \
  --branch main --message "Agent Signal Board — Binance Agent ID Hackathon entry" \
  --source-dir /home/hatch/workspace/agent-signal-board \
  --paths-file /tmp/agent-signal-board-paths
```

The paths manifest is already written at `/tmp/agent-signal-board-paths`
(NUL-delimited). It includes all source files and excludes `node_modules/`,
`artifacts/`, `cache/` and `.env`. After a confirmed push, record the commit
SHA in `/home/hatch/workspace/agent-signal-board.muse-github-snapshot-sync.json`
(see the connector's snapshot-push procedure).

## 3. Host the frontend (pick one)

- **GitHub Pages (free, preferred):** repo Settings → Pages → deploy from
  the `main` branch, `/frontend` folder. URL will be
  `https://thabiiey411beta.github.io/agent-signal-board/`.
- **Vercel (blocked for now):** `create_deployment` returns 403 — the
  deployment falls under team scope `liquimind` and the connection needs
  team-access re-auth, which has to be approved in the Vercel settings/UI.
  After that, deploy `frontend/` (3 static files, no build).

## 4. BSC testnet demo deploy (optional, proves the pipeline)

- The throwaway testnet deployer is `0xf60fF2896271d2e9D6F558b4a9F51e91Ea78bd11`
  (key at `~/.agent-signal-board/testnet-deployer.key`, mode 600, testnet only).
- It holds 0 tBNB. Drip 0.1 tBNB from the BNB testnet faucet UI
  (`testnet.bnbchain.org/faucet-smart` — needs a browser/captcha; the
  Chainstack faucet API needs an API key + 0.08 ETH mainnet balance, so use
  the BNB faucet UI instead).
- Then: `DEPLOYER_PRIVATE_KEY=$(cat ~/.agent-signal-board/testnet-deployer.key) npx hardhat run scripts/deploy.js --network bscTestnet`
- Verify the board on testnet BscScan (free key) and paste both addresses
  into `frontend/config.js` under chainId 97.

## 5. BNB Chain mainnet deploy (required for submission)

- Needs **~0.001 BNB gas** (~$0.55) in a deployer wallet — Newton has no
  BNB on hand, so this is his step (send ~$1 of BNB to a fresh deployer
  wallet, or deploy from his own wallet).
- `DEPLOYER_PRIVATE_KEY=0x... npx hardhat run scripts/deploy.js --network bsc`
- Verify on BscScan, paste the board address into `frontend/config.js`
  under chainId 56, redeploy the frontend.

## 6. First live call + submission

- Newton claims his Agent ID in the Binance App (Wallet → Agent ID banner),
  connects to the frontend, posts the first call.
- Fill the submission form (fields pre-filled in `SUBMISSION.md`) before
  **2026-12-09 08:00 UTC (10:00 SAST)**. The form link is the
  "Submit Project Now" button on the Binance announcement page.
- Decide the **reward receiving address** (must receive USDC — confirm
  whether a BNB Chain address is required; his `9v3s…Q7bk` wallet is Solana).
- Honest caveat: the Innovation Award needs **30 Agent ID addresses**
  interacting with the contract during the submission period. Promote the
  board (Binance Square, X, Agent ID community) — every interaction is free
  except gas.
