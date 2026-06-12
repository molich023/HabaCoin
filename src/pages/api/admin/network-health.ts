import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { block, status } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    // Persist real-time block status analytics for admin dashboards
    await pool.query(
      'INSERT INTO network_health (block_number, status, checked_at) VALUES ($1, $2, NOW()) ON CONFLICT DO NOTHING',
      [Number(block), status]
    );

    return res.status(200).json({ status: 'HEALTH_METRICS_UPDATED' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
