// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title AgentSignalBoard
/// @notice An on-chain paper-call board for Agent ID holders on BNB Chain.
/// @dev Only addresses that hold an Agent ID (a non-transferable ERC-721,
///      SPACE ID Agent ID, 0x60b9262456de011f7d15a54cdd8c48baaa8b022f on BNB
///      Chain mainnet) can post a call. The contract holds no funds, has no
///      owner, no pause, no mint and no withdrawal — there are no owner
///      permissions to disclose. Calls are paper only: a call records a
///      token, an entry market cap and a thesis. Nothing here moves money,
///      executes a trade, or promises any return. Outcomes are computed
///      off-chain from public price feeds and shown in the web app.
/// @dev Built for the Binance Agent ID Hackathon (submission period
///      2026-11-18 08:00 UTC to 2026-12-09 08:00 UTC). Agent ID is used
///      as access control — one of the integration patterns the hackathon
///      asks for (access control / identity).
interface IAgentId {
    function balanceOf(address owner) external view returns (uint256);
}

contract AgentSignalBoard {
    /// @notice The Agent ID ERC-721 contract used for the holder check.
    IAgentId public immutable agentId;

    /// @notice Total calls ever posted (also the next call id).
    uint256 public callCount;

    struct Call {
        address agent; // poster — must hold an Agent ID at post time
        address token; // BSC token address the call is about
        uint256 entryMcUsd; // entry market cap in whole USD
        string thesis; // 1-280 chars
        uint256 postedAt; // block timestamp
    }

    mapping(uint256 => Call) public calls;
    mapping(address => uint256) public callsByAgent;

    event CallPosted(
        uint256 indexed id,
        address indexed agent,
        address indexed token,
        uint256 entryMcUsd,
        string thesis,
        uint256 postedAt
    );

    constructor(address _agentId) {
        require(_agentId != address(0), "AgentSignalBoard: Agent ID address is zero");
        agentId = IAgentId(_agentId);
    }

    /// @notice True when `a` holds at least one Agent ID.
    function isAgent(address a) public view returns (bool) {
        return agentId.balanceOf(a) > 0;
    }

    /// @notice Post a paper call. Caller must hold an Agent ID.
    /// @param token BSC token address. Must not be the zero address.
    /// @param entryMcUsd Entry market cap in whole USD. Must be > 0.
    /// @param thesis Short thesis, 1-280 characters.
    /// @return id The id of the posted call.
    function postCall(address token, uint256 entryMcUsd, string calldata thesis)
        external
        returns (uint256 id)
    {
        require(agentId.balanceOf(msg.sender) > 0, "AgentSignalBoard: caller holds no Agent ID");
        require(token != address(0), "AgentSignalBoard: token is zero address");
        require(entryMcUsd > 0, "AgentSignalBoard: entry mc must be > 0");
        require(bytes(thesis).length > 0, "AgentSignalBoard: thesis is empty");
        require(bytes(thesis).length <= 280, "AgentSignalBoard: thesis over 280 chars");

        id = callCount++;
        calls[id] = Call({
            agent: msg.sender,
            token: token,
            entryMcUsd: entryMcUsd,
            thesis: thesis,
            postedAt: block.timestamp
        });
        callsByAgent[msg.sender]++;

        emit CallPosted(id, msg.sender, token, entryMcUsd, thesis, block.timestamp);
    }
}
