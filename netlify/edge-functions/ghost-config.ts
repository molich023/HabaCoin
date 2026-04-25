import { Context } from "@netlify/edge-functions";

/**
 * Ghost Oracle: Secure Config Gate
 * Uses 'export default' to satisfy Netlify's Edge API requirements.
 */
export default async (request: Request, context: Context) => {
  // 1. Ghost Security Check: Detect if the request is from a known bot/emulator
  const userAgent = request.headers.get("user-agent") || "";
  const isSuspicious = userAgent.includes("Headless") || userAgent.includes("Puppeteer");

  if (isSuspicious) {
    return new Response(JSON.stringify({ error: "Ghost Protocol: Access Denied" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 2. Return Secure Config
  const config = {
    haba_node_url: Deno.env.get("POLYGON_RPC_URL"),
    oracle_v: "1.0.4-monstrous",
    mesh_sync_enabled: true
  };

  return new Response(JSON.stringify(config), {
    status: 200,
    headers: { 
      "Content-Type": "application/json",
      "X-Haba-Signature": "ghost_verified" 
    }
  });
};

// Configuration for Netlify routing
export const config = { path: "/api/ghost-config" };
