"use client";
import { useEffect, useState } from 'react';
import { Trophy, Globe2, Users, TrendingUp } from 'lucide-react';

const CONTINENT_DATA = [
  { name: "Asia-Pacific", users: "280M", haba: 42.5, growth: "+34.7%" },
  { name: "Africa", users: "85M", haba: 18.2, growth: "+41.2%" },
  { name: "Latin America", users: "68M", haba: 15.1, growth: "+38.9%" },
  { name: "North America", users: "72M", haba: 12.8, growth: "+12.4%" },
  { name: "Europe", users: "52M", haba: 11.4, growth: "+8.9%" },
];

export default function GlobalLeaderboard() {
  return (
    <div className="bg-slate-950 p-6 rounded-3xl border border-blue-500/20 shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black text-white flex items-center gap-3 italic">
          <Globe2 className="text-blue-500 animate-pulse" /> GLOBAL HUSTLE RANK
        </h2>
        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/30">
          LIVE 2026 STATS
        </span>
      </div>

      <div className="space-y-4">
        {CONTINENT_DATA.map((item, index) => (
          <div 
            key={item.name} 
            className={`flex items-center justify-between p-4 rounded-2xl transition-all hover:scale-[1.02] ${
              index === 0 ? 'bg-gradient-to-r from-yellow-500/20 to-transparent border border-yellow-500/30' : 'bg-white/5 border border-white/10'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className={`text-xl font-bold ${index === 0 ? 'text-yellow-500' : 'text-gray-500'}`}>
                #{index + 1}
              </span>
              <div>
                <p className="font-bold text-gray-200">{item.name}</p>
                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                  <span className="flex items-center gap-1"><Users size={10}/> {item.users}</span>
                  <span className="flex items-center gap-1 text-green-500"><TrendingUp size={10}/> {item.growth}</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-lg font-mono font-bold text-white">{item.haba}B</p>
              <p className="text-[10px] text-gray-500 uppercase">HABA Held</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-600/10 rounded-2xl border border-dashed border-blue-500/30 text-center">
        <p className="text-xs text-blue-300 italic">
          "The Hustle is currently strongest in Asia-Pacific, but Africa is closing the gap with 41% growth."
        </p>
      </div>
    </div>
  );
}
