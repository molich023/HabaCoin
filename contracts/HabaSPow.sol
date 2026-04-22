// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HabaSPow is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 100_000_000_000 * 10**18;
    
    // Tracking mining sessions
    struct Miner {
        uint256 lastMiningTime;
        uint256 totalMinutesMined;
        bool isVerifiedHuman;
    }

    mapping(address => Miner) public miners;
    address public validatorOracle; // Your Netlify Edge Function address

    event BlockMined(address indexed miner, uint256 reward, uint256 duration);

    constructor(address _oracle) ERC20("HabaCoin", "HABA") Ownable(msg.sender) {
        validatorOracle = _oracle;
    }

    // THE SPoW MINTING RULE
    function claimMiningReward(
        uint256 _nonce, 
        bytes32 _solution, 
        uint256 _durationMinutes,
        bytes memory _turnstileToken // Proof from Cloudflare
    ) public {
        require(msg.sender == tx.origin, "No proxy contracts allowed");
        require(_durationMinutes <= 60, "Max session is 1 hour"); // Prevents massive jumps
        
        // 1. Verify 'Human' status via the Oracle/Turnstile logic
        // In production, the Oracle signs the transaction after checking Turnstile
        require(miners[msg.sender].isVerifiedHuman, "Must pass Turnstile first");

        // 2. Intelligent Timer Logic
        // We ensure a user hasn't claimed rewards too quickly
        require(block.timestamp >= miners[msg.sender].lastMiningTime + (_durationMinutes * 1 minute), "Timer mismatch");

        // 3. Calculate Reward (Scaled by our Energy Multiplier handled by Oracle)
        uint256 rewardAmount = calculateReward(_durationMinutes); 
        
        require(totalSupply() + rewardAmount <= MAX_SUPPLY, "HABA supply exhausted");

        miners[msg.sender].lastMiningTime = block.timestamp;
        miners[msg.sender].totalMinutesMined += _durationMinutes;

        _mint(msg.sender, rewardAmount);
        emit BlockMined(msg.sender, rewardAmount, _durationMinutes);
    }

    function verifyHuman(address _miner) external {
        require(msg.sender == validatorOracle, "Only Oracle can verify humans");
        miners[_miner].isVerifiedHuman = true;
    }

    function calculateReward(uint256 _mins) internal pure returns (uint256) {
        // Example: 10 HABA per minute (Adjusted by difficulty later)
        return _mins * 10 * 10**18;
    }
}
