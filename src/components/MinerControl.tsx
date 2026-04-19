"use client";
import { useEffect, useState } from 'react';

export default function MinerControl() {
  const [isMining, setIsMining] = useState(false);
  const [status, setStatus] = useState("Idle");

  const startHustle = async () => {
    setIsMining(true);
    setStatus("Mining...");
    
    // In production, we import the WASM module here
    // const wasm = await import('../pkg/habahaba_miner');
    // const result = wasm.mine_momentum(difficulty);
    
    console.log("Hustle started on local device hardware.");
  };

  return (
    <div className="p-6 bg-green-900 rounded-xl text-white">
      <h2 className="text-xl font-bold">Haba Miner (WASM)</h2>
      <p className="text-sm opacity-80">Device Status: {status}</p>
      <button 
        onClick={startHustle}
        className="mt-4 px-6 py-2 bg-green-500 rounded-full font-bold hover:bg-green-400 transition"
      >
        {isMining ? "Stop Hustle" : "Start Hustle"}
      </button>
    </div>
  );
}
