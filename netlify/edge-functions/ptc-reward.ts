import { Context } from "@netlify/edge-functions";
import { neon } from "https://esm.sh/@neondatabase/serverless@0.9.0";

export default async (request: Request, context: Context) => {
  const ua = request.headers.get("user-agent") || "";
  const secMetadata = request.headers.get("sec-fetch-dest");
  const isBot = /bot|spider|crawl|headless|puppeteer/i.test(ua);
  
  if (isBot || (secMetadata && !['document', 'empty'].includes(secMetadata))) {
    return new Response(JSON.stringify({ error: "ptc-reward: Access Denied" }), { status: 403 });
  }

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const user = context.app?.identity?.user;
  if (!user || !user.id) return new Response("Unauthorized profile handle.", { status: 401 });

  try {
    const { reward } = await request.json();
    const parsedReward = parseFloat(reward);

    // Strict Input Validation Guardrail
    if (isNaN(parsedReward) || parsedReward <= 0 || parsedReward > 5.0) {
      return new Response(JSON.stringify({ error: "Reward amount out of bounds." }), { status: 422 });
    }

    const databaseUrl = Deno.env.get("DATABASE_URL");
    if (!databaseUrl) throw new Error("Missing DATABASE_URL string configuration.");
    const sql = neon(databaseUrl);

    // Parameterized increment tracking execution task
    await sql`
      UPDATE profiles 
      SET gaming_points_balance = gaming_points_balance + ${parsedReward}, updated_at = NOW() 
      WHERE id = ${user.id};
    `;

    return new Response(JSON.stringify({ success: true, rewardClaimed: parsedReward }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("[!] Reward Distribution Fault:", error.message);
    return new Response(JSON.stringify({ error: "Ledger transaction process aborted." }), { status: 500 });
  }
};

export const config = { path: "/api/v1/rewards/claim-ptc" };

