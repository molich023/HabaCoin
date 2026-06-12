// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title Ubuntu Token ($UBUNTU)
 * @notice The core cryptographic utility asset for the HabaCoin Global ecosystem.
 */
contract UbuntuToken is ERC20, AccessControl {
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    uint256 public constant MAX_SUPPLY = 100_000_000_000 * 10**18;

    constructor(address _initialOracle) ERC20("Ubuntu Token", "UBUNTU") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ORACLE_ROLE, _initialOracle);

        // Mint 5% initial liquidity buffer to corporate treasury for ecosystem distribution
        _mint(msg.sender, 5_000_000_000 * 10**18);
    }

    /**
     * @notice Secure execution gateway allowing authorized servers to mint verified movement or chat rain rewards.
     */
    function mintKineticReward(address to, uint256 amount) external onlyRole(ORACLE_ROLE) {
        require(totalSupply() + amount <= MAX_SUPPLY, "HabaCoin: Hard cap maximum supply exceeded");
        _mint(to, amount);
    }
}
