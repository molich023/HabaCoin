#!/bin/bash
# ====================================================================
# 🛡️ HABACOIN AUTOMATIC SECURITY TOOLCHAIN INTEGRATION SCRIPT
# ====================================================================

echo "🧹 Step 1: Creating .solhintignore to isolate our main codebase..."
cat << 'INNER_EOF' > .solhintignore
node_modules/
artifacts/
cache/
coverage/
test/
contracts/mocks/
contracts/test/
INNER_EOF

echo "⚙️ Step 2: Generating modern .solhint.json configuration..."
cat << 'INNER_EOF' > .solhint.json
{
  "extends": "solhint:recommended",
  "rules": {
    "compiler-version": ["error", "^0.8.20"],
    "no-complex-fallback": "error",
    "reentrancy": "error",
    "state-visibility": "error",
    "avoid-sha3": "warn",
    "avoid-suicide": "error",
    "avoid-throw": "error",
    "gas-custom-errors": "error"
  }
}
INNER_EOF

echo "📝 Step 3: Rewriting contracts/HabaCoin.sol with 100% Custom Errors..."
cat << 'INNER_EOF' > contracts/HabaCoin.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title HabaCoin
 * @dev Highly optimized, secure ERC20 token ledger.
 */
contract HabaCoin is ERC20, Ownable, ReentrancyGuard {
    
    // 🛡️ GAS OPTIMIZATION: Zero legacy require() strings. 
    error ZeroAddressDetected();
    error ZeroAmountDetected();

    struct RewardLedger {
        uint128 accruedBalance;
        uint64 totalClaimCycles;
        uint64 lastClaimTimestamp;
    }

    mapping(address => RewardLedger) private _rewards;
    uint256 public constant INCENTIVE_CAP = 1000 * 10**18;

    constructor() ERC20("HabaCoin", "HABA") Ownable(msg.sender) {}

    /**
     * @notice Fetch structural user reward state securely
     * @param account Target account query wallet
     */
    function getRewards(address account) external view returns (uint128, uint64, uint64) {
        RewardLedger memory ledger = _rewards[account];
        return (ledger.accruedBalance, ledger.totalClaimCycles, ledger.lastClaimTimestamp);
    }

    /**
     * @dev Process batch allocations gas-efficiently using optimized loop structures
     */
    function processBatchAllocation(address[] calldata recipients, uint128 allocationAmount) 
        external 
        onlyOwner 
        nonReentrant 
    {
        if (allocationAmount == 0) revert ZeroAmountDetected();
        uint256 totalRecipients = recipients.length;
        
        for (uint256 i = 0; i < totalRecipients; ) {
            address target = recipients[i];
            if (target == address(0)) revert ZeroAddressDetected();
            
            _rewards[target].accruedBalance += allocationAmount;
            
            unchecked {
                i++;
            }
        }
    }
}
INNER_EOF

echo "📦 Step 4: Injecting shortcut scripts into package.json..."
# Safely add npm run scripts using node script execution
node -e '
const fs = require("fs");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
pkg.scripts = pkg.scripts || {};
pkg.scripts["lint:contracts"] = "solhint \"contracts/**/*.sol\"";
pkg.scripts["benchmark:gas"] = "hardhat run scripts/benchmark-gas.ts";
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2));
'

echo "🎉 SUCCESS: All security files generated and updated successfully!"
