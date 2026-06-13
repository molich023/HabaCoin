const PROFANITY_REGEX_MATRIX = [
  /\bvulgar1\b/i,
  /\bvulgar2\b/i,
  /porn|sex|xxx|gamble|casino/i,
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/i // Strips spam links
];

export function isContentSafe(text: string): boolean {
  if (!text || text.trim().length === 0) return true;
  const normalizedText = text.normalize("NFC").toLowerCase();

  // Evaluate the payload against our regex matrix
  return !PROFANITY_REGEX_MATRIX.some(regex => regex.test(normalizedText));
}

interface EncryptedPayload {
  ciphertext: string;
  iv: string;
}

export async function encryptMessage(text: string, rawSecretKey: Uint8Array): Promise<EncryptedPayload> {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // Secure 96-bit initialization vector
  const encodedContent = new TextEncoder().encode(text);

  // Import raw key data into a WebCrypto AES-GCM usable object
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    rawSecretKey,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    cryptoKey,
    encodedContent
  );

  // Serialize byte outputs into portable Base64 strings
  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertextBuffer))),
    iv: btoa(String.fromCharCode(...iv))
  };
}
