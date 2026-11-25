require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    // BSC testnet (chainId 97) — free faucet tBNB, BscScan testnet verification.
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
    },
    // BNB Chain mainnet (chainId 56) — the hackathon requires deployment here.
    bsc: {
      url: "https://bsc-dataseed.binance.org",
      chainId: 56,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    // BscScan API key (free at bscscan.com/myapikey). Only needed for the
    // `verify` step; tests and local deploys do not need it.
    apiKey: process.env.BSCSCAN_API_KEY || "",
  },
};
