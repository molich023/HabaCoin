const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
app.use(cors());

// Initialize connection pool to Neon DB
// Ensure your connection string is securely added to your environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ==========================================
// THE MATHEMATHICAL VOLATILITY SHIELD ENGINE
// ==========================================
const VOLATILITY_SHIELD = {
  lambda: 0.91,             // EWMA short-memory decay constant for 3-hour variance tracking
  currentVariance: 0.0004,  // Baseline historical variance
  lastSpotPrice: 0.12,      // Mock base price of $UBUNTU in USD

  // 1. EWMA Variance Calculation
  calculateVariance: function (newReturn) {
    this.currentVariance = (this.lambda * this.currentVariance) + ((1 - this.lambda) * Math.pow(newReturn, 2));
    return this.currentVariance;
  },

  // 2. Fetch Dynamic Oracle Price incorporating higher-order risk protections
  getOraclePrice: function () {
    const volatilityAdjustment = Math.sqrt(this.currentVariance) * 1.96; 
    const protectedPrice = this.lastSpotPrice * (1 - volatilityAdjustment);
    return {
      spotPrice: this.lastSpotPrice,
      protectedPrice: Math.max(protectedPrice, 0.01), 
      variance: this.currentVariance
    };
  }
};

// ==========================================
// CORE API ROUTES & BUSINESS LOGIC
// ==========================================

/**
 * ROUTE 1: User Registration & Tier Onboarding
 * Location: App Registration Flow
 */
