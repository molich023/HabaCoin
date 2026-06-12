import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { event, userId } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    // Securely record hardware verification logs into our Neon DB instance
    await pool.query(
      'INSERT INTO system_audits (event_type, account_context, timestamp) VALUES ($1, $2, NOW())',
      [event, userId || 'ANONYMOUS_PROBE']
    );

    return res.status(200).json({ status: 'LOGGED' });
  } catch (err: any) {
    console.error("[!] System audit log error:", err);
    return res.status(500).json({ error: err.message });
  }
}
