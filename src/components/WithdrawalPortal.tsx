"use client";
import { ArrowUpRight, ShieldCheck, Clock } from 'lucide-react';

export default function WithdrawalPortal({ balance }: { balance: number }) {
  return (
    <div className="bg-slate-900 p-8 rounded-[3rem] border border-white/5 shadow-2xl">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-white text-2xl font-black italic uppercase">Vault Out</h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Swap Gaming Wins for HABA</p>
        </div>
        <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20">
          <ShieldCheck className="text-blue-500" size={24} />
        </div>
      </div>

      <div className="bg-black/40 p-6 rounded-3xl border border-white/5 mb-6">
        <p className="text-[10px] text-gray-500 uppercase mb-1">Available to Withdraw</p>
        <h3 className="text-4xl font-mono text-white">{balance} <span className="text-sm text-blue-400">HABA</span></h3>
      </div>

      <div className="space-y-4">
        <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95">
          <ArrowUpRight size={20} />
          WITHDRAW TO MAIN WALLET
        </button>
        
        <div className="flex items-center justify-center gap-2 text-[9px] text-gray-600 font-bold uppercase tracking-widest">
          <Clock size={12} />
          Processing time: ~2 minutes on Polygon
        </div>
      </div>
    </div>
  );
}
