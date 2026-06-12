// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./UbuntuToken.sol";

/**
 * @title HabaCoin Sustainable Proof of Work (sPoW) Module
 * @notice Validates kinetic mobile hardware sensors and multi-modal transit nodes.
 */
contract HabaSPow is Ownable {
    UbuntuToken public immutable ubuntuToken;
    address public validatorOracle;

    // Multipliers in Basis Points (100 = 1.0x, 120 = 1.2x, 250 = 2.5x)
    uint256 public constant EV_MULTIPLIER = 250; 
    uint256 public constant BIO_MULTIPLIER = 120;
    uint256 public constant TRANSIT_MULTIPLIER = 180;

    enum NodeType { PHONE, BIO, EV, TUKTUK, TRANSIT }

    struct Node {
        NodeType nodeType;
        uint256 lastMiningTime;
        bool isVerified;
    }

    mapping(address => Node) public nodes;
    mapping(address => bool) public isFoundingMember;

    event NodeRegistered(address indexed user, NodeType nodeType);
    event NodeVerified(address indexed user);
    event RewardClaimed(address indexed user, uint256 amount);

    constructor(address _ubuntuTokenAddress, address _oracle) Ownable(msg.sender) {
        ubuntuToken = UbuntuToken(_ubuntuTokenAddress);
        validatorOracle = _oracle;
    }

    function changeOracle(address _newOracle) external onlyOwner {
        validatorOracle = _newOracle;
    }

    function registerNode(NodeType _type) public {
        nodes[msg.sender].nodeType = _type;
        nodes[msg.sender].isVerified = false; 
        emit NodeRegistered(msg.sender, _type);
    }

    function verifyNode(address _user) external {
        require(msg.sender == validatorOracle, "HabaCoin: Unauthorized verification source");
        nodes[_user].isVerified = true;
        emit NodeVerified(_user);
    }

    function claimReward(uint256 _durationMins) public {
        Node storage node = nodes[msg.sender];
        require(node.isVerified, "HabaCoin: Node configuration not verified by oracle");
        require(block.timestamp >= node.lastMiningTime + (_durationMins * 1 minutes), "HabaCoin: Speed limit timer violation");

        uint256 multiplier = 100;
        if (node.nodeType == NodeType.EV) multiplier = EV_MULTIPLIER;
        if (node.nodeType == NodeType.BIO) multiplier = BIO_MULTIPLIER;
        if (node.nodeType == NodeType.TRANSIT || node.nodeType == NodeType.TUKTUK) multiplier = TRANSIT_MULTIPLIER;

        uint256 reward = (_durationMins * 10 * 10**18 * multiplier) / 100;
        node.lastMiningTime = block.timestamp;
        
        ubuntuToken.mintKineticReward(msg.sender, reward);
        emit RewardClaimed(msg.sender, reward);
    }

    function flagFoundingBadge(address _hustler) external onlyOwner {
        require(ubuntuToken.balanceOf(_hustler) > 0, "HabaCoin: Account possesses zero native traction");
        isFoundingMember[_hustler] = true;
    }
}
