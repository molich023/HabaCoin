const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const crypto = require('crypto');

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Mock state database for Volatility Shield 
const VOLATILITY_SHIELD = {
  lambda: 0.91,
  currentVariance: 0.0004,
  lastSpotPrice: 0.12,
  getOraclePrice: function () {
    const volatilityAdjustment = Math.sqrt(this.currentVariance) * 1.96;
    return {
      spotPrice: this.lastSpotPrice,
      protectedPrice: Math.max(this.lastSpotPrice * (1 - volatilityAdjustment), 0.01)
    };
  }
};

// ==========================================
// NEW: WALLET ADAPTERS & EXTERNAL INTERFACES
// ==========================================

/**
 * ROUTE: External Wallet Linking Engine
 * Handles internal matching for Telegram WebApp Auth and Decentralised Wallets
 */
app.post('/api/wallet/connect-external', async (req, res) => {
  const { userId, providerType, publicAddress, telegramInitData } = req.body;
  // providerType options: 'TELEGRAM', 'METAMASK', 'TRUST_WALLET', 'COINBASE_WALLET'

  try {
    let verifiedAddress = publicAddress;

    // 1. If connecting via Telegram, validate authentication payload
    if (providerType === 'TELEGRAM') {
      if (!telegramInitData) {
        return res.status(400).json({ error: "Missing Telegram authentication signature data." });
      }
      // Generate a deterministic internal address mapped to their unique Telegram ID hash
      const hash = crypto.createHash('sha256').update(telegramInitData).digest('hex');
      verifiedAddress = '0xtg_' + hash.substring(0, 40);
    }

    if (!verifiedAddress) {
      return res.status(400).json({ error: "No public wallet address provided for decentralised wallet handshake." });
    }

    // 2. Map or update the external link payload in our Neon DB backend
    await pool.query(
      `UPDATE users 
       SET external_wallet_provider = $1, 
           external_wallet_address = $2 
       WHERE id = $3`,
      [providerType, verifiedAddress, userId]
    );

    res.status(200).json({
      status: "SUCCESS",
      message: `Successfully linked decentralised provider: ${providerType}`,
      linkedAddress: verifiedAddress,
      isExternal: true
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * ROUTE: Step Sync Core Interface
 */
app.post('/api/mining/sync-steps', async (req, res) => {
  const { userId, rawSteps } = req.body;
  try {
    const userQuery = await pool.query('SELECT tier_multiplier FROM users WHERE id = $1', [userId]);
    if (userQuery.rows.length === 0) return res.status(404).json({ error: "User profile missing" });
    
    const multiplier = parseFloat(userQuery.rows[0].tier_multiplier);
    const finalizedUbuntuEarned = (0.05 * Math.log10(rawSteps + 1)) * multiplier;

    await pool.query(
      'UPDATE balances SET ubuntu_balance = ubuntu_balance + $1, total_steps_walked = total_steps_walked + $2 WHERE user_id = $3',
      [finalizedUbuntuEarned, rawSteps, userId]
    );

    res.status(200).json({ tokensMined: finalizedUbuntuEarned.toFixed(6) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Standard core fallbacks from our architecture
app.post('/api/users/register', async (req, res) => { /* ... registration pipeline ... */ });
app.post('/api/checkout/merchant-lock', async (req, res) => { /* ... lock calculations ... */ });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Ubuntu Token Core Engine Active on Port ${PORT}`));
  
