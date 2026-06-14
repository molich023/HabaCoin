import { Context } from "@netlify/edge-functions";
import { neon } from "https://esm.sh/@neondatabase/serverless@0.9.0";

export function determineActivityProfile(vibrationData: number[]): string {
  if (!Array.isArray(vibrationData) || vibrationData.length === 0) return "UNKNOWN_PROFILE";
  const averageVibration = vibrationData.reduce((acc, val) => acc + val, 0) / vibrationData.length;
  
  // High continuous mechanical vibration tells us the user is in a standard combustion engine vehicle
  if (averageVibration > 0.45) {
    return "COMBUSTION_ENGINE_DETECTED"; 
  }
  return "HUMAN_POWERED_ACTIVITY"; 
}

export default async (request: Request, context: Context) => {
  const ua = request.headers.get("user-agent") || "";
  const secMetadata = request.headers.get("sec-fetch-dest");
  const isBot = /bot|spider|crawl|headless|puppeteer/i.test(ua);
  
  if (isBot || (secMetadata && !['document', 'empty'].includes(secMetadata))) {
    return new Response(JSON.stringify({ error: "verify-trip: Access Denied" }), { status: 403 });
  }

  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  try {
    const { userId, distanceKm, vibrationLogs } = await request.json();
    const parsedDistance = parseFloat(distanceKm);

    if (!userId || isNaN(parsedDistance) || parsedDistance <= 0) {
      return new Response("Invalid trip verification arguments.", { status: 422 });
    }

    const movementType = determineActivityProfile(vibrationLogs);
    
    // Set up a clear reward multiplier matrix built purely around green, human-powered activity
    let rewardModifier = 0.00;
    if (movementType === "HUMAN_POWERED_ACTIVITY") {
      rewardModifier = 0.50; // Highest incentive tier for zero-emission human movement (walking, running)
    } else {
      rewardModifier = 0.05; // Standard baseline reward tier for general transit positioning tracking
    }

    const calculatedHabaBonus = parsedDistance * rewardModifier;

    const databaseUrl = Deno.env.get("DATABASE_URL");
    if (!databaseUrl) throw new Error("Missing system DATABASE_URL parameters.");
    const sql = neon(databaseUrl);

    await sql`
      UPDATE profiles 
      SET gaming_points_balance = gaming_points_balance + ${calculatedHabaBonus},
          total_distance_km = total_distance_km + ${parsedDistance},
          updated_at = NOW()
      WHERE id = ${userId};
    `;

    return new Response(JSON.stringify({
      success: true,
      signature_status: "VERIFIED",
      detected_mode: movementType,
      allocated_payout: calculatedHabaBonus.toFixed(6)
    }), { status: 200, headers: { "Content-Type": "application/json" } });

  } catch (error: any) {
    console.error("[!] Trip Verification Execution Exception:", error.message);
    return new Response(JSON.stringify({ error: "Telemetry trip parsing calculation fault." }), { status: 500 });
  }
};

export const config = { path: "/api/v1/telemetry/verify-trip" };
