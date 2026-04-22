"use client";
import { useEffect, useState } from 'react';
import { Map, Zap, Users } from 'lucide-react';

export default function RegionalHeatMap() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    // Calling our secure internal API that pulls from the regional_hustle_stats view
    fetch('/api/admin/regional-stats').then(res => res.json()).then(setStats);
  }, []);

  return (
    <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-blue-500/10 shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-black text-white italic flex items-center gap-2">
          <Map className="text-blue-500" /> GENESIS ENERGY MAP
        </h2>
        <span className="text-[9px] bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30">
          HOUR 1 LIVE
        </span>
      </div>

      <div className="space-y-3">
        {stats.map((region) => (
          <div key={region.name} className="relative">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase">{region.name}</span>
              <span className="text-[10px] font-mono text-blue-400">{region.total_haba.toLocaleString()} HABA</span>
            </div>
            {/* The "Heat" Bar */}
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.8)]" 
                style={{ width: `${(region.total_haba / 1000000) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-white/5 rounded-2xl border border-white/5">
          <p className="text-[8px] text-gray-500 uppercase">Top Region</p>
          <p className="text-xs font-bold text-white">Asia-Pacific</p>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-2xl border border-white/5">
          <p className="text-[8px] text-gray-500 uppercase">Fastest Growth</p>
          <p className="text-xs font-bold text-green-400">Africa</p>
        </div>
      </div>
    </div>
  );
}
