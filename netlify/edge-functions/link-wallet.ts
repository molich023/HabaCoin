import { Context } from "@netlify/edge-functions";
import { ethers } from "https://esm.sh/ethers@6.7.0";

export default async (request: Request, context: Context) => {
  // 1. link-wallet: Block common bot headers and headless browsers
  const ua = request.headers.get("user-agent") || "";
  const secMetadata = request.headers.get("sec-fetch-dest");
  
  const isBot = /bot|spider|crawl|headless|puppeteer/i.test(ua);
  
  // High-security check: Only allow requests originating from 'document' or 'empty' (fetch)
  if (isBot || (secMetadata && !['document', 'empty'].includes(secMetadata))) {
    return new Response(JSON.stringify({ error: "link-wallet: Unauthorized" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const { walletAddress, signature, message, captchaToken } = await request.json();

  // 1. CAPTCHA VERIFICATION (Cloudflare Turnstile)
  const verifyCaptcha = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${Deno.env.get("TURNSTILE_SECRET_KEY")}&response=${captchaToken}`,
  });
  const captchaResult = await verifyCaptcha.json();
  if (!captchaResult.success) return new Response("Bot detected", { status: 403 });

  // 2. CRYPTO SIGNATURE VERIFICATION
  const recoveredAddress = ethers.verifyMessage(message, signature);
  if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
    return new Response("Invalid signature", { status: 401 });
  }

  // 3. SAVE TO NEON DB
  const user = context.app.identity?.user; // Netlify Auth User
  const DATABASE_URL = Deno.env.get("DATABASE_URL");
  
  // Perform SQL UPSERT here to link user.id to walletAddress
  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
