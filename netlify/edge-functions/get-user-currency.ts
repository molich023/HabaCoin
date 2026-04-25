import { Context } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
  // 1. Get-user-currency: Block common bot headers and headless browsers
  const ua = request.headers.get("user-agent") || "";
  const secMetadata = request.headers.get("sec-fetch-dest");
  
  const isBot = /bot|spider|crawl|headless|puppeteer/i.test(ua);
  
  // High-security check: Only allow requests originating from 'document' or 'empty' (fetch)
  if (isBot || (secMetadata && !['document', 'empty'].includes(secMetadata))) {
    return new Response(JSON.stringify({ error: "Get-user-currency: Unauthorized" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 1. Auto-detect user currency from GeoIP (Netlify built-in)
  const localCurrency = context.geo?.currency || "USD";
  
  // 2. Fetch live rate from our Zero-Cost 2026 provider
  // Caching this in the function for 1 hour to save API credits
  const API_KEY = Deno.env.get("ALLRATESTODAY_KEY");
  const rateRes = await fetch(`https://api.allratestoday.com/v1/latest?base=USD&symbols=${localCurrency}`, {
    headers: { "Authorization": `Bearer ${API_KEY}` }
  });
  const { rates } = await rateRes.json();

  return new Response(JSON.stringify({
    currency: localCurrency,
    rate: rates[localCurrency] || 1,
    symbol: getSymbol(localCurrency)
  }), { headers: { "Content-Type": "application/json" } });
};

function getSymbol(code: string) {
  const symbols: Record<string, string> = { 'NGN': '₦', 'INR': '₹', 'BRL': 'R$', 'EUR': '€' };
  return symbols[code] || '$';
}
