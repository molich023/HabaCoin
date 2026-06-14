import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { SECURE_AD_RENAME_MATRIX, getJwtSecret } from '@/lib/ptcConfig';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Enforce rigid request method boundaries
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, reason: 'Method Not Allowed' });
  }

  try {
    const { adId } = req.body;
    const targetAdId = Number(adId);

    // OWASP Input Sanitization: Validate against arbitrary integer mappings
    const adConfig = SECURE_AD_RENAME_MATRIX[targetAdId];
    if (!adConfig) {
      return res.status(422).json({ success: false, reason: 'Invalid or missing campaign reference ID.' });
    }

    // Generate a secure, short-lived payload contract
    const sessionPayload = {
      adId: adConfig.id,
      initiatedAt: Date.now(), // Secure server-side origin timestamp
    };

    // Encrypt the transaction contract into a 5-minute transient window
    const tokenSecret = getJwtSecret();
    const sessionToken = jwt.sign(sessionPayload, tokenSecret, { expiresIn: '5m' });

    return res.status(200).json({
      success: true,
      sessionToken,
    });
  } catch (error: any) {
    console.error("[!] Core PTC Session Error:", error.message);
    return res.status(500).json({ success: false, reason: 'Internal server initialization fault.' });
  }
}
