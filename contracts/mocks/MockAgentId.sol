// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title MockAgentId
/// @notice Minimal ERC-721 stand-in for the SPACE ID Agent ID contract,
///         used ONLY for local tests and BSC testnet demos. It implements
///         just enough of ERC-721 for the board: balanceOf, ownerOf, mint
///         and the Transfer event. The real Agent ID contract on BNB Chain
///         mainnet is 0x60b9262456de011f7d15a54cdd8c48baaa8b022f
///         (non-transferable, one per user, claimed in the Binance App).
contract MockAgentId {
    string public constant name = "Mock Agent ID";
    string public constant symbol = "AI";
    uint256 public totalSupply;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _owners;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    function balanceOf(address owner) external view returns (uint256) {
        require(owner != address(0), "MockAgentId: zero address");
        return _balances[owner];
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        address owner = _owners[tokenId];
        require(owner != address(0), "MockAgentId: token does not exist");
        return owner;
    }

    /// @notice Mints one mock Agent ID to `to`. Test/demo only — the real
    ///         Agent ID is claimed in the Binance App, not minted here.
    function mint(address to) external returns (uint256 tokenId) {
        require(to != address(0), "MockAgentId: zero address");
        require(_balances[to] == 0, "MockAgentId: one Agent ID per address");
        tokenId = totalSupply++;
        _owners[tokenId] = to;
        _balances[to] = 1;
        emit Transfer(address(0), to, tokenId);
    }
}
