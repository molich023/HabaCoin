import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { wallet, signature, message, captcha } = req.body;

  try {
    // Cryptographically derive the authentic signing address from the signature string
    const recoveredAddress = ethers.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== wallet.toLowerCase()) {
      return res.status(401).json({ error: 'Cryptographic identity validation failed.' });
    }

    // Handshake Success: Profile linked
    return res.status(200).json({ status: 'AUTHORIZED', wallet: recoveredAddress });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
