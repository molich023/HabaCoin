import { Context } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
  // 1. Ghost Detection: Block common bot headers and headless browsers
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

  // 2. Serve Monstrous Config
  const securePayload = {
    chain_id: 137, // Polygon Mainnet
    rpc_proxy: Deno.env.get("POLYGON_RPC_URL"),
    haba_contract: "YOUR_DEPLOYED_CONTRACT_ADDRESS",
    oracle_heartbeat: Date.now()
  };

  return new Response(JSON.stringify(securePayload), {
    status: 200,
    headers: { 
      "Content-Type": "application/json",
      "Cache-Control": "private, max-age=3600"
    }
  });
};
