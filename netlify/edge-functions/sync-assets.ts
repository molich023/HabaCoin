import { Context } from "@netlify/edge-functions";
import { neon } from "https://esm.sh/@neondatabase/serverless@0.9.0";

const COINGECKO_INDEX_FEED = "https://api.coingecko.com/api/v3/simple/price?ids=wrapped-bitcoin,ethereum,tether,klima-dao&vs_currencies=usd";

export default async (request: Request, context: Context) => {
  const ua = request.headers.get("user-agent") || "";
  const secMetadata = request.headers.get("sec-fetch-dest");
  const isBot = /bot|spider|crawl|headless|puppeteer/i.test(ua);
  
  if (isBot || (secMetadata && !['document', 'empty'].includes(secMetadata))) {
    return new Response(JSON.stringify({ error: "sync-assets: Access Denied" }), { status: 403 });
  }

  try {
    const response = await fetch(COINGECKO_INDEX_FEED);
    if (!response.ok) throw new Error("External multi-asset marketplace oracle offline.");
    
    const marketData = await response.json();

    const updates = [
      { name: 'wrapped-bitcoin', price: marketData["wrapped-bitcoin"].usd },
      { name: 'ethereum', price: marketData["ethereum"].usd },
      { name: 'tether', price: marketData["tether"].usd },
      { name: 'klima-dao', price: marketData["klima-dao"].usd } // 10% On-Chain Green Asset Allocation
    ];

    const databaseUrl = Deno.env.get("DATABASE_URL");
    if (!databaseUrl) throw new Error("Missing system DATABASE_URL strings.");
    const sql = neon(databaseUrl);

    for (const asset of updates) {
      await sql`
        INSERT INTO asset_prices (asset_name, price_usd, last_updated)
        VALUES (${asset.name}, ${parseFloat(asset.price)}, NOW())
        ON CONFLICT (asset_name) 
        DO UPDATE SET price_usd = EXCLUDED.price_usd, last_updated = NOW();
      `;
    }

    return new Response(JSON.stringify({ success: true, message: "Haba Backing Reserve Index Synced." }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("[!] Reserve Oracle Synchronization Error:", error.message);
    return new Response(JSON.stringify({ error: "Failed to pull current index backing calculations." }), { status: 500 });
  }
};

export const config = { path: "/api/v1/oracle/sync-assets" };
