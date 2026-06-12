import argon2 from "argon2-browser";

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number; // Returns device RAM in gigabytes (e.g., 2, 4, 8)
}

/**
 * Automates Argon2id memory limits dynamically based on browser hardware footprints.
 * Tailored specifically for the Ubuntu Token PWA mobile environment.
 */
export async function dynamicArgon2Hash(passphrase: string): Promise<string> {
  const nav = navigator as NavigatorWithMemory;
  
  // 1. Check device RAM tier via native web API (fallback to 2GB if restricted/hidden)
  const deviceRamGB = nav.deviceMemory || 2;
  
  // 2. Establish our "Ubuntu Token Baseline" parameters (64MB)
  let targetMemoryKB = 64 * 1024; // 64MB baseline
  let parallelism = 2;            // Optimized for standard big.LITTLE phone cores

  // 3. Automation Safety Valve: Check capabilities smoothly
  if (deviceRamGB <= 1) {
    // Ultra low-end device or highly locked-down Android webview
    console.warn(`[!] Low-tier hardware profile detected (~${deviceRamGB}GB RAM). Throttling Argon2.`);
    targetMemoryKB = 16 * 1024;   // Drop to safe 16MB floor limit
    parallelism = 1;              // Conserve processing threads
  } else if (deviceRamGB >= 4) {
    // Premium smartphone profile - safe to scale up performance safely
    targetMemoryKB = 128 * 1024;  // Scale up to 128MB max
    parallelism = 4;              // Maximize core usage
  }

  try {
    // Generate a secure random salt using the browser's native Web Crypto API
    const saltArray = new Uint8Array(16);
    crypto.getRandomValues(saltArray);

    // Run the WebAssembly-optimized Argon2id execution thread
    const result = await argon2.hash({
      pass: passphrase,
      salt: saltArray,
      time: 4,                  // 4 structural iterations
      mem: targetMemoryKB,      // Dynamically assigned
      hashLen: 32,
      parallelism: parallelism, // Dynamically scaled
      type: argon2.Argon2Type.Argon2id
    });

    return result.encoded; // Returns the valid cryptographically secure string hash
  } catch (err) {
    console.error("Cryptographic WASM processing failure:", err);
    throw new Error("Secure processing failed.");
  }
}
