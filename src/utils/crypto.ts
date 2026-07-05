/**
 * HABACOIN HIGH-PERFORMANCE WEB CRYPTO STORAGE CIPHER (AES-GCM 256)
 */

// Generate a secure 256-bit cryptographic master key
export const generateHabaKey = async (): Promise<CryptoKey> => {
  return await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
};

// Encrypt payload before saving it to localStorage or state arrays
export const encryptPayload = async (text: string, key: CryptoKey): Promise<{ ciphertext: string; iv: string }> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  
  // Create a cryptographically secure random Initialization Vector (Nonce)
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    data
  );

  return {
    ciphertext: Array.from(new Uint8Array(encryptedBuffer)).map(b => b.toString(16).padStart(2, '0')).join(''),
    iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('')
  };
};

// Decrypt back to clear text when parsing into our protected React state
export const decryptPayload = async (ciphertextHex: string, ivHex: string, key: CryptoKey): Promise<string> => {
  const encryptedData = new Uint8Array(ciphertextHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  const iv = new Uint8Array(ivHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encryptedData
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
};
