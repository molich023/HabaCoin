import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { timeTaken, difficulty, log, handshakeToken } = req.body;

  // --- SERVER-SIDE PROTECTION 1: TIMING LIFESPAN ENFORCEMENT ---
  if (difficulty === 'EXPERT' && Number(timeTaken) < 120) {
    return res.status(422).json({ 
      success: false, 
      reason: "Inhuman completion speed flagged. Expert matrix puzzles require a minimum 120s solve window." 
    });
  }

  // --- SERVER-SIDE PROTECTION 2: REACTION ENVELOPE RHYTHM ANALYSIS ---
  const intervals: number[] = [];
  for (let i = 1; i < log.length; i++) {
    intervals.push(log[i].timestamp - log[i - 1].timestamp);
  }

  // Bots input digits at fixed millisecond intervals. Real humans exhibit natural response variation.
  const uniqueIntervals = new Set(intervals);
  if (uniqueIntervals.size < 5 && log.length > 20) {
    return res.status(422).json({ 
      success: false, 
      reason: "Script automation detected: Mechanical rhythm pattern recognized." 
    });
  }

  try {
    // Process on-chain adjustments or state modifications inside your Neon DB here
    return res.status(200).json({ 
      success: true, 
      message: "Game validation checks passed. Computational reward approved." 
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
