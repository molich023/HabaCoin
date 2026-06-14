"use client";

import React from 'react';

export default function MobilityTracker() {
  return (
    <div className="bg-slate-900 border border-emerald-500/20 p-6 rounded-[2.5rem] mt-6">
      <h3 className="text-emerald-400 text-[10px] font-black uppercase mb-4 tracking-widest font-mono">
        Kinetic Energy Feed (EV Nodes & Grid)
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Tuktuk Node Tracking */}
        <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
          <p className="text-[8px] text-neutral-500 mb-1 uppercase font-bold tracking-wider">Active Verified Nodes</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xl font-mono text-white font-bold">422</span>
            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-black tracking-wide">TUKTUKS</span>
          </div>
        </div>

        {/* Energy Yield Offset */}
        <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
          <p className="text-[8px] text-neutral-500 mb-1 uppercase font-bold tracking-wider">Grid Carbon Offset</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xl font-mono text-white font-bold">1.2</span>
            <span className="text-[9px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-black tracking-wide">MWh</span>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-center">
        <p className="text-[10px] text-neutral-400 font-medium italic">
          &ldquo;System Alert: Haba Multiplier is scaling at <span className="text-emerald-400 font-bold font-mono">1.45x</span> due to increased solar yield vectors in the Rift Valley.&rdquo;
        </p>
      </div>
    </div>
  );
}
