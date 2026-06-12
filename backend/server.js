const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { Pool } = require('pg');

const app = reportExpressErrors(express());
app.use(express.json());
app.use(cors());

// Conditional DB initialization for prototyping outside production
const pool = process.env.DATABASE_URL ? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
}) : null;

// Mock database storage arrays for offline prototype mode (when running without Neon env variables)
let mockUsers = [];
let mockBalances = [];
let mockLockups = [];

// Middle East expanded dynamic conversion matrix relative to a USD base anchor
const GLOBAL_FIAT_ORACLE_MATRIX = {
  'KES': 130.00,  'UGX': 3700.00, 'TZS': 2500.00, 'ZAR': 18.00,   
  'NGN': 1360.00, 'ETB': 58.50,   'USD': 1.00,    'CAD': 1.36,    
  'EUR': 0.92,    'INR': 83.50,   'JPY': 156.00,  'MXN': 17.80,   
  'GTQ': 7.80,    'AUD': 1.50,
  // --- Middle East Expansion ---
  'AED': 3.67,    // UAE Dirham (Dubai Anchor - Magnati Gateway integration)
  'SAR': 3.75     // Saudi Riyal (Mada Network integration)
};

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

// --- API IMPLEMENTATION ROUTES ---

// 1. Unified Tier Onboarding & Registration
app.post('/api/users/register', async (req, res) => {
  const { phoneNumber, tier } = req.body;
  let multiplier = 1.00, depositAmount = 1.00;
  
  if (tier === 'SILVER') { multiplier = 1.50; depositAmount = 5.00; }
  else if (tier === 'GOLD') { multiplier = 2.50; depositAmount = 10.00; }

  const lockupEnd = new Date();
  lockupEnd.setDate(lockupEnd.getDate() + 90);

  if (pool) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const userRes = await client.query('INSERT INTO users (phone_number, current_tier, tier_multiplier) VALUES ($1, $2, $3) RETURNING id', [phoneNumber, tier, multiplier]);
      const userId = userRes.rows[0].id;
      await client.query('INSERT INTO balances (user_id) VALUES ($1)', [userId]);
      await client.query('INSERT INTO lockups (user_id, deposit_amount_usd, lockup_end) VALUES ($1, $2, $3)', [userId, depositAmount, lockupEnd]);
      await client.query('COMMIT');
      return res.status(201).json({ status: "SUCCESS", userId, tier, multiplier });
    } catch (err) {
      await client.query('ROLLBACK');
      return res.status(500).json({ error: err.message });
    } finally { client.release(); }
  } else {
    // Local In-Memory Fallback Prototype Execution
    const userId = mockUsers.length + 1;
    mockUsers.push({ id: userId, phone_number: phoneNumber, current_tier: tier, tier_multiplier: multiplier });
    mockBalances.push({ user_id: userId, ubuntu_balance: 0.0, total_steps_walked: 0 });
    mockLockups.push({ user_id: userId, deposit_amount_usd: depositAmount, lockup_end: lockupEnd });
    return res.status(201).json({ status: "PROTOTYPE_SUCCESS_LOCAL", userId, tier, multiplier, note: "Running inside local offline execution sandbox." });
  }
});

// 2. Dual Wallet & External Provider Links
app.post('/api/wallet/connect-external', async (req, res) => {
  const { userId, providerType, publicAddress, telegramInitData } = req.body;
  let verifiedAddress = publicAddress;

  if (providerType === 'TELEGRAM') {
    if (!telegramInitData) return res.status(400).json({ error: "Missing Telegram authentication data." });
    const hash = crypto.createHash('sha256').update(telegramInitData).digest('hex');
    verifiedAddress = '0xtg_' + hash.substring(0, 40);
  }

  if (pool) {
    await pool.query('UPDATE users SET external_wallet_provider = $1, external_wallet_address = $2 WHERE id = $3', [providerType, verifiedAddress, userId]);
  } else {
    const user = mockUsers.find(u => u.id === parseInt(userId));
    if (user) { user.external_wallet_provider = providerType; user.external_wallet_address = verifiedAddress; }
  }
  res.status(200).json({ status: "SUCCESS", providerType, linkedAddress: verifiedAddress });
});

// 3. Step Sync Handler
app.post('/api/mining/sync-steps', async (req, res) => {
  const { userId, rawSteps } = req.body;
  let multiplier = 1.00;

  if (pool) {
    const userQuery = await pool.query('SELECT tier_multiplier FROM users WHERE id = $1', [userId]);
    if (userQuery.rows.length > 0) multiplier = parseFloat(userQuery.rows[0].tier_multiplier);
  } else {
    const user = mockUsers.find(u => u.id === parseInt(userId));
    if (user) multiplier = user.tier_multiplier;
  }

  const finalizedUbuntuEarned = (0.05 * Math.log10(rawSteps + 1)) * multiplier;

  if (pool) {
    await pool.query('UPDATE balances SET ubuntu_balance = ubuntu_balance + $1, total_steps_walked = total_steps_walked + $2 WHERE user_id = $3', [finalizedUbuntuEarned, rawSteps, userId]);
  } else {
    const balance = mockBalances.find(b => b.user_id === parseInt(userId));
    if (balance) { balance.ubuntu_balance += finalizedUbuntuEarned; balance.total_steps_walked += rawSteps; }
  }

  res.status(200).json({ status: "MINED", tokensMined: finalizedUbuntuEarned.toFixed(6) });
});

// 4. Global Merchant Checkout Slippage Lock
app.post('/api/checkout/merchant-lock', async (req, res) => {
  const { fiatAmountLocal, localCurrency } = req.body;
  const rate = GLOBAL_FIAT_ORACLE_MATRIX[localCurrency];
  
  if (!rate) return res.status(400).json({ error: `Currency '${localCurrency}' not supported.` });

  const costInUsd = fiatAmountLocal / rate;
  const pricing = VOLATILITY_SHIELD.getOraclePrice();
  const exactTokensRequired = costInUsd / pricing.protectedPrice;

  res.status(200).json({
    fiatCost: fiatAmountLocal,
    currency: localCurrency,
    tokensRequired: exactTokensRequired.toFixed(6),
    guaranteedRateUsd: pricing.protectedPrice.toFixed(4),
    expiresAt: new Date(Date.now() + 15000).toISOString(),
    slippageLockActive: true
  });
});

function reportExpressErrors(serverInstance) {
  serverInstance.use((err, req, res, next) => { console.error(err.stack); res.status(500).send('Internal Error'); });
  return serverInstance;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Ubuntu Token Universal Framework Booted on Port ${PORT}`));
                                       
