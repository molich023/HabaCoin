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

    // The core 4-asset basket portfolio split matching treasury parameters
    const updates = [
      { name: 'wrapped-bitcoin', price: marketData["wrapped-bitcoin"].usd, weight: 0.50 },
      { name: 'ethereum', price: marketData["ethereum"].usd, weight: 0.25 },
      { name: 'tether', price: marketData["tether"].usd, weight: 0.15 },
      { name: 'klima-dao', price: marketData["klima-dao"].usd, weight: 0.10 }
    ];

    const databaseUrl = Deno.env.get("DATABASE_URL");
    if (!databaseUrl) throw new Error("Missing system DATABASE_URL strings.");
    const sql = neon(databaseUrl);

    let intrinsicHabaBasketValue = 0;

    for (const asset of updates) {
      const assetPrice = parseFloat(asset.price);
      intrinsicHabaBasketValue += assetPrice * asset.weight;

      await sql`
        INSERT INTO asset_prices (asset_name, price_usd, target_weight, last_updated)
        VALUES (${asset.name}, ${assetPrice}, ${asset.weight}, NOW())
        ON CONFLICT (asset_name) 
        DO UPDATE SET price_usd = EXCLUDED.price_usd, target_weight = EXCLUDED.target_weight, last_updated = NOW();
      `;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Haba Backing Reserve Index Synced.",
      calculated_basket_intrinsic_value: intrinsicHabaBasketValue
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("[!] Reserve Oracle Synchronization Error:", error.message);
    return new Response(JSON.stringify({ error: "Failed to pull current index backing calculations." }), { status: 500 });
  }
};

export const config = { path: "/api/v1/oracle/sync-assets" };
