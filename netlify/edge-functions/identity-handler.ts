import { Context } from "@netlify/edge-functions";
import { neon } from "https://esm.sh/@neondatabase/serverless@0.9.0";

export default async (request: Request, context: Context) => {
  const ua = request.headers.get("user-agent") || "";
  const secMetadata = request.headers.get("sec-fetch-dest");
  const isBot = /bot|spider|crawl|headless|puppeteer/i.test(ua);
  
  if (isBot || (secMetadata && !['document', 'empty'].includes(secMetadata))) {
    return new Response(JSON.stringify({ error: "Identity-handler: Access Denied" }), { status: 403 });
  }

  const eventType = request.headers.get("X-Netlify-Event");
  if (!eventType) return new Response("Missing identity signature validation templates.", { status: 400 });

  try {
    const { user } = await request.json();
    if (!user || !user.email || !user.id) return new Response("Malformed schema parsing input contract.", { status: 422 });

    // Block automated transient and disposable burner account setups
    const emailDomain = user.email.split('@')[1] || "";
    const blockedDomains = ["tempmail.com", "throwawaymail.com", "guerrillamail.com"];
    
    if (blockedDomains.includes(emailDomain.toLowerCase())) {
       return new Response(JSON.stringify({ error: "Disposable email registration routes blocked." }), { status: 403 });
    }

    const databaseUrl = Deno.env.get("DATABASE_URL");
    if (!databaseUrl) throw new Error("Missing system DATABASE_URL parameters.");
    const sql = neon(databaseUrl);

    switch (eventType) {
      case "signup":
        await sql`
          INSERT INTO profiles (id, email, gaming_points_balance, mesh_reputation_score, created_at)
          VALUES (${user.id}, ${user.email}, 0.00, 10, NOW())
          ON CONFLICT (id) DO NOTHING;
        `;
        break;

      case "login":
        await sql`
          UPDATE profiles 
          SET last_login_at = NOW() 
          WHERE id = ${user.id};
        `;
        break;

      default:
        return new Response("Event signature processing cleared.", { status: 200 });
    }

    return new Response("Identity transaction synchronized successfully.", { status: 200 });

  } catch (error: any) {
    console.error("[!] System Webhook Sync Error:", error.message);
    return new Response("Ecosystem internal registration parsing failure.", { status: 500 });
  }
};

export const config = { path: "/api/v1/auth/identity-webhook" };
