import { Context } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
  // 1. ptc-reward: Block common bot headers and headless browsers
  const ua = request.headers.get("user-agent") || "";
  const secMetadata = request.headers.get("sec-fetch-dest");
  
  const isBot = /bot|spider|crawl|headless|puppeteer/i.test(ua);
  
  // High-security check: Only allow requests originating from 'document' or 'empty' (fetch)
  if (isBot || (secMetadata && !['document', 'empty'].includes(secMetadata))) {
    return new Response(JSON.stringify({ error: "ptc-reward: Unauthorized" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }

  const { reward } = await request.json();
  const user = context.app.identity?.user;

  if (!user) return new Response("Unauthorized", { status: 401 });

  // Update Neon DB using the RLS-protected Data API
  const DATABASE_URL = Deno.env.get("DATABASE_URL");
  
  await fetch(`${DATABASE_URL}/query`, {
    method: "POST",
    body: JSON.stringify({
      query: "UPDATE profiles SET balance = balance + $1 WHERE id = $2",
      params: [reward, user.id]
    })
  });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
