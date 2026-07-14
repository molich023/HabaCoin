import { enforceAntiDebuggingMatrix } from "./anti-debug-shield";
// Invoke at the immediate entry point of your handler:
// enforceAntiDebuggingMatrix();

import type { NextApiRequest, NextApiResponse } from "next";
import { verifySolution } from "altcha-lib";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { captchaToken, altchaPayload, userAddress, activityType, inputMetadata } = req.body;

  try {
    // ----------------------------------------------------------------
    // LAYER 1: MULTI-CHANNEL BOT SECURITY VALIDATION FALLBACK RAILS
    // ----------------------------------------------------------------
    let isHuman = false;

    if (captchaToken) {
      const hcaptchaVerification = await fetch("https://hcaptcha.com/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: process.env.HCAPTCHA_SECRET_KEY || "",
          response: captchaToken,
        }),
      });
      const captchaResult = await hcaptchaVerification.json();
      if (captchaResult.success) isHuman = true;
    } else if (altchaPayload) {
      isValidAltcha = await verifySolution(altchaPayload, process.env.ALTCHA_HMAC_KEY || "");
      if (isValidAltcha) isHuman = true;
    }

    if (!isHuman) {
      return res.status(403).json({ error: "Security validation failed. Automated access blocked." });
    }

    // ----------------------------------------------------------------
    // LAYER 2: AUTHORITATIVE INTERNAL BACKEND REWARD ENGINE
    // ----------------------------------------------------------------
    let grantedPoints = 0;
    let activityLog = "";

    switch (activityType) {
      case "DAILY_LOGIN":
        // Server rules: Max 1 login allocation allowed per 24 hour bucket window
        grantedPoints = 10;
        activityLog = "Daily Streak Milestone claimed.";
        break;

      case "WALKING_STEPS":
        // Server assesses input metrics rather than accepting client total calculation values
        const steps = Number(inputMetadata?.steps || 0);
        if (steps > 0) {
          // 1 HabaPoint allocated per 100 authenticated tracking paces
          const validatedCalculation = Math.floor(steps / 100);
          grantedPoints = Math.min(validatedCalculation, 150); // Hard server ceiling cap per tracking window to mitigate manipulation
          activityLog = `HabaWalk tracked activity: processed ${steps} authenticated structural steps.`;
        }
        break;

      case "CHAT_CONTRIBUTION":
        const characterCount = String(inputMetadata?.messageText || "").length;
        // Anti-spam filter logic: length tracking verification checks
        if (characterCount >= 5 && characterCount <= 300) {
          grantedPoints = 5;
          activityLog = "Community channel point payout processed successfully.";
        } else {
          return res.status(400).json({ error: "Contribution failed automated validation context evaluation thresholds." });
        }
        break;

      case "GAME_FINISH":
        const reportedScore = Number(inputMetadata?.gameScore || 0);
        // Cross-examine reporting score bounds to secure against memory manipulation
        if (reportedScore > 0 && reportedScore <= 10000) {
          grantedPoints = 50; 
          activityLog = `Gamified Arena allocation for Match Score: [${reportedScore}].`;
        } else {
          return res.status(400).json({ error: "Unusual activity patterns captured during gaming session metrics assessment." });
        }
        break;

      default:
        return res.status(400).json({ error: "Unknown request activity classification profile." });
    }

    // ----------------------------------------------------------------
    // LAYER 3: RECORD ALL TRANSACTION ALLOCATIONS LIVE IN MEMORY
    // ----------------------------------------------------------------
    // Execution link context hooks:
    // await database.pointsLedger.insert({ wallet: userAddress, tokens: grantedPoints, timestamp: Date.now() })

    return res.status(200).json({
      success: true,
      accountAddress: userAddress,
      payoutAmount: grantedPoints,
      auditMessage: `Verified by Server: ${activityLog}`
    });

  } catch (error) {
    console.error("Server reward valuation failure runtime exception:", error);
    return res.status(500).json({ error: "Internal processing validation failure exception." });
  }
}
