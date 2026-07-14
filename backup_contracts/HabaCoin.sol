// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title HabaCoin
 * @dev Highly optimized, secure ERC20 token ledger with 1 Trillion Total Supply.
 */
contract HabaCoin is ERC20, Ownable, ReentrancyGuard {
    
    // 🛡️ GAS OPTIMIZATION: Custom Errors replace expensive string-based require statements
    error ZeroAddressDetected();
    error ZeroAmountDetected();

    struct RewardLedger {
        uint128 accruedBalance;
        uint64 totalClaimCycles;
        uint64 lastClaimTimestamp;
    }

    mapping(address => RewardLedger) private _rewards;
    
    // Total Supply: 1,000,000,000,000 (1 Trillion) tokens with 18 decimal places
    uint256 public constant INITIAL_SUPPLY = 1_000_000_000_000 * 10**18;

    constructor() ERC20("HabaCoin", "HABA") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);
    }

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
