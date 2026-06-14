
import { Context } from "@netlify/edge-functions";
import { neon } from "https://esm.sh/@neondatabase/serverless@0.9.0";

export default async (request: Request, context: Context) => {
  // 1. Defend Against Bot Vectors and Automated Headless Crawlers
  const ua = request.headers.get("user-agent") || "";
  const secMetadata = request.headers.get("sec-fetch-dest");
  const isBot = /bot|spider|crawl|headless|puppeteer|selenium|chromedriver/i.test(ua);
  
  if (isBot || (secMetadata && !['document', 'empty'].includes(secMetadata))) {
    return new Response(JSON.stringify({ error: "currency-sync: Access Denied" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const apiKey = Deno.env.get("FREECURRENCYAPI_KEY");
    if (!apiKey) throw new Error("Missing FREECURRENCYAPI_KEY configuration variable.");

    // Fetch live target conversion rates for primary regional hubs
    const res = await fetch(`https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}&currencies=NGN,INR,BRL,EUR,ZAR`);
    if (!res.ok) throw new Error("External currency matrix provider offline.");
    
    const responsePayload = await res.json();
    const rates = responsePayload.data;

    if (!rates) throw new Error("Malformed raw rate payload format received.");

    const databaseUrl = Deno.env.get("DATABASE_URL");
    if (!databaseUrl) throw new Error("Missing system DATABASE_URL parameters.");
    const sql = neon(databaseUrl);

    // Atomically UPSERT pricing states directly inside Neon DB
    for (const [currencyCode, rateValue] of Object.entries(rates)) {
      await sql`
        INSERT INTO system_configurations (config_key, config_value, updated_at)
        VALUES (${`RATE_${currencyCode}`}, ${String(rateValue)}, NOW())
        ON CONFLICT (config_key) 
        DO UPDATE SET config_value = EXCLUDED.config_value, updated_at = NOW();
      `;
    }

    return new Response(JSON.stringify({ success: true, message: "Global hubs currency sync complete." }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("[!] Currency Sync Engine Exception:", error.message);
    return new Response(JSON.stringify({ error: "Internal processing syncing fault." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const config = { path: "/api/v1/sync-currencies" };
