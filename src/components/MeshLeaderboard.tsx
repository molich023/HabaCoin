"use client";

import React from 'react';
import { Share2, Zap, ShieldCheck } from 'lucide-react';

export interface RelayerNode {
  username: string;
  hopsVerified: number;
  meshReputation: number;
}

interface MeshLeaderboardProps {
  topRelayers: RelayerNode[];
}

export default function MeshLeaderboard({ topRelayers = [] }: MeshLeaderboardProps) {
  const validatedRelayers = Array.isArray(topRelayers) ? topRelayers : [];

  return (
    <div className="bg-black border-2 border-blue-500/30 rounded-[3rem] p-8 shadow-[0_0_60px_rgba(59,130,246,0.1)]">
      <div className="flex flex-col items-center mb-10">
        <div className="p-4 bg-blue-600/10 rounded-full mb-4 border border-blue-500/20">
          <Share2 className="text-blue-400 animate-pulse" size={40} />
        </div>
        <h2 className="text-white font-black italic uppercase text-2xl tracking-tighter">Founding Bridges</h2>
        <p className="text-[10px] text-blue-500 font-bold tracking-widest uppercase mt-1">Offline Infrastructure Leaders</p>
      </div>

      <div className="space-y-4">
        {validatedRelayers.map((relayer, i) => {
          const safeUsername = String(relayer.username || "Active Node");
          const safePackets = Number(relayer.hopsVerified || 0).toLocaleString();
          const safeReputation = Number(relayer.meshReputation || 0).toLocaleString();

          return (
            <div key={`${safeUsername}-${i}`} className={`relative p-5 rounded-3xl border transition-all ${
              i < 3 ? 'bg-blue-600/10 border-blue-500/40' : 'bg-white/5 border-white/5'
            }`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-white font-black text-xl font-mono">
                      {i + 1}
                    </div>
                    {i < 3 && <ShieldCheck className="absolute -top-2 -right-2 text-blue-400" size={20} />}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">{safeUsername}</h4>
                    <div className="flex items-center gap-2 text-[9px] text-neutral-500 font-bold uppercase tracking-wider mt-0.5">
                      <Zap size={10} className="text-yellow-500" />
                      {safePackets} Packets Relayed
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-mono text-white font-black">{safeReputation}</p>
                  <p className="text-[8px] text-blue-400 font-bold uppercase tracking-widest font-mono">RP Score</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
