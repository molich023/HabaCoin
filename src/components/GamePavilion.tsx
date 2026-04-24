"use client";
import { Trophy, Cpu, Share2, Grid3X3, Hash, CircleDot } from 'lucide-react';

const GAMES = [
  { id: 'chess', name: 'Grandmaster Chess', icon: <Trophy className="text-yellow-500" />, stake: '10-500', type: 'PvP' },
  { id: 'sudoku', name: 'Cognitive Sudoku', icon: <Grid3X3 className="text-blue-400" />, stake: '5-50', type: 'PvE' },
  { id: 'radar', name: 'Mesh Bridge', icon: <Share2 className="text-green-400 animate-pulse" />, stake: '0 (Earn)', type: 'Infra' },
  { id: 'pool', name: 'Hustle Billiards', icon: <CircleDot className="text-purple-400" />, stake: '20-100', type: 'PvP' },
  { id: 'ttt', name: 'Rapid Tic-Tac-Toe', icon: <Hash className="text-red-400" />, stake: '2-10', type: 'PvP' },
  { id: 'checkers', name: 'Elite Checkers', icon: <Cpu className="text-orange-400" />, stake: '10-50', type: 'PvP' },
];

export default function GamePavilion({ onSelectGame }: { onSelectGame: (id: string) => void }) {
  return (
    <div className="bg-slate-950 p-6 rounded-[3rem] border border-white/5 shadow-2xl">
      <div className="mb-8 text-center">
        <h2 className="text-white font-black italic uppercase text-3xl tracking-tighter">Arena</h2>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Stake HABA • Prove Skill • Earn Reputation</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {GAMES.map((game) => (
          <button 
            key={game.id}
            onClick={() => onSelectGame(game.id)}
            className="group relative bg-white/5 border border-white/5 hover:border-blue-500/50 p-5 rounded-3xl transition-all active:scale-95 text-left overflow-hidden"
          >
            {/* Background Glow Effect */}
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
              {game.icon}
            </div>
            
            <div className="mb-3 p-2 bg-black/40 rounded-xl inline-block">
              {game.icon}
            </div>
            
            <h4 className="text-white font-bold text-xs mb-1 uppercase italic">{game.name}</h4>
            
            <div className="flex justify-between items-center">
              <span className="text-[8px] text-gray-500 font-mono">{game.stake} HABA</span>
              <span className="text-[7px] bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full font-black">
                {game.type}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
