"use client";

import React, { useEffect, useState } from 'react';
import { Map } from 'lucide-react';

interface RegionalStat {
  name: string;
  total_haba: number;
}

export default function RegionalHeatMap() {
  const [stats, setStats] = useState<RegionalStat[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/admin/regional-stats')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (isMounted) {
          setStats(Array.isArray(data) ? data : []);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-blue-500/10 shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-black text-white italic flex items-center gap-2 uppercase tracking-tight">
          <Map className="text-blue-500" size={20} /> GENESIS ENERGY MAP
        </h2>
        <span className="text-[9px] bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30 font-mono font-bold">
          HOUR 1 LIVE
        </span>
      </div>

      {isLoading ? (
        <div className="text-center py-6 text-xs font-mono text-gray-500 uppercase animate-pulse">Syncing distribution grids...</div>
      ) : (
        <div className="space-y-3">
          {stats.map((region) => {
            const totalHaba = Number(region.total_haba) || 0;
            const percentageWidth = Math.min(Math.max((totalHaba / 1000000) * 100, 0), 100);

            return (
              <div key={region.name} className="relative">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{region.name}</span>
                  <span className="text-[10px] font-mono text-blue-400 font-bold">{totalHaba.toLocaleString()} HABA</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.8)] transition-all duration-1000" 
                    style={{ width: `${percentageWidth}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-white/5 rounded-2xl border border-white/5">
          <p className="text-[8px] text-gray-500 uppercase font-bold tracking-wider">Top Region</p>
          <p className="text-xs font-bold text-white uppercase italic mt-0.5">Asia-Pacific</p>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-2xl border border-white/5">
          <p className="text-[8px] text-gray-500 uppercase font-bold tracking-wider">Fastest Growth</p>
          <p className="text-xs font-bold text-green-400 uppercase italic mt-0.5">Africa</p>
        </div>
      </div>
    </div>
  );
}
