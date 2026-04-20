// src/lib/moderation.ts
const BANNED_WORDS = ["vulgar1", "vulgar2", "etc"]; // Expand this list

export function isContentSafe(text: string): boolean {
  const lowerText = text.toLowerCase();
  // Check for banned words
  const containsBanned = BANNED_WORDS.some(word => lowerText.includes(word));
  
  // Check for patterns (e.g., links to porn sites)
  const linkPattern = /porn|sex|xxx/i;
  const containsPornLinks = linkPattern.test(lowerText);

  return !containsBanned && !containsPornLinks;
}

export async function encryptMessage(text: string, secretKey: CryptoKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(text);

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    secretKey,
    encoded
  );

  return { ciphertext, iv };
}

