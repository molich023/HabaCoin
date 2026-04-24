"use client";
import React from 'react';
import { Footprints, MapPin, Zap, ArrowRight } from 'lucide-react';

export default function HustleSummary({ meters, steps, habaEarned }: { meters: number, steps: number, habaEarned: number }) {
  // Logic to switch between m and km for readability
  const displayDistance = meters < 1000 
    ? `${meters.toFixed(0)}m` 
    : `${(meters / 1000).toFixed(2)}km`;

  return (
    <div className="bg-slate-950/90 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] shadow-2xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-1">Current Hustle</p>
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">{displayDistance}</h2>
        </div>
        <div className="bg-blue-600/20 p-3 rounded-2xl border border-blue-500/20">
          <Footprints className="text-blue-400 animate-bounce" size={24} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/5 p-4 rounded-2xl">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="text-yellow-500" size={14} />
            <span className="text-[9px] text-gray-500 font-bold uppercase">HABA Mined</span>
          </div>
          <p className="text-xl font-mono text-white font-bold">+{habaEarned.toFixed(2)}</p>
        </div>
        
        <div className="bg-white/5 p-4 rounded-2xl">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="text-red-400" size={14} />
            <span className="text-[9px] text-gray-500 font-bold uppercase">Steps Take</span>
          </div>
          <p className="text-xl font-mono text-white font-bold">{steps.toLocaleString()}</p>
        </div>
      </div>

      {/* Progress Bar to next HABA Mileston */}
      <div className="w-full bg-white/5 h-1.5 rounded-full mb-6 overflow-hidden">
        <div 
          className="bg-blue-500 h-full rounded-full transition-all duration-500" 
          style={{ width: `${(meters % 1000) / 10}%` }}
        />
      </div>

      <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-95">
        CLAIM & SYNC TO NEON DB
        <ArrowRight size={18} />
      </button>
    </div>
  );
}
