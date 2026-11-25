// Network + contract configuration for the Agent Signal Board frontend.
//
// The board address is filled in after each deployment (see
// scripts/deploy.js output). Until mainnet is deployed, the board is
// only live on BSC testnet (chainId 97) with the mock Agent ID.
window.AGENT_BOARD_CONFIG = {
  // BNB Chain mainnet (chainId 56). Real Agent ID contract.
  56: {
    name: "BNB Chain",
    rpc: "https://bsc-dataseed.binance.org",
    explorer: "https://bscscan.com",
    agentId: "0x60b9262456de011f7d15a54cdd8c48baaa8b022f",
    board: null, // TODO: set after mainnet deploy (scripts/deploy.js --network bsc)
  },
  // BSC testnet (chainId 97). Mock Agent ID — mint one from the deploy
  // script or the testnet board's companion MockAgentId contract.
  97: {
    name: "BSC Testnet",
    rpc: "https://data-seed-prebsc-1-s1.binance.org:8545",
    explorer: "https://testnet.bscscan.com",
    agentId: null, // TODO: set to the deployed MockAgentId address
    board: null, // TODO: set after testnet deploy (scripts/deploy.js --network bscTestnet)
  },
};
