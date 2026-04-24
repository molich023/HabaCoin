// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HabaSPow is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 100_000_000_000 * 10**18;
    address public validatorOracle;

    // Multipliers (in basis points: 100 = 1x, 250 = 2.5x)
    uint256 public constant EV_MULTIPLIER = 250; 
    uint256 public constant BIO_MULTIPLIER = 120;

    enum NodeType { PHONE, BIO, EV, TUKTUK, TRANSIT }

    struct Node {
        NodeType nodeType;
        uint256 lastMiningTime;
        bool isVerified;
    }

    mapping(address => Node) public nodes;

    constructor(address _oracle) ERC20("HabaCoin", "HABA") Ownable(msg.sender) {
        validatorOracle = _oracle;
    }

    function registerNode(NodeType _type) public {
        nodes[msg.sender].nodeType = _type;
        nodes[msg.sender].isVerified = false; // Requires Oracle verification
    }

    function verifyNode(address _user) external {
        require(msg.sender == validatorOracle, "Unauthorized");
        nodes[_user].isVerified = true;
    }

    function claimReward(uint256 _durationMins) public {
        require(nodes[msg.sender].isVerified, "Node not verified");
        require(block.timestamp >= nodes[msg.sender].lastMiningTime + (_durationMins * 1 minutes), "Timer error");

        uint256 multiplier = 100;
        if (nodes[msg.sender].nodeType == NodeType.EV) multiplier = EV_MULTIPLIER;
        if (nodes[msg.sender].nodeType == NodeType.BIO) multiplier = BIO_MULTIPLIER;

        uint256 reward = (_durationMins * 10 * 10**18 * multiplier) / 100;
        _mint(msg.sender, reward);
        nodes[msg.sender].lastMiningTime = block.timestamp;
    }

    mapping(address => bool) public isFoundingMember;

    function mintFoundingBadge(address _hustler) external onlyOwner {
        require(balanceOf(_hustler) > 0, "Must be an active hustler");
        isFoundingMember[_hustler] = true;
        // This unlocks the "Gold Shield" UI and "Whale Chat" forever
}
}

