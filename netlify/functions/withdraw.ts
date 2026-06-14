import { Handler } from '@netlify/functions';
import { getDb } from './lib/db'; // Unified serverless-optimized Neon DB connection handle

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { 'Allow': 'POST' }, body: 'Method Not Allowed' };
  }

  try {
    const { uid, amount } = JSON.parse(event.body || '{}');
    const withdrawAmount = parseFloat(amount);

    // OWASP Parameter Validation
    if (!uid || isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return { statusCode: 422, body: JSON.stringify({ success: false, reason: "Malformed transaction request." }) };
    }

    const sql = getDb();

    // Execute safe transaction to process the withdrawal
    const result = await sql.begin(async (tx) => {
      // 1. Atomically deduct and lock funds only if the current balance allows it
      const [user] = await tx`
        UPDATE profiles 
        SET gaming_points_balance = gaming_points_balance - ${withdrawAmount} 
        WHERE id = ${uid} AND gaming_points_balance >= ${withdrawAmount} 
        RETURNING id
      `;

      if (!user) {
        throw new Error("INSUFFICIENT_FUNDS");
      }

      // 2. Record log entry into the ledger for tracking
      await tx`
        INSERT INTO withdrawals (user_id, amount_haba, status) 
        VALUES (${uid}, ${withdrawAmount}, 'PENDING')
      `;

      return { success: true };
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    };

  } catch (error: any) {
    console.error("[!] Withdrawal Processing Failure:", error.message);
    if (error.message === "INSUFFICIENT_FUNDS") {
      return { statusCode: 400, body: JSON.stringify({ success: false, reason: "Settlement Aborted: Insufficient point balances." }) };
    }
    return { statusCode: 500, body: JSON.stringify({ success: false, reason: "Internal ledger processing exception." }) };
  }
};
