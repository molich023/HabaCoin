import { Context } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
  const ua = request.headers.get("user-agent") || "";
  const secMetadata = request.headers.get("sec-fetch-dest");
  const isBot = /bot|spider|crawl|headless|puppeteer/i.test(ua);
  
  if (isBot || (secMetadata && !['document', 'empty'].includes(secMetadata))) {
    return new Response(JSON.stringify({ error: "Ghost Protocol: Access Denied" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }

  const securePayload = {
    chain_id: 137, // Polygon Mainnet
    rpc_proxy: "/api/v1/rpc/proxy", // Shields real RPC nodes behind internal route setups
    haba_contract: "0x2B92Fd893E6CfFFe81403FFdBbB01CEc312760E2", // Fixed production contract placement
    oracle_heartbeat: Date.now()
  };

  return new Response(JSON.stringify(securePayload), {
    status: 200,
    headers: { 
      "Content-Type": "application/json",
      "Cache-Control": "private, max-age=1800", // Standard client caching limit
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY"
    }
  });
};

export const config = { path: "/api/v1/system/ghost-config" };
