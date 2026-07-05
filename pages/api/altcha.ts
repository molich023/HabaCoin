import type { NextApiRequest, NextApiResponse } from "next";
import { createChallenge } from "altcha-lib";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Enforce protocol GET parameters for challenge fetching
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const hmacSecret = process.env.ALTCHA_HMAC_KEY;
    if (!hmacSecret) {
      console.error("❌ ALTCHA_HMAC_KEY is missing from server configurations.");
      return res.status(500).json({ error: "Server infrastructure misconfigured." });
    }

    // Generate cryptographically signed Proof-of-Work puzzle parameters
    const challenge = await createChallenge({
      hmacSignatureSecret: hmacSecret,
      maxNumber: 50000, // Balanced puzzle scale for mid-range smartphones
      expires: new Date(Date.now() + 15 * 60 * 1000), // Challenge remains valid for 15 minutes
    });

    // Enforce CORS isolation constraints and pass payload to client
    res.setHeader("Cache-Control", "no-store, max-age=0, must-revalidate");
    return res.status(200).json(challenge);

  } catch (error) {
    console.error("❌ ALTCHA challenge generation fault:", error);
    return res.status(500).json({ error: "Failed to allocate cryptographic challenge structure." });
  }
}
