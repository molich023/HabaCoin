import { Context } from "@netlify/edge-functions";

function getSymbol(code: string): string {
  const symbols: Record<string, string> = { 'NGN': '₦', 'INR': '₹', 'BRL': 'R$', 'EUR': '€', 'ZAR': 'R' };
  return symbols[code] || '$';
}

export default async (request: Request, context: Context) => {
  const ua = request.headers.get("user-agent") || "";
  const secMetadata = request.headers.get("sec-fetch-dest");
  const isBot = /bot|spider|crawl|headless|puppeteer|selenium/i.test(ua);
  
  if (isBot || (secMetadata && !['document', 'empty'].includes(secMetadata))) {
    return new Response(JSON.stringify({ error: "Get-user-currency: Access Denied" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // Auto-detect currency via Netlify Edge location contexts
    const localCurrency = context.geo?.currency || "USD";
    const apiKey = Deno.env.get("ALLRATESTODAY_KEY");
    
    if (!apiKey) throw new Error("Missing target token access credentials.");

    const rateRes = await fetch(`https://api.allratestoday.com/v1/latest?base=USD&symbols=${localCurrency}`, {
      headers: { "Authorization": `Bearer ${apiKey}` }
    });

    let conversionRate = 1;
    if (rateRes.ok) {
      const payload = await rateRes.json();
      if (payload?.rates && payload.rates[localCurrency]) {
        conversionRate = payload.rates[localCurrency];
      }
    }

    return new Response(JSON.stringify({
      currency: localCurrency,
      rate: conversionRate,
      symbol: getSymbol(localCurrency),
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600" // Strict Edge caching to protect rate limits
      }
    });

  } catch (error: any) {
    console.error("[!] Regional Currency Inference Fault:", error.message);
    return new Response(JSON.stringify({ currency: "USD", rate: 1, symbol: "$" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const config = { path: "/api/v1/user/currency" };
