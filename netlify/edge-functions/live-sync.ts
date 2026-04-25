import { Context } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
  // 1. live-sync: Block common bot headers and headless browsers
  const ua = request.headers.get("user-agent") || "";
  const secMetadata = request.headers.get("sec-fetch-dest");
  
  const isBot = /bot|spider|crawl|headless|puppeteer/i.test(ua);
  
  // High-security check: Only allow requests originating from 'document' or 'empty' (fetch)
  if (isBot || (secMetadata && !['document', 'empty'].includes(secMetadata))) {
    return new Response(JSON.stringify({ error: "live-sync: Unauthorized" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Use the Netlify User ID as the source of truth
  const user = context.app.identity?.user;
  
  if (!user) return new Response("Unauthorized", { status: 401 });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      // Send initial check
      controller.enqueue(encoder.encode(`data: {"status": "Syncing for ${user.id}"}\n\n`));

      // This is where you connect to the Neon NOTIFY stream
      // Every time HABA is mined, this stream pushes the NEW balance to the UI
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    }
  });
};

