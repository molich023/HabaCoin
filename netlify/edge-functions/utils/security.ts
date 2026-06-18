// netlify/edge-functions/utils/security.ts
export const SECURITY_HEADERS = {
  "Content-Type": "application/json",
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; connect-src 'self' https://polygon-rpc.com https://neon.tech; img-src 'self' data:; style-src 'self' 'unsafe-inline'; frame-ancestors 'none';",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin"
};

export function enforceSecurityGuards(request: Request): Response | null {
  const ua = request.headers.get("user-agent") || "";
  const secMetadata = request.headers.get("sec-fetch-dest");
  const isBot = /bot|spider|crawl|headless|puppeteer/i.test(ua);
  
  if (isBot || (secMetadata && !['document', 'empty'].includes(secMetadata))) {
    return new Response(JSON.stringify({ error: "Access Denied: Compliance Failure" }), { 
      status: 403, 
      headers: SECURITY_HEADERS 
    });
  }
  return null;
}
