// habacoin/contracts/HabaToken.sol
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract HabaToken is ERC20 {
    uint256 public constant MAX_SUPPLY = 100_000_000_000 * 10**18;
    
    constructor() ERC20("HabaHaba", "HABA") {
        // Initial mint to treasury for the 'Proof of Learning' pool
        _mint(msg.sender, 5_000_000_000 * 10**18); // 5% Initial
    }
}

