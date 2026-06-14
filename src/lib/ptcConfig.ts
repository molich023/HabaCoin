export interface AdvertisementConfig {
  id: number;
  title: string;
  reward: number; // Server-controlled token weight
  timer: number;  // Minimum mandatory completion time in seconds
}

export const SECURE_AD_RENAME_MATRIX: Record<number, AdvertisementConfig> = {
  1: { id: 1, title: "Explore Polygon DeFi Ecosystem", reward: 50, timer: 15 },
  2: { id: 2, title: "Hustle Network Intelligence Newsletter", reward: 25, timer: 10 },
};

// Hardened fallback secret key matrix for signing temporal handshakes
export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET_SIGNING_KEY;
  if (!secret) {
    // Fail-secure: Block server start if signature key is missing
    throw new Error("[CRITICAL] JWT_SECRET_SIGNING_KEY environment variable is unassigned.");
  }
  return secret;
};
