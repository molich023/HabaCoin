export default function ChessArena() {
  return (
    <div className="bg-slate-900 p-6 rounded-3xl border border-blue-500/20 shadow-2xl">
      <div className="text-center mb-6">
        <h3 className="text-white font-black italic uppercase italic">Grandmaster Escrow</h3>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Stake HABA to Enter Arena</p>
      </div>

      <div className="flex justify-around items-center mb-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-blue-600/20 border border-blue-500 flex items-center justify-center mb-2">
            <span className="text-white font-bold">YOU</span>
          </div>
          <p className="text-[10px] text-blue-400">100 HABA</p>
        </div>
        
        <div className="text-gray-600 font-black italic">VS</div>

        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-600/20 border border-red-500 flex items-center justify-center mb-2">
            <span className="text-white font-bold">OPP</span>
          </div>
          <p className="text-[10px] text-red-400">100 HABA</p>
        </div>
      </div>

      <button className="w-full bg-blue-600 py-4 rounded-2xl text-white font-black uppercase tracking-widest hover:bg-blue-500 transition-all">
        CONFIRM STAKE & SEARCH
      </button>
    </div>
  );
}
