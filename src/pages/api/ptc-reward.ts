import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { SECURE_AD_RENAME_MATRIX, getJwtSecret } from '@/lib/ptcConfig';
import { getDb } from '@/lib/db'; // Pulls our unified, serverless-optimized Neon DB connection handle

interface DecodedSession {
  adId: number;
  initiatedAt: number;
  iat: number;
  exp: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, reason: 'Method Not Allowed' });
  }

  try {
    const { adId, sessionToken } = req.body;
    const targetAdId = Number(adId);

    if (!sessionToken) {
      return res.status(401).json({ success: false, reason: 'Access Denied: Missing cryptographic signature.' });
    }

    // 1. Verify token authenticity and signature structure
    const tokenSecret = getJwtSecret();
    let verifiedPayload: DecodedSession;

    try {
      verifiedPayload = jwt.verify(sessionToken, tokenSecret) as DecodedSession;
    } catch (jwtErr) {
      return res.status(403).json({ success: false, reason: 'Access Forbidden: Compromised or expired validation contract.' });
    }

    // 2. Cross-check payload context integrity
    if (verifiedPayload.adId !== targetAdId) {
      return res.status(400).json({ success: false, reason: 'Validation Failure: Context mismatch detected.' });
    }

    // 3. Look up authoritative reward constants directly from server state
    const adConfig = SECURE_AD_RENAME_MATRIX[targetAdId];
    if (!adConfig) {
      return res.status(422).json({ success: false, reason: 'Invalid or unmapped campaign context.' });
    }

    // 4. Temporal Envelope Verification (The Bot Check)
    const currentTime = Date.now();
    const elapsedSeconds = (currentTime - verifiedPayload.initiatedAt) / 1000;
    
    // Add a strict 500ms safety grace margin to avoid minor client network jitter false-positives
    if (elapsedSeconds < (adConfig.timer - 0.5)) {
      console.warn(`[!] Anti-Bot Triggered: Client resolved ad ${targetAdId} in ${elapsedSeconds}s (Required: ${adConfig.timer}s)`);
      return res.status(422).json({
        success: false,
        reason: 'Execution Exception: Speed parameters violate physical reading parameters. (Bot Detected)',
      });
    }

    // 5. Connect to Neon DB to settle rewards
    const sql = getDb();
    
    // Mock user context handle for demo (integrate your actual ironclad NextAuth / session user lookup here)
    const mockUserEmail = "hustler@habacoin.com"; 

    // Update user balance atomically inside Neon DB using structured, injection-safe parameters
    await sql`
      UPDATE users 
      SET total_score = total_score + ${adConfig.reward}
      WHERE email = ${mockUserEmail}
    `;

    return res.status(200).json({
      success: true,
      creditedAmount: adConfig.reward,
      message: 'Cryptographic confirmation settlement complete.',
    });

  } catch (error: any) {
    console.error("[!] Core PTC Payout Protection Exception:", error.message);
    return res.status(500).json({ success: false, reason: 'Internal ledger synchronization failure.' });
  }
}
