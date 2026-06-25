import type { NextApiRequest, NextApiResponse } from 'next';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId identification parameter.' });
  }

  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) throw new Error('Database connection credentials string is missing.');
    const sql = neon(databaseUrl);

    // 1. Fetch current user cumulative balance metrics
    const balances = await sql`
      SELECT total_earned_usdt FROM user_balances WHERE user_id = ${userId} LIMIT 1;
    `;

    if (balances.length === 0) {
      return res.status(404).json({ error: 'User profile ledger not found.' });
    }

    const totalBalance = parseFloat(balances[0].total_earned_usdt);
    if (totalBalance <= 0) {
      return res.status(400).json({ error: 'Insufficient funds for emergency liquidation.' });
    }

    // 2. Enforce the strict 25% Liquidity Slashing Regulation
    const PENALTY_FACTOR = 0.25;
    const PAYOUT_FACTOR = 0.75;

    const slashedAmount = totalBalance * PENALTY_FACTOR;
    const payoutAmount = totalBalance * PAYOUT_FACTOR;

    // 3. Atomically execute the liquidation inside your Neon ledger
    await sql.transaction(async (tx) => {
      // Create the audit trail record
      await tx`
        INSERT INTO liquidations (user_id, gross_balance, slashed_penalty, net_payout)
        VALUES (${userId}, ${totalBalance}, ${slashedAmount}, ${payoutAmount});
      `;

      // Reset the user's balances to zero and log total slashed metrics returned to the reserve pool
      await tx`
        UPDATE user_balances 
        SET total_earned_usdt = 0, 
            withdrawable_pool_usdt = 0, 
            retained_treasury_usdt = 0,
            total_slashed_usdt = COALESCE(total_slashed_usdt, 0) + ${slashedAmount}
        WHERE user_id = ${userId};
      `;
    });

    return res.status(200).json({
      success: true,
      message: 'Emergency complete liquidation executed successfully.',
      originalBalance: totalBalance,
      slashedAmount: slashedAmount.toFixed(4),
      netPayoutSentToMpesa: payoutAmount.toFixed(4)
    });

  } catch (error: any) {
    console.error('❌ Emergency Cashout Failure:', error.message);
    return res.status(500).json({ error: 'Internal secure liquidation execution failed.' });
  }
}
