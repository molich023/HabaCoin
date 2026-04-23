"use client";
import { Leaf, Globe, TrendingUp, Wind } from 'lucide-react';

export default function CarbonDashboard({ co2Saved, habaEarned }: { co2Saved: number, habaEarned: number }) {
  return (
    <div className="bg-slate-900/90 border border-green-500/30 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(34,197,94,0.15)] mt-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500 rounded-lg">
            <Leaf size={20} className="text-slate-900" />
          </div>
          <h3 className="text-white font-black italic uppercase tracking-tighter">Carbon Offset Ledger</h3>
        </div>
        <span className="text-[10px] text-green-400 font-bold bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">
          PLANET STATUS: PROTECTED
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CO2 Metric */}
        <div className="space-y-1">
          <p className="text-[10px] text-gray-500 uppercase font-bold ml-1">CO2 Avoided (KG)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-mono text-white leading-none">{co2Saved.toFixed(2)}</span>
            <Globe size={16} className="text-blue-400" />
          </div>
          <p className="text-[9px] text-green-500/70 italic">Equivalent to { (co2Saved * 0.045).toFixed(2) } tree-years of absorption.</p>
        </div>

        {/* HABA Reward Metric */}
        <div className="space-y-1">
          <p className="text-[10px] text-gray-500 uppercase font-bold ml-1">Ecology Yield (HABA)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-mono text-green-400 leading-none">+{habaEarned}</span>
            <TrendingUp size={16} className="text-green-500" />
          </div>
          <p className="text-[9px] text-gray-500 uppercase">Verified via Green Sensor Fusion</p>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-4">
        <Wind size={18} className="text-blue-300 animate-pulse" />
        <p className="text-[10px] text-gray-400 font-medium">
          Your kinetic energy from walking & EV transit is currently stabilizing the Nairobi local grid.
        </p>
      </div>
    </div>
  );
}
