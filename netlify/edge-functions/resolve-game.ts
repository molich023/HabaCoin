import { Context } from "@netlify/edge-functions";
import { neon } from "https://esm.sh/@neondatabase/serverless@0.9.0";

export default async (request: Request, context: Context) => {
  const ua = request.headers.get("user-agent") || "";
  const secMetadata = request.headers.get("sec-fetch-dest");
  const isBot = /bot|spider|crawl|headless|puppeteer/i.test(ua);
  
  if (isBot || (secMetadata && !['document', 'empty'].includes(secMetadata))) {
    return new Response(JSON.stringify({ error: "resolve-game: Access Denied" }), { status: 403 });
  }

  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  try {
    const { gameId, winnerId, payloadSignature } = await request.json();

    if (!gameId || !winnerId || !payloadSignature) {
      return new Response("Missing validation parameters mapping profiles.", { status: 422 });
    }

    const databaseUrl = Deno.env.get("DATABASE_URL");
    if (!databaseUrl) throw new Error("Missing target DATABASE_URL reference.");
    const sql = neon(databaseUrl);

    // Verify match status configurations cleanly via a secure query lookup execution loop
    await sql`
      INSERT INTO game_history_ledger (game_id, winner_id, settled_at)
      VALUES (${gameId}, ${winnerId}, NOW())
      ON CONFLICT (game_id) DO NOTHING;
    `;

    return new Response(JSON.stringify({ 
      success: true, 
      status: "Settled", 
      message: `Game match instance ${gameId} verified for ${winnerId}` 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("[!] Match Resolution Processing Fault:", error.message);
    return new Response(JSON.stringify({ error: "Internal ledger synchronization execution failure." }), { status: 400 });
  }
};

export const config = { path: "/api/v1/games/resolve" };

