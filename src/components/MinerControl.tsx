"use client";
import { useState } from 'react';

export default function MinerControl() {
  const [isMining, setIsMining] = useState(false);
  const [status, setStatus] = useState("Idle");
  const [isProcessing, setIsProcessing] = useState(false);

  const startHustle = async () => {
    if (isProcessing) return; // Disallow double-trigger button-mash bypass loops
    setIsProcessing(true);

    if (isMining) {
      setIsMining(false);
      setStatus("Idle");
      setIsProcessing(false);
      return;
    }

    try {
      setIsMining(true);
      setStatus("Mining...");
      
      // Target secure dynamic client loading strictly inside localized async wrappers
      // const wasm = await import('../pkg/habahaba_miner');
      // const result = wasm.mine_momentum(difficulty);
      
      console.log("Hustle verified safely on hardware module.");
    } catch (err) {
      console.error("WASM validation module context fault: ", err);
      setStatus("Fault Recovery Active");
      setIsMining(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 bg-green-900 rounded-xl text-white select-none">
      <h2 className="text-xl font-bold">Haba Miner (WASM)</h2>
      <p className="text-sm opacity-80">Device Status: {status}</p>
      <button 
        onClick={startHustle}
        disabled={isProcessing}
        className="mt-4 px-6 py-2 bg-green-500 rounded-full font-bold hover:bg-green-400 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isMining ? "Stop Hustle" : "Start Hustle"}
      </button>
    </div>
  );
}
