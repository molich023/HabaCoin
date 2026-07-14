// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract HabaCoin is Initializable, ERC20Upgradeable, OwnableUpgradeable, UUPSUpgradeable {
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) public initializer {
        __ERC20_init("HabaCoin", "HABA");
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();

        // 1 Trillion tokens (18 decimals)
        _mint(initialOwner, 1000000000000 * 10**decimals());
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
