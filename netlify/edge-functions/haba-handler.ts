import { Context } from "@netlify/edge-functions";
import { neon } from "https://esm.sh/@neondatabase/serverless@0.9.0";

export default async (request: Request, context: Context) => {
  const ua = request.headers.get("user-agent") || "";
  const secMetadata = request.headers.get("sec-fetch-dest");
  const isBot = /bot|spider|crawl|headless|puppeteer/i.test(ua);
  
  if (isBot || (secMetadata && !['document', 'empty'].includes(secMetadata))) {
    return new Response(JSON.stringify({ error: "haba-handlers: Access Denied" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }

  const url = new URL(request.url);
  const user = context.app?.identity?.user;

  if (url.pathname === "/api/profile") {
    if (!user || !user.id) {
      return new Response(JSON.stringify({ error: "Authentication credentials missing." }), { status: 401 });
    }

    try {
      const databaseUrl = Deno.env.get("DATABASE_URL");
      if (!databaseUrl) throw new Error("Missing system DATABASE_URL parameters.");
      const sql = neon(databaseUrl);

      // Safe parameterized verification upsert loop
      await sql`
        INSERT INTO profiles (id, email, gaming_points_balance, mesh_reputation_score, is_verified, created_at)
        VALUES (${user.id}, ${user.email || ""}, 0.00, 10, FALSE, NOW())
        ON CONFLICT (id) DO NOTHING;
      `;

      return new Response(JSON.stringify({ 
        success: true,
        msg: "Profile synced securely with ecosystem ledger.", 
        userId: user.id 
      }), { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      });

    } catch (error: any) {
      console.error("[!] Neon Profile Sync Exception:", error.message);
      return new Response(JSON.stringify({ error: "Ledger writing system execution error." }), { status: 500 });
    }
  }

  return context.next();
};

export const config = { path: "/api/profile" };
