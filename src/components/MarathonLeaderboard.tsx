"use client";
import { Trophy, Move } from 'lucide-react';

export default function MarathonLeaderboard({ leaders }: { leaders: any[] }) {
  return (
    <div className="bg-slate-900 border border-blue-500/30 p-6 rounded-[2.5rem]">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Trophy className="text-blue-400" size={20} />
        </div>
        <h3 className="text-white font-black uppercase italic">Marathon Hustlers</h3>
      </div>

      <div className="space-y-3">
        {leaders.map((hustler, i) => (
          <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              <span className="text-blue-400 font-mono font-bold">#{i + 1}</span>
              <span className="text-white text-xs font-bold uppercase">{hustler.username}</span>
            </div>
            <div className="text-right">
              <p className="text-white font-mono text-sm font-bold">{hustler.weekly_km}km</p>
              <p className="text-[8px] text-gray-500 uppercase tracking-widest">{hustler.weekly_steps} STEPS</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
