import { Context } from "@netlify/edge-functions";
import { neon } from "https://esm.sh/@neondatabase/serverless@0.9.0";

function mapCountryToContinent(country: string): string {
    const mapping: Record<string, string> = {
        'United States': 'North America',
        'Kenya': 'Africa',
        'Nigeria': 'Africa',
        'India': 'Asia-Pacific',
        'Brazil': 'Latin America',
        'Germany': 'Europe'
    };
    return mapping[country] || 'Other';
}

export default async (request: Request, context: Context) => {
  const ua = request.headers.get("user-agent") || "";
  const secMetadata = request.headers.get("sec-fetch-dest");
  const isBot = /bot|spider|crawl|headless|puppeteer/i.test(ua);
  
  if (isBot || (secMetadata && !['document', 'empty'].includes(secMetadata))) {
    return new Response(JSON.stringify({ error: "Identity-signup: Access Denied" }), { status: 403 });
  }

  try {
    const { user } = await request.json();
    if (!user || !user.id) return new Response("Invalid user tracking parameters.", { status: 422 });
    
    const country = context.geo?.country?.name || "Unknown";
    const region = mapCountryToContinent(country);

    const databaseUrl = Deno.env.get("DATABASE_URL");
    if (!databaseUrl) throw new Error("Missing system DATABASE_URL parameter references.");
    const sql = neon(databaseUrl);

    // Hardened database execution mapping parameter fields directly
    const updateResult = await sql`
      UPDATE profiles 
      SET region = ${region}, updated_at = NOW() 
      WHERE id = ${user.id}
      RETURNING id;
    `;

    if (updateResult.length === 0) {
      return new Response("Target account record row missing.", { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, regionMapped: region }), { 
      status: 200, 
      headers: { "Content-Type": "application/json" } 
    });

  } catch (error: any) {
    console.error("[!] Geographic Indexing Sync Processing Error:", error.message);
    return new Response("Geographic registration calculation error.", { status: 500 });
  }
};

export const config = { path: "/api/v1/auth/identity-signup" };
