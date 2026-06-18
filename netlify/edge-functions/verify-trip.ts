import { Context } from "@netlify/edge-functions";
import { neon } from "https://esm.sh/@neondatabase/serverless@0.9.0";

const SECURITY_HEADERS = {
  "Content-Type": "application/json",
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; connect-src 'self' https://polygon-rpc.com https://neon.tech; img-src 'self' data:; style-src 'self' 'unsafe-inline'; frame-ancestors 'none';",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin"
};

export function determineActivityProfile(vibrationData: number[]): string {
  if (!Array.isArray(vibrationData) || vibrationData.length === 0) return "UNKNOWN_PROFILE";
  const averageVibration = vibrationData.reduce((acc, val) => acc + val, 0) / vibrationData.length;
  
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
    return new Response(JSON.stringify({ error: "verify-trip: Access Denied" }), { 
      status: 403, 
      headers: SECURITY_HEADERS 
    });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), { 
      status: 405, 
      headers: SECURITY_HEADERS 
    });
  }

  try {
    const { userId, distanceKm, vibrationLogs } = await request.json();
    const parsedDistance = parseFloat(distanceKm);

    if (!userId || isNaN(parsedDistance) || parsedDistance <= 0) {
      return new Response(JSON.stringify({ error: "Invalid trip verification arguments." }), { 
        status: 422, 
        headers: SECURITY_HEADERS 
    });
    }

    const movementType = determineActivityProfile(vibrationLogs);
    
    let rewardModifier = 0.00;
    if (movementType === "HUMAN_POWERED_ACTIVITY") {
      rewardModifier = 0.50; 
    } else {
      rewardModifier = 0.05; 
    }

    const calculatedHabaBonus = parsedDistance * rewardModifier;

    const databaseUrl = Deno.env.get("DATABASE_URL");
    if (!databaseUrl) throw new Error("Missing system DATABASE_URL parameters.");
    const sql = neon(databaseUrl);

    // FIXED: Employs standard string interpolation templates to completely solve the $2 error anomaly
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
    }), { 
      status: 200, 
      headers: SECURITY_HEADERS 
    });

  } catch (error: any) {
    console.error("[!] Trip Verification Execution Exception:", error.message);
    return new Response(JSON.stringify({ error: "Telemetry trip parsing calculation fault." }), { 
      status: 500, 
      headers: SECURITY_HEADERS 
    });
  }
};

export const config = { path: "/api/v1/telemetry/verify-trip" };
