"use client";

import React, { useState } from 'react';

interface MiningDashboardProps {
  userKarma: number;
}

export default function MiningDashboard({ userKarma = 0 }: MiningDashboardProps) {
  const [habaRate] = useState(0.85); 
  const [energyStrength] = useState(1.14); 

  const safeKarma = Number(userKarma || 0).toLocaleString();

  return (
    <div className="bg-black p-6 rounded-[2.5rem] border-t-4 border-emerald-500 shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)]">
      {/* Header: Power Status */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-white text-2xl font-black italic tracking-tighter uppercase">$UBUNTU Core Miner v2.6</h2>
          <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest font-mono mt-0.5">Truth-Verification Active</p>
        </div>
        <div className="bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
           <span className="text-emerald-400 text-[9px] font-bold font-mono animate-pulse">● sPoW SECURE</span>
        </div>
      </div>

      {/* Dynamic Multiplier Graphic */}
      <div className="relative h-48 flex items-center justify-center mb-8">
        <div className="absolute inset-0 border-[14px] border-white/5 rounded-full" />
        <div className="absolute inset-0 border-[14px] border-emerald-500 rounded-full border-t-transparent animate-spin [animation-duration:4s]" />
        <div className="text-center z-10">
          <p className="text-4xl font-black text-white font-mono tracking-tight">{energyStrength}x</p>
          <p className="text-[9px] text-neutral-500 uppercase font-black tracking-widest mt-1">Energy Multiplier</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
          <p className="text-[9px] text-neutral-500 uppercase font-bold tracking-wider">Allocation Rate</p>
          <p className="text-lg font-mono text-emerald-400 font-bold mt-1">+{habaRate} /hr</p>
        </div>
        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
          <p className="text-[9px] text-neutral-500 uppercase font-bold tracking-wider">Karma Offset</p>
          <p className="text-lg font-mono text-blue-400 font-bold mt-1">+{safeKarma}%</p>
        </div>
      </div>

      <button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-950/40 transition-all active:scale-95 uppercase italic text-xs tracking-widest">
        Boost Kinetic Energy Allocation
      </button>
    </div>
  );
}
