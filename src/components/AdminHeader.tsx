"use client";
import Image from 'next/image';

export default function AdminHeader() {
  return (
    <div className="relative overflow-hidden bg-slate-950 border-b border-blue-500/20 p-8 rounded-t-[3rem]">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full"></div>

      <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
        {/* The New Logo */}
        <div className="relative group">
          <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <img 
            src="/44156.png" 
            alt="HabaCoin Genesis Silver" 
            className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          />
        </div>

        {/* Celebratory Text */}
        <div className="text-center md:text-left space-y-2">
          <h1 className="text-white text-4xl font-black italic tracking-tighter uppercase">
            Genesis Block <span className="text-blue-500">Initialized</span>
          </h1>
          <p className="text-gray-400 font-mono text-sm max-w-xl leading-relaxed">
            "The 100 Billion HABA distribution has commenced. Anchored in the physical truth of metals and the kinetic power of the sun, we deliver a currency that cannot be printed, only harvested through the hustle."
          </p>
          <div className="flex gap-4 pt-4">
            <span className="text-[10px] text-green-500 font-bold bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
              NETWORK: LIVE
            </span>
            <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              SUPPLY: 100B HABA
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
