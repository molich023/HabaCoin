import { useState } from 'react';

export function useHabaMiner() {
    const [isMining, setIsMining] = useState(false);

    const startMining = async () => {
        setIsMining(true);
        
        // Load the WASM module from the public folder
        const wasm = await import('../../public/wasm/habacoin_miner');
        await wasm.default(); // Initialize WASM

        // Start the Momentum Loop in a Web Worker to keep the UI smooth
        const seed = new Uint8Array(32);
        window.crypto.getRandomValues(seed);
        
        const result = wasm.run_momentum_hustle(seed, 10); 
        console.log("Mined HABA Block:", result);
    };

    return { startMining, isMining };
}
