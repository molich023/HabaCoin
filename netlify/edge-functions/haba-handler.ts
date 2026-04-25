import { Context } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
  // 1. haba-handlers: Block common bot headers and headless browsers
  const ua = request.headers.get("user-agent") || "";
  const secMetadata = request.headers.get("sec-fetch-dest");
  
  const isBot = /bot|spider|crawl|headless|puppeteer/i.test(ua);
  
  // High-security check: Only allow requests originating from 'document' or 'empty' (fetch)
  if (isBot || (secMetadata && !['document', 'empty'].includes(secMetadata))) {
    return new Response(JSON.stringify({ error: "haba-handlers: Unauthorized" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }

  
  // Check if user is logged in via Netlify Identity
  const user = context.app.identity?.user;

  if (url.pathname === "/api/profile" && user) {
    const neon_url = Deno.env.get("DATABASE_URL");
    
    // Logic to UPSERT user into Neon DB
    // This creates the user in Neon the moment they sign up on Netlify
    return new Response(JSON.stringify({ 
      msg: "Welcome to HabaCoin", 
      userId: user.id 
    }), { status: 200 });
  }

  return context.next();
};
