"use client";

import React, { useState } from 'react';
import { ShieldAlert } from 'lucide-react';

interface MinerControlProps {
  onStartMining?: () => Promise<void> | void;
  onStopMining?: () => Promise<void> | void;
}

export default function MinerControl({ onStartMining, onStopMining }: MinerControlProps) {
  const [isMining, setIsMining] = useState(false);
  const [status, setStatus] = useState("Idle Gateway Connection");
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleMiningHustle = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      if (!isMining) {
        setStatus("Initializing Sec-PoW Kernels...");
        if (onStartMining) await onStartMining();
        setIsMining(true);
        setStatus("sPoW Mining Engine Engaged");
      } else {
        setStatus("Halting Hardware Loop...");
        if (onStopMining) await onStopMining();
        setIsMining(false);
        setStatus("Terminated Cleanly");
      }
    } catch (err) {
      setStatus("Hardware Kernel Exception Event");
      console.error("[!] Core miner control fault caught:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 bg-neutral-950 border border-emerald-500/20 rounded-2xl text-white">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-black tracking-tight uppercase">sPoW Engine Console (WASM)</h2>
        <span className={`w-2.5 h-2.5 rounded-full ${isMining ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-700'}`} />
      </div>
      <p className="text-xs font-mono text-neutral-400 bg-black/50 p-2.5 rounded-xl border border-white/5">
        Device Multiplier Pipeline: <span className="text-emerald-400 font-bold">{status}</span>
      </p>
      
      <button 
        onClick={toggleMiningHustle}
        disabled={isProcessing}
        className={`mt-5 w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
          isMining 
            ? 'bg-neutral-900 hover:bg-neutral-800 text-rose-500 border border-rose-500/20' 
            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/20'
        }`}
      >
        {isProcessing ? "Processing Core Transition..." : isMining ? "Terminate sPoW Loop" : "Engage Hardware Engine"}
      </button>
    </div>
  );
}
