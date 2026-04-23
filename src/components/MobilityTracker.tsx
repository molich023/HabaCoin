export default function MobilityTracker() {
  return (
    <div className="bg-slate-900 border border-green-500/20 p-6 rounded-[2.5rem] mt-6">
      <h3 className="text-green-500 text-[10px] font-black uppercase mb-4 tracking-widest">
        KINETIC ENERGY FEED (EV & GRID)
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Tuktuk/Motorcycle Stats */}
        <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
          <p className="text-[8px] text-gray-500 mb-1 uppercase">Active EV Nodes</p>
          <div className="flex items-center gap-2">
            <span className="text-xl font-mono text-white">422</span>
            <span className="text-[10px] text-green-400 font-bold">TUKTUKS</span>
          </div>
        </div>

        {/* Energy Yield */}
        <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
          <p className="text-[8px] text-gray-500 mb-1 uppercase">Grid Offset</p>
          <div className="flex items-center gap-2">
            <span className="text-xl font-mono text-white">1.2</span>
            <span className="text-[10px] text-blue-400 font-bold">MWh</span>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-green-500/5 rounded-xl border border-green-500/10">
        <p className="text-[9px] text-gray-400 italic">
          "Current HABA Multiplier is at 1.45x due to high solar output in the Rift Valley."
        </p>
      </div>
    </div>
  );
}