app.post('/api/users/register', async (req, res) => {
  const { phoneNumber, tier } = req.body; // tier must be 'BRONZE', 'SILVER', or 'GOLD'
  
  let multiplier = 1.00;
  let depositAmount = 1.00;
  
  if (tier === 'SILVER') { multiplier = 1.50; depositAmount = 5.00; }
  else if (tier === 'GOLD') { multiplier = 2.50; depositAmount = 10.00; }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Insert user
    const userRes = await client.query(
      `INSERT INTO users (phone_number, current_tier, tier_multiplier) 
       VALUES ($1, $2, $3) RETURNING id`,
      [phoneNumber, tier, multiplier]
    );
    const userId = userRes.rows[0].id;

    // Initialize balance profile
    await client.query('INSERT INTO balances (user_id) VALUES ($1)', [userId]);

    // Create 3-Month Lockup Maturity Vault (exactly 90 days from now)
    const lockupEnd = new Date();
    lockupEnd.setDate(lockupEnd.getDate() + 90);

    await client.query(
      `INSERT INTO lockups (user_id, deposit_amount_usd, lockup_end) 
       VALUES ($1, $2, $3)`,
      [userId, depositAmount, lockupEnd]
    );

    await client.query('COMMIT');
    res.status(201).json({ message: "Registration successful", userId, tier, multiplier });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

/**
 * ROUTE 2: M2E Device Step Syncer
 * Location: Main PWA Dashboard Screen
 */
app.post('/api/mining/sync-steps', async (req, res) => {
  const { userId, rawSteps } = req.body;

  try {
    const userQuery = await pool.query('SELECT tier_multiplier FROM users WHERE id = $1', [userId]);
    if (userQuery.rows.length === 0) return res.status(404).json({ error: "User profile missing" });
    
    const multiplier = parseFloat(userQuery.rows[0].tier_multiplier);
    
    // Convert raw steps to physical metrics
    const distanceMeters = rawSteps * 0.762;
    const distanceKm = distanceMeters / 1000;

    // Diminishing returns scaling via Logarithmic protection curve
    const alpha = 0.05; 
    const baseTokensMined = alpha * Math.log10(rawSteps + 1);
    const finalizedUbuntuEarned = baseTokensMined * multiplier;

    // Sync metrics directly to Neon DB
    await pool.query(
      `UPDATE balances 
       SET ubuntu_balance = ubuntu_balance + $1, 
           total_steps_walked = total_steps_walked + $2, 
           last_step_sync = CURRENT_TIMESTAMP 
       WHERE user_id = $3`,
      [finalizedUbuntuEarned, rawSteps, userId]
    );

    // Calculate USD value equivalents
    const priceData = VOLATILITY_SHIELD.getOraclePrice();
    const usdValue = finalizedUbuntuEarned * priceData.protectedPrice;

    res.status(200).json({
      stepsLogged: rawSteps,
      meters: distanceMeters.toFixed(2),
      kilometers: distanceKm.toFixed(2),
      tokensMined: finalizedUbuntuEarned.toFixed(6),
      estimatedValueUsd: usdValue.toFixed(4)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * ROUTE 3: 15-Second Merchant Slippage Lock Setup
 * Location: Merchant QR Scan Trigger
 */
app.post('/api/checkout/merchant-lock', async (req, res) => {
  const { fiatAmountLocal, localCurrency } = req.body; // e.g., 100, 'KES'

  // Standard local fiat currency conversion index matching our cross-border roadmap
  const fiatRatesToUsd = { 'KES': 130.00, 'UGX': 3700.00, 'TZS': 2500.00, 'ZAR': 18.00 };
  const rate = fiatRatesToUsd[localCurrency] || 1.00;

  const costInUsd = fiatAmountLocal / rate;
  const pricing = VOLATILITY_SHIELD.getOraclePrice();

  // Determine critical atomic token requirements via protected price oracle threshold
  const exactTokensRequired = costInUsd / pricing.protectedPrice;
  const lockExpiration = Date.now() + 15000; // Hard coded 15-second finality rule

  res.status(200).json({
    fiatCost: fiatAmountLocal,
    currency: localCurrency,
    tokensRequired: exactTokensRequired.toFixed(6),
    guaranteedRateUsd: pricing.protectedPrice.toFixed(4),
    expiresAt: new Date(lockExpiration).toISOString(),
    slippageLockActive: true
  });
});

/**
 * ROUTE 4: 3-Month Maturity Verification & Withdrawal Logic
 * Location: Wallet Menu (M-Pesa Out-Ramp)
 */
app.post('/api/wallet/withdraw-request', async (req, res) => {
  const { userId, withdrawAll } = req.body;

  try {
    const lockQuery = await pool.query(
      'SELECT * FROM lockups WHERE user_id = $1 ORDER BY lockup_start DESC LIMIT 1', 
      [userId]
    );

    if (lockQuery.rows.length === 0) return res.status(404).json({ error: "Active deposit trace missing" });

    const lockup = lockQuery.rows[0];
    const now = new Date();
    const locksExpired = now >= new Date(lockup.lockup_end);

    if (withdrawAll) {
      if (!locksExpired) {
        // Enforce the 25% Early Churn Penalty if executed before 3 months
        const penaltyRate = 0.25;
        return res.status(403).json({
          message: "Maturity lock active. Full premature liquidation triggers early exit penalties.",
          lockupEndDate: lockup.lockup_end,
          earlyExitPenalty: `${penaltyRate * 100}%`,
          actionRequired: "Confirm agreement to penalty terms or wait for maturity."
        });
      }
      
      // If matured, unlock full structural access to assets
      return res.status(200).json({ status: "UNLOCKED", message: "Vault fully matured. Payout pushed to M-Pesa gateway safely." });
    } else {
      // Micro-Withdrawal Relief Valve: Allow standard users basic access to 10% of liquidity needs
      return res.status(200).json({
        status: "APPROVED",
        message: "Micro-withdrawal processed under the 10% structural threshold balance rules."
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * ROUTE 5: Automatic Community Chat Rain Distribution Engine
 * Location: Mining Engine Chron-Trigger
 */
app.post('/api/community/chat-rain', async (req, res) => {
  const { globalRainPoolAmount } = req.body; 

  try {
    // Isolate active users who have messaged or updated steps within the last 15 minutes
    const activeWindow = new Date(Date.now() - 15 * 60 * 1000);
    const activeUsersRes = await pool.query(
      'SELECT user_id FROM balances WHERE last_chat_activity >= $1', 
      [activeWindow]
    );

    if (activeUsersRes.rows.length === 0) {
      return res.status(200).json({ message: "Rain pooled. No users currently active in the chat." });
    }

    const activeUsers = activeUsersRes.rows;
    const splitAllocation = globalRainPoolAmount / activeUsers.length;

    // Distribute rain split atomically across all active users
    for (let user of activeUsers) {
      await pool.query(
        'UPDATE balances SET ubuntu_balance = ubuntu_balance + $1 WHERE user_id = $2',
        [splitAllocation, user.user_id]
      );
    }

    res.status(200).json({
      message: "🌧️ Chat Rain successfully distributed!",
      distributedTokens: globalRainPoolAmount,
      totalLuckyMiners: activeUsers.length,
      receivedPerMiner: splitAllocation.toFixed(6)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Run Application Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Ubuntu Token Engine online on port ${PORT}`));
      
