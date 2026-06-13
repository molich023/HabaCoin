"use client";
import { Trophy } from 'lucide-react';

interface LeaderItem {
  username: string;
  weekly_km: number;
  weekly_steps: number;
}

export default function MarathonLeaderboard({ leaders }: { leaders: LeaderItem[] }) {
  const safeLeaders = Array.isArray(leaders) ? leaders : [];

  return (
    <div className="bg-slate-900 border border-blue-500/30 p-6 rounded-[2.5rem] select-none">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Trophy className="text-blue-400" size={20} />
        </div>
        <h3 className="text-white font-black uppercase italic">Marathon Hustlers</h3>
      </div>

      <div className="space-y-3">
        {safeLeaders.map((hustler, i) => {
          if (!hustler) return null;
          const safeUsername = String(hustler.username || "Runner").replace(/[<>]/g, "");

          return (
            <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-blue-400 font-mono font-bold">#{i + 1}</span>
                <span className="text-white text-xs font-bold uppercase">{safeUsername}</span>
              </div>
              <div className="text-right">
                <p className="text-white font-mono text-sm font-bold">{Number(hustler.weekly_km || 0).toFixed(1)}km</p>
                <p className="text-[8px] text-gray-500 uppercase tracking-widest">{Number(hustler.weekly_steps || 0).toLocaleString()} STEPS</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

