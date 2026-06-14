import { Context } from "@netlify/edge-functions";
import { ethers } from "https://esm.sh/ethers@6.7.0";
import { neon } from "https://esm.sh/@neondatabase/serverless@0.9.0";

export default async (request: Request, context: Context) => {
  const ua = request.headers.get("user-agent") || "";
  const secMetadata = request.headers.get("sec-fetch-dest");
  const isBot = /bot|spider|crawl|headless|puppeteer/i.test(ua);
  
  if (isBot || (secMetadata && !['document', 'empty'].includes(secMetadata))) {
    return new Response(JSON.stringify({ error: "link-wallet: Access Denied" }), { status: 403 });
  }

  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { walletAddress, signature, message, captchaToken } = await request.json();

    if (!walletAddress || !signature || !message || !captchaToken) {
      return new Response("Missing authentication parameters structural layout.", { status: 422 });
    }

    // 1. Validate Cloudflare Turnstile CAPTCHA Token Proof Checks
    const turnstileSecret = Deno.env.get("TURNSTILE_SECRET_KEY");
    if (!turnstileSecret) throw new Error("System missing Cloudflare captcha key sets.");

    const verifyCaptcha = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${turnstileSecret}&response=${encodeURIComponent(captchaToken)}`,
    });
    
    const captchaResult = await verifyCaptcha.json();
    if (!captchaResult.success) {
      return new Response(JSON.stringify({ error: "Automated traffic block trigger alert activated." }), { status: 403 });
    }

    // 2. Crypto Signature Verification Layer
    const recoveredAddress = ethers.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return new Response(JSON.stringify({ error: "Cryptographic signature validation failure." }), { status: 401 });
    }

    // 3. Extract verified user context from authentication tokens
    const user = context.app?.identity?.user;
    if (!user || !user.id) {
      return new Response(JSON.stringify({ error: "Active identity session authorization required." }), { status: 401 });
    }

    const databaseUrl = Deno.env.get("DATABASE_URL");
    if (!databaseUrl) throw new Error("Missing system DATABASE_URL strings.");
    const sql = neon(databaseUrl);

    // Complete safe SQL parameter insertion task mapping
    await sql`
      UPDATE profiles 
      SET wallet_address = ${walletAddress.toLowerCase()}, updated_at = NOW() 
      WHERE id = ${user.id};
    `;

    return new Response(JSON.stringify({ success: true, linked: walletAddress.toLowerCase() }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("[!] Wallet Link Account Verification Failure:", error.message);
    return new Response(JSON.stringify({ error: "Ecosystem wallet binding process error." }), { status: 500 });
  }
};

export const config = { path: "/api/v1/user/link-wallet" };
