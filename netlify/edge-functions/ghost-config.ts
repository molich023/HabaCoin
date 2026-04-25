import { Context } from "@netlify/edge-functions";

// The "Default Export" is mandatory for Edge Functions
export default async (request: Request, context: Context) => {
  try {
  // This file defines the "Stealth" rules for the Matrix chat
  const GHOST_SETTINGS = {
    burnRate: 0.02,           // The 2% Ghost Tax
    encryption: "AES-256-GCM",
    sessionTimeout: "1h",     // Messages vanish from RAM after 1 hour
    minKarma: 50              // Minimum Karma needed to enter Ghost Chat
  };

  return new Response(JSON.stringify(GHOST_SETTINGS), {
    headers: { "Content-Type": "application/json" }
  });
};
