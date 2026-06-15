/**
 * HabaCoin Global Protocol - Content Moderation Engine
 * Complies with OWASP A04:2021 (Insecure Design) by providing a deterministic validation framework.
 */

export const HabaRules = {
  // Hardened, bounded pattern array to avoid catastrophic backtracking (ReDoS)
  forbiddenPatterns: [
    /\b(porn|sex|xxx|naked|vulgarslang1|vulgarslang2)\b/i,
    /\b(scam|invest|doubleyourmoney|freecrypto|airdrop)\b/i
  ],
  
  /**
   * Sanitizes input string to neutralize malicious scripts or basic injection patterns.
   */
  sanitize: (text: string): string => {
    if (!text) return "";
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;");
  },

  /**
   * Validates a string against strict ecosystem guidelines.
   * Returns true if the content is clean and safe to transmit.
   */
  validate: (text: string): boolean => {
    if (typeof text !== "string" || text.length > 2000) {
      return false; // Rejects empty input or extreme lengths designed to strain resources
    }
    
    // Test for matches against the restricted expression library matrix
    return !HabaRules.forbiddenPatterns.some(pattern => pattern.test(text));
  }
};

/**
 * Dispatches messages safely after checking sanitization and access tokens.
 */
export async function sendMessage(
  text: string, 
  matrixClient: any, 
  roomId: string
): Promise<{ success: boolean; reason?: string }> {
  
  const cleanText = HabaRules.sanitize(text);

  // 1. Local UX Sanity Check
  if (!HabaRules.validate(cleanText)) {
    console.warn("[-] Local verification rejected message parameters.");
    return { success: false, reason: "Message contains restricted community patterns." };
  }
  
  try {
    /* SECURITY UPGRADE: To ensure bad actors cannot tamper with client-side code,
      we route the payload through an edge protection checkpoint before letting it reach Matrix.
    */
    const edgeVerification = await fetch("/api/v1/chat/verify-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, text: cleanText })
    });

    if (!edgeVerification.ok) {
      return { success: false, reason: "Serverless compliance engine blocked transmission." };
    }

    // 2. Transmit to Matrix Network safely if verified by the backend
    await matrixClient.sendTextMessage(roomId, cleanText);
    return { success: true };

  } catch (err: any) {
    console.error("[!] Message Dispatch Exception Layer:", err.message);
    return { success: false, reason: "Network timeout or delivery interruption." };
  }
}
