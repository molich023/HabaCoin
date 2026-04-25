import { Context } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
  // 1. currency-sync: Block common bot headers and headless browsers
  const ua = request.headers.get("user-agent") || "";
  const secMetadata = request.headers.get("sec-fetch-dest");
  
  const isBot = /bot|spider|crawl|headless|puppeteer/i.test(ua);
  
  // High-security check: Only allow requests originating from 'document' or 'empty' (fetch)
  if (isBot || (secMetadata && !['document', 'empty'].includes(secMetadata))) {
    return new Response(JSON.stringify({ error: "Ghost Protocol: Unauthorized" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Fetch rates for our top 5 global hustle regions
  const res = await fetch(`https://api.freecurrencyapi.com/v1/latest?apikey=YOUR_KEY&currencies=NGN,INR,BRL,EUR,ZAR`);
  const { data } = await res.json();

  // Store these in Neon so the frontend doesn't have to call the API 1,000 times
  // This keeps us under the "Free Tier" limit forever.
};
