"use client";
import { Radio, Shield, Users } from 'lucide-react';

export default function GhostRadar({ peersFound, isScanning }: { peersFound: number, isScanning: boolean }) {
  return (
    <div className="relative bg-slate-950 p-8 rounded-[3rem] border border-blue-500/20 overflow-hidden shadow-2xl">
      {/* Background Pulse Animation */}
      {isScanning && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 bg-blue-500/10 rounded-full animate-ping" />
          <div className="w-48 h-48 bg-blue-500/5 rounded-full animate-pulse delay-75" />
        </div>
      )}

      <div className="relative z-10 text-center">
        <div className="inline-flex p-4 bg-blue-600/10 rounded-2xl border border-blue-500/20 mb-4">
          <Radio className={`${isScanning ? 'text-blue-400 animate-pulse' : 'text-gray-600'}`} size={32} />
        </div>
        
        <h3 className="text-white font-black italic uppercase tracking-tighter text-xl">Ghost Radar</h3>
        <p className="text-[10px] text-blue-400 font-bold mb-6">OFFLINE MESH ACTIVE</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <Users className="text-gray-400 mx-auto mb-2" size={16} />
            <p className="text-lg font-mono text-white">{peersFound}</p>
            <p className="text-[8px] text-gray-500 uppercase">Peers Nearby</p>
          </div>
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <Shield className="text-gray-400 mx-auto mb-2" size={16} />
            <p className="text-lg font-mono text-white">Active</p>
            <p className="text-[8px] text-gray-500 uppercase">Encryption</p>
          </div>
        </div>
      </div>
    </div>
  );
}
