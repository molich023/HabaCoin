"use client";
import { Medal, Crown, Star } from 'lucide-react';

export default function Leaderboard({ topHustlers }: { topHustlers: any[] }) {
  return (
    <div className="bg-slate-950 border border-yellow-500/20 rounded-[3rem] p-8 shadow-[0_0_50px_rgba(234,179,8,0.05)]">
      <h3 className="text-center text-white font-black italic uppercase mb-8 tracking-tighter">
        Founding Tier: The Top 3
      </h3>
      
      <div className="space-y-4">
        {topHustlers.slice(0, 3).map((hustler, i) => (
          <div key={i} className="relative bg-white/5 p-6 rounded-2xl border border-white/5 flex items-center justify-between overflow-hidden">
            {/* Background Badge for Rank 1 */}
            {i === 0 && <Crown className="absolute -right-4 -bottom-4 text-yellow-500/10 w-24 h-24 rotate-12" />}
            
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black ${
                i === 0 ? 'bg-yellow-500 text-black' : i === 1 ? 'bg-slate-300 text-black' : 'bg-orange-600 text-white'
              }`}>
                {i + 1}
              </div>
              <div>
                <p className="text-white font-bold">{hustler.username}</p>
                <p className="text-[10px] text-gray-500 uppercase">Founding Member Badge Pending</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-xl font-mono text-white">{hustler.totalScore}</p>
              <p className="text-[9px] text-yellow-500 font-bold uppercase">Hustle Score</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
