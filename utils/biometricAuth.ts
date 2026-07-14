/**
 * 🔒 Native WebAuthn Biometric Trigger for High-Value Off-Ramps (M-Pesa/PayPal)
 */
export async function authenticateBiometricWithdrawal(): Promise<boolean> {
  if (!window.publicKeyCredential) {
    console.warn("⚠️ Device secure hardware authentication is unavailable.");
    return false;
  }

  try {
    const challengeBuffer = new Uint8Array(32);
    window.crypto.getRandomValues(challengeBuffer);

    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
      challenge: challengeBuffer,
      timeout: 60000,
      userVerification: "required", // Enforces Biometrics/PIN via Android Enclave
      rpId: window.location.hostname
    };

    const assertion = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions
    });

    return assertion !== null;
  } catch (error) {
    console.error("🛑 Authentication failed: Verification rejected.", error);
    return false;
  }
}
