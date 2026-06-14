import { Context } from "@netlify/edge-functions";
import { neon } from "https://esm.sh/@neondatabase/serverless@0.9.0";

export default async (request: Request, context: Context) => {
  const ua = request.headers.get("user-agent") || "";
  const secMetadata = request.headers.get("sec-fetch-dest");
  const isBot = /bot|spider|crawl|headless|puppeteer/i.test(ua);
  
  if (isBot || (secMetadata && !['document', 'empty'].includes(secMetadata))) {
    return new Response(JSON.stringify({ error: "p2p-lookup: Access Denied" }), { status: 403 });
  }

  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  try {
    const { targetedPhoneHash } = await request.json();

    // Verify input matches a standard SHA-256 hash formatting layout (exactly 64 characters)
    if (!targetedPhoneHash || targetedPhoneHash.length !== 64) {
      return new Response(JSON.stringify({ error: "Invalid hash format structures raw fields." }), { status: 422 });
    }

    const databaseUrl = Deno.env.get("DATABASE_URL");
    if (!databaseUrl) throw new Error("Missing structural system database flags.");
    const sql = neon(databaseUrl);

    // Privacy Preserving Lookup Strategy: Query against the hash to prevent text leaks
    const matches = await sql`
      SELECT id, wallet_address, is_verified 
      FROM profiles 
      WHERE phone_hash = ${targetedPhoneHash} 
      LIMIT 1;
    `;

    if (matches.length === 0) {
      return new Response(JSON.stringify({ is_user: false, message: "Target footprint is not an active registration." }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    const targetedMatchRecord = matches[0];
    return new Response(JSON.stringify({
      is_user: true,
      profile_uid: targetedMatchRecord.id,
      wallet: targetedMatchRecord.wallet_address || "0x0000000000000000000000000000000000000000"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("[!] P2P Contact Lookup Flow Interrupted:", error.message);
    return new Response(JSON.stringify({ error: "Secure matching operation failure." }), { status: 500 });
  }
};

export const config = { path: "/api/v1/p2p/contact-lookup" };
