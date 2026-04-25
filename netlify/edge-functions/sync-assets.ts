import { Context } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
  // 1. sync-assets: Block common bot headers and headless browsers
  const ua = request.headers.get("user-agent") || "";
  const secMetadata = request.headers.get("sec-fetch-dest");
  
  const isBot = /bot|spider|crawl|headless|puppeteer/i.test(ua);
  
  // High-security check: Only allow requests originating from 'document' or 'empty' (fetch)
  if (isBot || (secMetadata && !['document', 'empty'].includes(secMetadata))) {
    return new Response(JSON.stringify({ error: "sync-assets: Unauthorized" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 1. Fetch Bitcoin from CoinGecko
  const btcRes = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
  const btcData = await btcRes.json();

  // 2. Fetch Gold & Uranium from Metals-API (Using your free API Key)
  const METALS_KEY = Deno.env.get("METALS_API_KEY");
  const metalsRes = await fetch(`https://metals-api.com/api/latest?access_key=${METALS_KEY}&base=USD&symbols=XAU,XAG,URANIUM`);
  const metalsData = await metalsRes.json();

  // 3. Connect to Neon DB
  const DATABASE_URL = Deno.env.get("DATABASE_URL");
  
  const updates = [
    { name: 'bitcoin', price: btcData.bitcoin.usd },
    { name: 'gold', price: 1 / metalsData.rates.XAU }, // Convert rate to USD
    { name: 'uranium', price: 1 / metalsData.rates.URANIUM }
  ];

  for (const asset of updates) {
    await fetch(`${DATABASE_URL}/query`, {
      method: "POST",
      body: JSON.stringify({
        query: "UPDATE asset_prices SET price_usd = $1, last_updated = now() WHERE asset_name = $2",
        params: [asset.price, asset.name]
      })
    });
  }

  return new Response("Haba Oracle: Assets Synchronized.", { status: 200 });
};
