// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HabaCoin is ERC20, ERC20Burnable, Ownable {
    uint256 public constant INITIAL_SUPPLY = 500_000_000 * 10**18; // 500 Million HABA

    constructor() ERC20("HabaCoin", "HABA") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
