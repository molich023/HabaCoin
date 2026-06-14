/**
 * Establishes a secure connection with the decentralized messaging fabric.
 * Implements strict compliance measures against OWASP A02:2021-Cryptographic Failures.
 */
async function joinGhostChat(walletAddress, signature) {
  if (!walletAddress || !signature) {
    console.error("[-] Identity validation requirements missing.");
    return;
  }

  // Sanitize parameter inputs against injection patterns
  const cleanAddress = walletAddress.trim().toLowerCase();
  if (!/^0x[a-f0-9]{40}$/.test(cleanAddress)) {
    console.error("[-] Malformed address signature syntax detected.");
    return;
  }

  try {
    console.log("[+] Exchanging signature proof for an isolated session handle...");
    
    /* SECURITY UPGRADE: Never use the signature directly as a password.
      We post the signature to our serverless edge function. The edge verifies it 
      and returns a secure, time-bound, ephemeral Matrix access token.
    */
    const ticketExchangeResponse = await fetch("/api/v1/auth/matrix-token-exchange", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress: cleanAddress, signature })
    });

    if (!ticketExchangeResponse.ok) {
      throw new Error("Edge validation exchange failed to authorize credentials.");
    }

    const { matrixAccessToken, homeserverUrl, matrixUserId } = await ticketExchangeResponse.json();

    // Initialize the Matrix SDK client container safely using the ephemeral token
    const matrixClient = matrixcs.createClient({
      baseUrl: homeserverUrl || "https://matrix.org",
      accessToken: matrixAccessToken,
      userId: matrixUserId
    });

    // Start client connection protocol cleanly
    await matrixClient.startClient({ initialSyncLimit: 10 });
    console.log("[+] Handshake confirmed. Redirecting to operational zone...");
    
    // Enforce safe relative redirection route patterns
    window.location.replace("/chat-room");

  } catch (err) {
    console.error("[!] Ghost Protocol Communication Fault:", err.message);
    // Graceful error fallback notice UI hook
  }
}
