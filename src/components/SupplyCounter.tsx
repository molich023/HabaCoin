"use client";
import { useEffect, useState } from 'react';
import { ShieldCheck, Flame, Zap } from 'lucide-react';

export default function SupplyCounter() {
  const [supply, setSupply] = useState(100000000000);
  const [circulating, setCirculating] = useState(142500); // Sample starting amount

  return (
    <div className="bg-slate-950 p-8 rounded-[3rem] border-2 border-blue-600/30 shadow-[0_0_80px_-20px_rgba(37,99,235,0.3)]">
      <div className="text-center mb-8">
        <p className="text-blue-500 font-bold text-[10px] tracking-[0.3em] uppercase mb-2">Protocol: Genesis Distribution</p>
        <h2 className="text-white text-4xl font-black italic tracking-tighter">100 BILLION HABA</h2>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden mb-6 border border-white/10">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-1000" 
          style={{ width: `${(circulating / supply) * 100}%` }}
        ></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={12} className="text-yellow-400" />
            <span className="text-[9px] text-gray-500 uppercase font-bold">Circulating</span>
          </div>
          <p className="text-xl font-mono text-white font-bold">{circulating.toLocaleString()}</p>
        </div>
        
        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <Flame size={12} className="text-orange-500" />
            <span className="text-[9px] text-gray-500 uppercase font-bold">Burned</span>
          </div>
          <p className="text-xl font-mono text-orange-500 font-bold">0.00</p>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <div className="flex items-center gap-2 text-green-500 text-[10px] font-bold bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20">
          <ShieldCheck size={14} />
          HARD-ASSET BACKING VERIFIED (APRIL 2026)
        </div>
      </div>
    </div>
  );
}
