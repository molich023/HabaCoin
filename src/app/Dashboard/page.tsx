"use client";

import React, { useState, useEffect } from 'react';
import { Flame, Footprints, ShieldCheck, Zap } from 'lucide-react';

export default function MiningDashboard() {
  const [steps, setSteps] = useState(0);
  const [ubuntuBalance, setUbuntuBalance] = useState("0.0000");
  const [isMining, setIsMining] = useState(false);
  const [miningSpeed, setMiningSpeed] = useState(0); // Represented inside the gauge

  // Simulate step hardware detection hooks and compute local sPoW rewards
  useEffect(() => {
    let internalInterval: NodeJS.Timeout;
    
    if (isMining) {
      internalInterval = setInterval(() => {
        setSteps(prev => {
          const addedSteps = prev + Math.floor(Math.random() * 4) + 1;
          // Dynamically scale the radial speedometer needle metric based on speed spikes
          setMiningSpeed(Math.min(100, Math.floor((addedSteps / 5000) * 100)));
          return addedSteps;
        });

        setUbuntuBalance(prev => (parseFloat(prev) + 0.0012).toFixed(4));
      }, 1000);
    }

    return () => clearInterval(internalInterval);
  }, [isMining]);

  // Calculate the SVG circle properties for the speedometer arc stroke
  const circleRadius = 80;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (miningSpeed / 100) * circumference;

  return (
    <main className="min-h-screen bg-black text-neutral-100 p-6 flex flex-col items-center justify-start">
      {/* Top Universal Ecosystem Header Layout */}
      <header className="w-full max-w-md flex justify-between items-center mb-8 border-b border-neutral-900 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-xs tracking-widest text-neutral-400">HABA GLOBAL NETWORK</span>
        </div>
        <div className="bg-neutral-950 border border-neutral-800 px-3 py-1 rounded-full flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-yellow-500" />
          <span className="text-[10px] font-bold text-yellow-500 font-mono tracking-wider">TIER 1 MULTIPLIER</span>
        </div>
      </header>

      {/* --- GLOWING NEON RADIAL SPEEDOMETER GAUGE COMPONENT --- */}
      <section className="relative w-72 h-72 flex items-center justify-center bg-neutral-950/40 rounded-full border border-neutral-900 shadow-inner mb-6">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          {/* Background Radial Track */}
          <circle 
            cx="100" cy="100" r={circleRadius} 
            className="stroke-neutral-900 fill-none" 
            strokeWidth="10" 
          />
          {/* Active Glowing Progress Track */}
          <circle 
            cx="100" cy="100" r={circleRadius} 
            className="stroke-emerald-500 fill-none transition-all duration-500 ease-out" 
            strokeWidth="10" 
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0px 0px 8px #10b981)' }}
          />
        </svg>

        {/* Floating Centered Speedometer Labels */}
        <div className="absolute text-center flex flex-col items-center">
          <Zap className="w-6 h-6 text-yellow-400 mb-1 animate-pulse" />
          <span className="text-4xl font-black tracking-tighter font-mono text-white">
            {miningSpeed}%
          </span>
          <span className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase mt-0.5">
            sPoW Intact
          </span>
        </div>
      </section>

      {/* --- LIVE METRIC SCOREBOARDS --- */}
      <section className="w-full max-w-md grid grid-cols-2 gap-4 mb-6">
        <div className="bg-neutral-950 border border-neutral-900 p-4 rounded-2xl flex flex-col items-start">
          <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
            <Footprints className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold">Today's Steps</span>
          </div>
          <span className="text-2xl font-bold font-mono text-white">{steps.toLocaleString()}</span>
        </div>

        <div className="bg-neutral-950 border border-neutral-900 p-4 rounded-2xl flex flex-col items-start">
          <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-semibold">Ubuntu Balance</span>
          </div>
          <span className="text-2xl font-bold font-mono text-emerald-400">{ubuntuBalance} <span className="text-xs text-white">$UBUNTU</span></span>
        </div>
      </section>

      {/* Core Dynamic Controller Switch Trigger Button */}
      <footer className="w-full max-w-md mt-auto">
        <button
          onClick={() => setIsMining(!isMining)}
          className={`w-full py-4 px-6 rounded-2xl text-sm font-black tracking-widest uppercase transition-all duration-200 shadow-xl ${
            isMining 
              ? 'bg-neutral-900 hover:bg-neutral-800 text-rose-500 border border-rose-950/40' 
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:brightness-110 shadow-emerald-950/20'
          }`}
        >
          {isMining ? "Pause Momentum Hustle" : "Initiate sPoW Hardware Engine"}
        </button>
      </footer>
    </main>
  );
}
