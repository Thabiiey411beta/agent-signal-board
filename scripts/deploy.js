const { ethers } = require("hardhat");

// Deploys MockAgentId + AgentSignalBoard, or the board alone against the
// real Agent ID contract on mainnet.
//
//   Testnet (mock Agent ID, free faucet tBNB):
//     DEPLOYER_PRIVATE_KEY=0x... npx hardhat run scripts/deploy.js --network bscTestnet
//   Mainnet (real Agent ID 0x60b9262456de011f7d15a54cdd8c48baaa8b022f):
//     DEPLOYER_PRIVATE_KEY=0x... npx hardhat run scripts/deploy.js --network bsc
//
// The deployer key comes from the environment only. Never commit it, never
// paste it into a file in this repo. For testnet, generate a throwaway
// keypair and fund it from the BSC testnet faucet (free tBNB).
// Mainnet deploy costs < ~0.001 BNB in gas for these two small contracts.

const REAL_AGENT_ID = "0x60b9262456de011f7d15a54cdd8c48baaa8b022f";

async function main() {
  const network = await ethers.provider.getNetwork();
  const isMainnet = network.chainId === 56n;
  const [deployer] = await ethers.getSigners();
  console.log("Network chainId:", network.chainId.toString());
  console.log("Deployer:", deployer.address);
  console.log("Deployer balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BNB");

  let agentIdAddress = REAL_AGENT_ID;
  if (!isMainnet) {
    console.log("Testnet: deploying MockAgentId first...");
    const MockAgentId = await ethers.getContractFactory("MockAgentId");
    const mock = await MockAgentId.deploy();
    await mock.waitForDeployment();
    agentIdAddress = await mock.getAddress();
    console.log("MockAgentId deployed to:", agentIdAddress);
    // Mint one mock Agent ID to the deployer so the demo account can post.
    const mintTx = await mock.mint(deployer.address);
    await mintTx.wait();
    console.log("Minted 1 mock Agent ID to deployer");
  } else {
    console.log("Mainnet: using real Agent ID:", agentIdAddress);
  }

  const Board = await ethers.getContractFactory("AgentSignalBoard");
  const board = await Board.deploy(agentIdAddress);
  await board.waitForDeployment();
  const boardAddress = await board.getAddress();
  console.log("AgentSignalBoard deployed to:", boardAddress);
  console.log("Agent ID used:", agentIdAddress);
  console.log("");
  console.log("Verify on BscScan (free):");
  console.log(`  npx hardhat verify --network ${isMainnet ? "bsc" : "bscTestnet"} ${boardAddress} ${agentIdAddress}`);
  if (!isMainnet) {
    console.log("  (verify the mock too if you want it public)");
  }
  console.log("");
  console.log("Put the board address in frontend/config.js under this network's chainId.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
