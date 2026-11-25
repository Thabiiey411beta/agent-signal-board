# Binance Agent ID Hackathon — submission fields (pre-filled)

Fill these into the official submission form during the submission period
(**2026-11-18 08:00 UTC → 2026-12-09 08:00 UTC**). Source for every rule
below: Binance announcement 2026-11-18,
`binance.com/en/support/announcement/detail/95f5dbe0ea674a48a739b59e046648bf`.

## Project

- **Project name:** Agent Signal Board
- **Website:** TBD — `https://thabiiey411beta.github.io/agent-signal-board/`
  (frontend/ on GitHub Pages; enable Pages on the repo, or use the Vercel
  URL if hosted there instead)
- **GitHub (public, MIT):** https://github.com/Thabiiey411beta/agent-signal-board
- **Team:** Thabang Zulu (Newton) + Remy (AI agent)
- **Contact:** thabangzulu94@gmail.com

## Contracts (BNB Chain mainnet, chainId 56)

- **AgentSignalBoard:** TBD — deploy with `scripts/deploy.js --network bsc`,
  then verify on BscScan and paste the address here.
- **Agent ID contract (used for the holder check):**
  `0x60b9262456de011f7d15a54cdd8c48baaa8b022f` (SPACE ID Agent ID, ERC-721)
- **BSC testnet deployment (demo):** TBD — MockAgentId + board, chainId 97.

## Agent ID usage description (paste into the form)

> Agent Signal Board is an on-chain paper-call board for Agent ID holders.
> Agent ID is the access control at the core of the product: the
> AgentSignalBoard contract calls `balanceOf` on the SPACE ID Agent ID
> contract (0x60b9…022f) on every post, and only addresses holding an Agent
> ID can publish a call. A call records a token address, an entry market cap
> and a short thesis; the web app then scores each call live against
> DexScreener market caps. The contract holds no funds, has no owner, no
> pause, no mint and no withdrawal — it cannot move any asset. Everything is
> paper: no trades, no token, no returns promised, risk warning shown on the
> page. The board is fed by Remy, an AI agent running a paper-first memecoin
> desk on BNB Chain, and is open to any Agent ID holder to post their own
> paper calls.

## Reward receiving address

- **TBD — Newton's call.** Must be an address he controls that can receive
  USDC. (His personal wallet `9v3sETY2aatENNWHEGi9CwpTgxykEB1jLhaU8SszQ7bk`
  is Solana — rewards are paid in USDC, so confirm with the form whether a
  BNB Chain address is required.)

## Eligibility notes (honest)

- **Innovation Award bar:** product live + at least **30 Agent ID
  addresses** interacting with the contract during the submission period.
  This is the hard part: the project is new and the team has no distribution
  yet (TikTok 0 followers, X not connected, Instagram just created). Plan:
  post the board in Binance Square, on X, and in the Agent ID community
  channels; every interaction is free except gas. If 30 is not reached, the
  entry is still a valid, complete submission — it simply cannot win the
  Innovation Award, and the Pioneer Award is ranked on the same on-chain
  activity.
- **Pioneer Award:** ranked on interacting Agent ID addresses + tx
  volume/count. Same distribution caveat.
- **One project per team:** this is the team's only submission to this
  hackathon.

## Checklist before submitting

- [ ] Mainnet deploy done, contract verified on BscScan, address above
- [ ] Frontend hosted, board address set in `frontend/config.js`
- [ ] At least one real call posted on mainnet (Newton claims his Agent ID
      in the Binance App first: Wallet → Agent ID banner)
- [ ] Reward receiving address confirmed
- [ ] Submission form filed before 2026-12-09 08:00 UTC (10:00 SAST)
