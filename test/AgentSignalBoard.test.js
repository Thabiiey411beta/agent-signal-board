const { expect } = require("chai");
const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

// Real-world shape, from the audit's dead-token table: a BSC token with a
// small market cap. The board only stores the address + entry mc; price
// outcomes are computed off-chain, so any address works here.
const TOKEN = "0x60D84C95f79a0f303E65B207021a2186822005bf"; // BSCP / WBNB (paper desk)
const LONG_THESIS = "x".repeat(281);

describe("AgentSignalBoard", function () {
  async function deploy() {
    const [deployer, alice, bob] = await ethers.getSigners();
    const MockAgentId = await ethers.getContractFactory("MockAgentId");
    const agentId = await MockAgentId.deploy();
    const Board = await ethers.getContractFactory("AgentSignalBoard");
    const board = await Board.deploy(await agentId.getAddress());
    return { deployer, alice, bob, agentId, board };
  }

  it("reverts the constructor on the zero Agent ID address", async function () {
    const Board = await ethers.getContractFactory("AgentSignalBoard");
    await expect(Board.deploy(ethers.ZeroAddress)).to.be.revertedWith(
      "AgentSignalBoard: Agent ID address is zero",
    );
  });

  it("isAgent is false before mint, true after", async function () {
    const { agentId, board, alice } = await deploy();
    expect(await board.isAgent(alice.address)).to.equal(false);
    await agentId.mint(alice.address);
    expect(await board.isAgent(alice.address)).to.equal(true);
  });

  it("a non-holder cannot post a call", async function () {
    const { board, alice } = await deploy();
    await expect(board.connect(alice).postCall(TOKEN, 39065, "paper only"))
      .to.be.revertedWith("AgentSignalBoard: caller holds no Agent ID");
    expect(await board.callCount()).to.equal(0);
  });

  it("a holder posts a call: stored, counted, event emitted", async function () {
    const { agentId, board, alice } = await deploy();
    await agentId.mint(alice.address);
    await expect(board.connect(alice).postCall(TOKEN, 39065, "paper: breakout retest"))
      .to.emit(board, "CallPosted")
      .withArgs(0, alice.address, TOKEN, 39065, "paper: breakout retest", anyValue);
    expect(await board.callCount()).to.equal(1);
    expect(await board.callsByAgent(alice.address)).to.equal(1);
    const call = await board.calls(0);
    expect(call.agent).to.equal(alice.address);
    expect(call.token).to.equal(TOKEN);
    expect(call.entryMcUsd).to.equal(39065);
    expect(call.thesis).to.equal("paper: breakout retest");
    expect(call.postedAt).to.be.gt(0);
  });

  it("call ids increment across holders", async function () {
    const { agentId, board, alice, bob } = await deploy();
    await agentId.mint(alice.address);
    await agentId.mint(bob.address);
    await board.connect(alice).postCall(TOKEN, 1000, "first");
    await board.connect(bob).postCall(TOKEN, 2000, "second");
    expect(await board.callCount()).to.equal(2);
    expect((await board.calls(1)).agent).to.equal(bob.address);
  });

  it("rejects the zero token address", async function () {
    const { agentId, board, alice } = await deploy();
    await agentId.mint(alice.address);
    await expect(board.connect(alice).postCall(ethers.ZeroAddress, 1000, "x"))
      .to.be.revertedWith("AgentSignalBoard: token is zero address");
  });

  it("rejects a zero entry market cap", async function () {
    const { agentId, board, alice } = await deploy();
    await agentId.mint(alice.address);
    await expect(board.connect(alice).postCall(TOKEN, 0, "x"))
      .to.be.revertedWith("AgentSignalBoard: entry mc must be > 0");
  });

  it("rejects an empty thesis and a thesis over 280 chars", async function () {
    const { agentId, board, alice } = await deploy();
    await agentId.mint(alice.address);
    await expect(board.connect(alice).postCall(TOKEN, 1000, ""))
      .to.be.revertedWith("AgentSignalBoard: thesis is empty");
    await expect(board.connect(alice).postCall(TOKEN, 1000, LONG_THESIS))
      .to.be.revertedWith("AgentSignalBoard: thesis over 280 chars");
  });

  it("the board holds no funds and has no payable function", async function () {
    const { board } = await deploy();
    expect(await ethers.provider.getBalance(await board.getAddress())).to.equal(0);
    // Sending BNB to the board reverts (no receive/fallback).
    const [sender] = await ethers.getSigners();
    await expect(
      sender.sendTransaction({ to: await board.getAddress(), value: 1 }),
    ).to.be.reverted;
  });

  it("mock Agent ID enforces one per address (mirrors the real contract)", async function () {
    const { agentId, alice } = await deploy();
    await agentId.mint(alice.address);
    await expect(agentId.mint(alice.address)).to.be.revertedWith(
      "MockAgentId: one Agent ID per address",
    );
  });
});
