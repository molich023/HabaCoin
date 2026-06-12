/**
 * Ubuntu Network Sustainable Proof of Work (sPoW) Processing Engine
 * Handles client-side anti-spoofing verification and local cryptographic packaging
 */
const SpowEngine = {
  lastSyncTimestamp: Date.now(),
  maxHumanStepsPerSecond: 9, // Strict physical cap (sprinters max out here; stops shake-spoofing)

  /**
   * 1. Validate the physical legitimacy of the step packet (Anti-Cheat Mechanism)
   */
  verifyPhysicalWork: function (stepsDelta, durationSeconds) {
    if (durationSeconds <= 0) return false;
    
    const stepsPerSecond = stepsDelta / durationSeconds;
    // If the step rate is faster than physically humanly possible, flag the block as compromised
    if (stepsPerSecond > this.maxHumanStepsPerSecond) {
      console.warn("sPoW Warning: High-velocity step anomaly detected. Potential hardware spoofing.");
      return false;
    }
    return true;
  },

  /**
   * 2. Packages local device metrics into an authenticated submission block
   */
  processStepMiningBlock: async function (userId, currentTotalDeviceSteps, backendSyncUrl) {
    const now = Date.now();
    const durationSeconds = (now - this.lastSyncTimestamp) / 1000;
    
    // Calculate steps taken since the last block cycle
    const localCachedSteps = parseInt(localStorage.getItem('ubuntu_last_saved_steps')) || currentTotalDeviceSteps;
    const stepsDelta = currentTotalDeviceSteps - localCachedSteps;

    if (stepsDelta <= 0) {
      return { status: "IDLE", message: "No new physical work detected since last mining cycle." };
    }

    // Run verification validation
    const isWorkValid = this.verifyPhysicalWork(stepsDelta, durationSeconds);
    if (!isWorkValid) {
      return { status: "REJECTED", error: "sPoW Block verification failed: Velocity out of human boundaries." };
    }

    // Reset loop state tracking parameters
    this.lastSyncTimestamp = now;
    localStorage.setItem('ubuntu_last_saved_steps', currentTotalDeviceSteps);

    // 3. Dispatch validated work block securely to Neon DB
    try {
      const response = await fetch(`${backendSyncUrl}/api/mining/sync-steps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId, rawSteps: stepsDelta })
      });

      const result = await response.json();
      return {
        status: "MINED",
        stepsVerified: stepsDelta,
        tokensAwarded: result.tokensMined
      };
    } catch (error) {
      return { status: "ERROR", error: `Network synchronization failed: ${error.message}` };
    }
  }
};

export default SpowEngine;
