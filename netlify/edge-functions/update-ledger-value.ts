import { Context } from "https://edge.netlify.com";
import { neon } from "https://esm.sh/@neondatabase/serverless@0.9.0";

export default async function handler(request: Request, context: Context) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // Security Verification: Validate incoming auth payload header tokens
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || authHeader !== `Bearer ${Deno.env.get("HABA_EDGE_SECRET")}`) {
    return new Response("Unauthorized Edge Transaction Access Attempt blocked.", { status: 401 });
  }

  try {
    const { calculatedPrice } = await request.json();

    if (!calculatedPrice || typeof calculatedPrice !== "number") {
      return new Response("Malformed indexing evaluation parameters.", { status: 422 });
    }

    // Connect securely to Neon DB using the stateless HTTP driver optimized for global Edge isolations
    const databaseUrl = Deno.env.get("DATABASE_URL");
    if (!databaseUrl) throw new Error("Missing system DATABASE_URL variables.");
    const sql = neon(databaseUrl);

    // Persist the calculated value directly to the global parameter cache
    await sql`
      INSERT INTO system_configurations (config_key, config_value, updated_at)
      VALUES ('HABA_USDT_PRICE', ${calculatedPrice.toString()}, NOW())
      ON CONFLICT (config_key) 
      DO UPDATE SET config_value = EXCLUDED.config_value, updated_at = NOW();
    `;

    return new Response(
      JSON.stringify({ success: true, message: "System index parameter states synced successfully." }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export const config = { path: "/api/v1/admin/sync-ledger-index" };
