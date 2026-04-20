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
