import { Context } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
  // 1. Identity-signup: Block common bot headers and headless browsers
  const ua = request.headers.get("user-agent") || "";
  const secMetadata = request.headers.get("sec-fetch-dest");
  
  const isBot = /bot|spider|crawl|headless|puppeteer/i.test(ua);
  
  // High-security check: Only allow requests originating from 'document' or 'empty' (fetch)
  if (isBot || (secMetadata && !['document', 'empty'].includes(secMetadata))) {
    return new Response(JSON.stringify({ error: "Identity-signup: Unauthorized" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }

  const { user } = await request.json();
  
  // Netlify automatically provides the country of the user in the 'geo' object
  const country = context.geo?.country?.name || "Unknown";
  
  // Map country to Continent for our Leaderboard
  const region = mapCountryToContinent(country);

  const DATABASE_URL = Deno.env.get("DATABASE_URL");
  
  await fetch(`${DATABASE_URL}/query`, {
    method: "POST",
    body: JSON.stringify({
      query: "UPDATE profiles SET region = $1 WHERE id = $2",
      params: [region, user.id]
    })
  });

  return new Response("Region Sync Complete", { status: 200 });
};

// Helper to keep the "Global Hustle" organized
function mapCountryToContinent(country: string): string {
    const mapping: Record<string, string> = {
        'United States': 'North America',
        'Nigeria': 'Africa',
        'India': 'Asia-Pacific',
        'Brazil': 'Latin America',
        'Germany': 'Europe'
        // Add more common ones here
    };
    return mapping[country] || 'Other';
}
