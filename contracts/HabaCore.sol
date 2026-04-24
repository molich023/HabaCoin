// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HabaCore is ERC20, Ownable {
    // Mapping to track verified Kinetic Miners (Marathon Hustlers)
    mapping(address => bool) public isFoundingBridge;

    constructor() ERC20("Haba Token", "HABA") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10**decimals()); // Initial Liquidity
    }

    // Security Measure: Only the Oracle (your Netlify server) can mint movement rewards
    function mintKineticReward(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function setFoundingStatus(address hustler, bool status) external onlyOwner {
        isFoundingBridge[hustler] = status;
    }
}
