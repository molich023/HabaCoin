import { useState, useCallback } from 'react';

export function useHabaMiner() {
  const [isMining, setIsMining] = useState(false);
  const [minerWorker, setMinerWorker] = useState<Worker | null>(null);

  const stopMining = useCallback(() => {
    if (minerWorker) {
      minerWorker.terminate();
      setMinerWorker(null);
    }
    setIsMining(false);
    console.log("[*] Mining engine execution loop paused.");
  }, [minerWorker]);

  const startMining = useCallback(async (difficulty: number = 10) => {
    if (isMining) return;
    setIsMining(true);

    // Cryptographically secure seed array allocation
    const targetSeed = new Uint8Array(32);
    window.crypto.getRandomValues(targetSeed);

    // Hardening Strategy: Dynamic inline instantiation code for an isolated background worker thread context
    const workerScriptCode = `
      self.onmessage = async (e) => {
        const { seed, difficulty } = e.data;
        try {
          // Fetch the static optimized WebAssembly core files asynchronously in context
          const wasm = await import('/wasm/habacoin_miner_client.js');
          await wasm.default();
          
          const result = wasm.run_momentum_hustle(seed, difficulty);
          self.postMessage({ success: true, result });
        } catch (err) {
          self.postMessage({ success: false, error: err.message });
        }
      };
    `;

    const blobObject = new Blob([workerScriptCode], { type: 'application/javascript' });
    const workerThreadInstance = new Worker(URL.createObjectURL(blobObject));

    workerThreadInstance.onmessage = (event) => {
      if (event.data.success) {
        console.log("[+] Secure background thread reported mined validation block arrays:", event.data.result);
      } else {
        console.error("[-] Hardware miner thread crashed during step computation:", event.data.error);
      }
      stopMining();
    };

    workerThreadInstance.postMessage({ seed: targetSeed, difficulty });
    setMinerWorker(workerThreadInstance);
  }, [isMining, stopMining]);

  return { startMining, stopMining, isMining };
}
