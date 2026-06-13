"use client";
import { Crown } from 'lucide-react';

interface Hustler {
  username: string;
  totalScore: number;
}

interface LeaderboardProps {
  topHustlers: Hustler[];
}

export default function Leaderboard({ topHustlers }: LeaderboardProps) {
  // Defensive normalization step to guarantee parsing safety over raw prop arrays
  const safeHustlers = Array.isArray(topHustlers) ? topHustlers.slice(0, 3) : [];

  return (
    <div className="bg-slate-950 border border-yellow-500/20 rounded-[3rem] p-8 shadow-[0_0_50px_rgba(234,179,8,0.05)] select-none">
      <h3 className="text-center text-white font-black italic uppercase mb-8 tracking-tighter">
        Founding Tier: The Top 3
      </h3>
      
      <div className="space-y-4">
        {safeHustlers.map((hustler, i) => {
          // Explicit string conversion and HTML character entity escaping safely bound to DOM
          const cleanUsername = String(hustler?.username || "Anonymous Hustler").replace(/[<>]/g, "");
          const safeScore = typeof hustler?.totalScore === 'number' ? hustler.totalScore.toLocaleString() : 0;

          return (
            <div key={i} className="relative bg-white/5 p-6 rounded-2xl border border-white/5 flex items-center justify-between overflow-hidden">
              {i === 0 && <Crown className="absolute -right-4 -bottom-4 text-yellow-500/10 w-24 h-24 rotate-12 pointer-events-none" />}
              
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black ${
                  i === 0 ? 'bg-yellow-500 text-black' : i === 1 ? 'bg-slate-300 text-black' : 'bg-orange-600 text-white'
                }`}>
                  {i + 1}
                </div>
                <div>
                  <p className="text-white font-bold">{cleanUsername}</p>
                  <p className="text-[10px] text-gray-500 uppercase">Founding Member Badge Pending</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-xl font-mono text-white">{safeScore}</p>
                <p className="text-[9px] text-yellow-500 font-bold uppercase">Hustle Score</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
