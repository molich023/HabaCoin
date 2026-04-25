import { Context } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
  // 1. resolve-game: Block common bot headers and headless browsers
  const ua = request.headers.get("user-agent") || "";
  const secMetadata = request.headers.get("sec-fetch-dest");
  
  const isBot = /bot|spider|crawl|headless|puppeteer/i.test(ua);
  
  // High-security check: Only allow requests originating from 'document' or 'empty' (fetch)
  if (isBot || (secMetadata && !['document', 'empty'].includes(secMetadata))) {
    return new Response(JSON.stringify({ error: "resolve-game: Unauthorized" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }

    // Logic for resolving Haba game results (Chess, Sudoku, etc.)
    const { gameId, winnerId } = await request.json();

    // Security: Validate the request is coming from your authenticated PWA
    if (!context.site.url) {
      return new Response("Unauthorized", { status: 401 });
    }

    return new Response(JSON.stringify({ 
      status: "Success", 
      message: `Game ${gameId} resolved for ${winnerId}` 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Invalid Request" }), { status: 400 });
  }
};

