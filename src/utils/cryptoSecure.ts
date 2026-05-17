import * as argon2 from "argon2";
import * as os from "os";

/**
 * Automates Argon2id memory limits dynamically based on current Termux availability.
 * Ensures the process stays functional without tripping Android's OOM Killer.
 */
export async function dynamicArgon2Hash(passphrase: string): Promise<string> {
  // 1. Check total available free memory in Megabytes via Node's OS module
  const freeMemoryMB = Math.floor(os.freemem() / (1024 * 1024));
  
  // 2. Establish our "Ubuntu Token Baseline" (64MB)
  let targetMemoryKB = 64 * 1024; // 64MB in KB
  let parallelism = 2;            // Keep it gentle on big.LITTLE architectures

  // 3. Automation Safety Valve: If the device is heavily restricted, drop down safely
  if (freeMemoryMB < 128) {
    console.warn(`[!] Low Memory Warning: ${freeMemoryMB}MB remaining. Throttling Argon2.`);
    targetMemoryKB = 16 * 1024;   // Drop to 16MB floor limit
    parallelism = 1;              // Conserve thread overhead
  } else if (freeMemoryMB > 512) {
    // If the device has plenty of breathing room, maximize smoothly up to 128MB max
    targetMemoryKB = 128 * 1024;
  }

  try {
    return await argon2.hash(passphrase, {
      type: argon2.argon2id,
      memoryCost: targetMemoryKB,  // Dynamically passed
      timeCost: 4,                 // 4 iterations 
      parallelism: parallelism,    // Dynamically scaled
    });
  } catch (err) {
    console.error("Cryptographic hardware failure:", err);
    throw new Error("Secure processing failed.");
  }
}
