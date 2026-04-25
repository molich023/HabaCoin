import { Context } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
  // 1. Verify-spow: Block common bot headers and headless browsers
  const ua = request.headers.get("user-agent") || "";
  const secMetadata = request.headers.get("sec-fetch-dest");
  
  const isBot = /bot|spider|crawl|headless|puppeteer/i.test(ua);
  
  // High-security check: Only allow requests originating from 'document' or 'empty' (fetch)
  if (isBot || (secMetadata && !['document', 'empty'].includes(secMetadata))) {
    return new Response(JSON.stringify({ error: "verify-spow: Unauthorized" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }

  const { userAddress, nonce, solution } = await request.json();

  // 1. PULL LIVE ENERGY STRENGTH (The 'Synthetic' Pegs)
  // We include Solar and Wind as "Clean Mining" boosts
  const solarFactor = 145.20; 
  const windFactor = 0.92;
  const btcPrice = 77000;
  
  // Calculate the "Energy Strength" Multiplier
  const energyStrength = (solarFactor * 0.2) + (windFactor * 10) + (btcPrice / 100000);

  // 2. VERIFY THE PUZZLE (SPoW)
  // In a real SPoW, we check if SHA256(userAddress + nonce) matches the target
  const isValid = verifyPuzzle(userAddress, nonce, solution); 

  if (isValid) {
    const reward = (0.5 * energyStrength).toFixed(4); // Base reward * Multiplier
    
    // 3. TRIGGER NEON DB UPDATE (Add HABA to User Balance)
    // (Database call to update user profile goes here)

    return new Response(JSON.stringify({
      success: true,
      reward: reward,
      new_multiplier: energyStrength.toFixed(2)
    }));
  }

  return new Response(JSON.stringify({ success: false, error: "Invalid Work" }));
};

function verifyPuzzle(addr, n, sol) {
    // Basic verification logic for the mobile puzzle
    return true; // Placeholder for our SPoW algorithm
}
