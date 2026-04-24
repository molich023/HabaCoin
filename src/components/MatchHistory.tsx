"use client";
import { Trophy, Flame, Crown, ChevronRight } from 'lucide-react';

export default function MatchHistory({ matches, rankPoints }: { matches: any[], rankPoints: number }) {
  const isWhale = rankPoints >= 1000;

  return (
    <div className="bg-slate-900/80 rounded-[2rem] p-6 border border-white/5 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-white font-black italic uppercase italic">Battle Logs</h3>
        <div className={`px-4 py-1 rounded-full border flex items-center gap-2 ${isWhale ? 'border-yellow-500 bg-yellow-500/10' : 'border-blue-500 bg-blue-500/10'}`}>
          <Crown size={14} className={isWhale ? 'text-yellow-500' : 'text-blue-400'} />
          <span className="text-[10px] font-bold text-white uppercase tracking-widest">
            {isWhale ? 'Whale Tier' : 'Hustler Tier'}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {matches.map((m, i) => (
          <div key={i} className="bg-white/5 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${m.won ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                <Trophy size={18} />
              </div>
              <div>
                <p className="text-xs text-white font-bold">{m.opponent}</p>
                <p className="text-[9px] text-gray-500 font-mono">{m.date}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-xs font-mono font-bold ${m.won ? 'text-green-400' : 'text-red-400'}`}>
                {m.won ? '+' : '-'}{m.amount} HABA
              </p>
              <p className="text-[8px] text-gray-600 uppercase">Settled</p>
            </div>
          </div>
        ))}
      </div>

      {!isWhale && (
        <button className="w-full mt-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] text-gray-400 font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
          {1000 - rankPoints} Points to unlock Whale Chat <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}
