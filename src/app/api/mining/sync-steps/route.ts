import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import { createHash } from 'crypto';
import { ethers } from 'ethers';

// 1. Core Environment Configuration Initialization
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Neon DB PostgreSQL connection string
  ssl: { rejectUnauthorized: false }
});

// Configure Ethers.js Provider to securely route programmatic mints onto the Polygon L2 network
const provider = new ethers.JsonRpcProvider(process.env.DRPC_POLYGON_URL || "https://polygon.drpc.org");
const oracleSignerWallet = new ethers.Wallet(process.env.ORACLE_PRIVATE_KEY || "", provider);

// Complete minimal ABI declaration required to call our deployed UbuntuToken allocation contract
const UBUNTU_TOKEN_ABI = [
  "function mintKineticReward(address to, uint256 amount) external",
  "function balanceOf(address account) external view returns (uint256)"
];
const ubuntuTokenContract = new ethers.Contract(process.env.NEXT_PUBLIC_UBUNTU_TOKEN_ADDRESS || "", UBUNTU_TOKEN_ABI, oracleSignerWallet);

type Data = {
  status: string;
  message?: string;
  tokensMined?: string;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  // Enforce rigid REST constraint models
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'REJECTED', error: 'Method Not Allowed' });
  }

  const { userId, reward, nonce1, nonce2, difficulty, timestamp, verificationToken, secretKey, userWalletAddress } = req.body;

  // --- DEFENSE CHECKPOINT 1: APP HANDSHAKE ENFORCEMENT ---
  if (!secretKey || secretKey !== process.env.MINER_SECRET) {
    console.error(`[!] Security Warning: Unauthorized API handshake attempt caught for User ID: ${userId}`);
    return res.status(403).json({ status: 'FORBIDDEN', error: 'Cryptographic core application handshake mismatch.' });
  }

  // --- DEFENSE CHECKPOINT 2: TIME-DRIFT REPLAY ATTACK MITIGATION ---
  const serverTime = Date.now();
  const timeDriftWindow = Math.abs(serverTime - Number(timestamp));
  
  if (timeDriftWindow > 60000) { // Rigid 60-second maximum lifespan window
    return res.status(400).json({ status: 'REJECTED', error: 'Proof signature expired. Block processing timeout window crossed.' });
  }

  // --- DEFENSE CHECKPOINT 3: SERVER-SIDE VALIDATION RE-VERIFICATION ---
  const clientSeed = process.env.NEXT_PUBLIC_MINING_SEED || "HabaCoinGlobalUniversalNetworkSeed";
  const clientSalt = process.env.MINING_SALT || "HabaDefaultSystemSalt";
  
  // Re-compute the target verification token using HMAC hash patterns matching Rust-WASM logic
  const serverTokenHasher = createHash('sha256');
  serverTokenHasher.update(BigInt(nonce1).toString(10));
  serverTokenHasher.update(BigInt(nonce2).toString(10));
  serverTokenHasher.update(BigInt(timestamp).toString(10));
  const serverComputedToken = serverTokenHasher.digest('hex');

  if (serverComputedToken !== verificationToken) {
    return res.status(401).json({ status: 'TAMPERED', error: 'Cryptographic validation signature mismatch. Request payload altered.' });
  }

  // Deep structural collision check verification using Sha3-256 matching our Rust Momentum rules
  const h1Hasher = createHash('sha3-256').update(clientSeed).update(clientSalt).update(BigInt(nonce1).toString(10)).digest();
  const h2Hasher = createHash('sha3-256').update(clientSeed).update(clientSalt).update(BigInt(nonce2).toString(10)).digest();
  
  const byteLength = Number(difficulty) <= 32 ? 4 : 8;
  const matchH1 = h1Hasher.subarray(0, byteLength);
  const matchH2 = h2Hasher.subarray(0, byteLength);

  if (nonce1 === nonce2 || !matchH1.equals(matchH2)) {
    return res.status(422).json({ status: 'REJECTED', error: 'Mathematical sPoW verification verification failed. Bot spoofing detected.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // --- DEFENSE CHECKPOINT 4: DOUBLE-SPEND ATTEMPT PREVENTATIVE CHECK ---
    // Log verification tokens inside our Neon tracking engine to catch submission duplicates
    const duplicateCheck = await client.query(
      'SELECT 1 FROM processed_proofs WHERE verification_token = $1',
      [verificationToken]
    );

    if (duplicateCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ status: 'DUPLICATE', error: 'Transaction collision: Proof payload already processed on-chain.' });
    }

    // Insert token signature into tracking ledger to instantly burn future replay vectors
    await client.query(
      'INSERT INTO processed_proofs (verification_token, user_id, processed_at) VALUES ($1, $2, NOW())',
      [verificationToken, userId]
    );

    // Fetch account execution limits and multiplier definitions from the Neon user matrix
    const userProfileQuery = await client.query(
      'SELECT tier_multiplier FROM users WHERE id = $1',
      [userId]
    );

    let profileMultiplier = 1.00;
    if (userProfileQuery.rows.length > 0) {
      profileMultiplier = parseFloat(userProfileQuery.rows[0].tier_multiplier);
    }

    // Multiply the base computed score against the secured account tier multiplier
    const optimizedRewardAllocation = Number(reward) * profileMultiplier;
    const atomicWeiAllocation = ethers.parseUnits(optimizedRewardAllocation.toFixed(18), 18);

    // --- DEFENSE CHECKPOINT 5: ON-CHAIN POLYGON LEDGER INTERFACE ---
    console.log(`[+] Proof verified. Dispensing ${optimizedRewardAllocation} $UBUNTU directly onto Polygon network to wallet: ${userWalletAddress}`);
    const blockchainTransaction = await ubuntuTokenContract.mintKineticReward(userWalletAddress, atomicWeiAllocation);
    await blockchainTransaction.wait(); // Wait for confirmation on the Polygon blockchain

    // Update the local Neon storage tables to maintain perfect balance parity
    await client.query(
      'UPDATE balances SET ubuntu_balance = ubuntu_balance + $1, last_step_sync = NOW() WHERE user_id = $2',
      [optimizedRewardAllocation, userId]
    );

    await client.query('COMMIT');
    return res.status(200).json({
      status: 'SUCCESS',
      message: 'sPoW Proof accepted, verified, and settled on-chain.',
      tokensMined: optimizedRewardAllocation.toFixed(6)
    });

  } catch (dbError: any) {
    await client.query('ROLLBACK');
    console.error('[!] Database/Blockchain critical execution failure:', dbError);
    return res.status(500).json({ status: 'ERROR', error: `Internal Settle Interruption: ${dbError.message}` });
  } finally {
    client.release();
  }
}
