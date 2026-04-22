export default function AdminEnergyPanel() {
  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Solar/Wind Feed */}
      <div className="bg-white/5 border border-yellow-500/20 p-5 rounded-3xl">
        <h4 className="text-yellow-500 text-[10px] font-black uppercase mb-3">Solar/Wind Backing</h4>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-2xl font-mono text-white">145.20 <span className="text-[10px] text-gray-500">kW/h</span></p>
            <p className="text-[9px] text-gray-400">GLOBAL RENEWABLE INDEX</p>
          </div>
          <div className="text-right text-green-400 font-bold text-xs">+12% Yield</div>
        </div>
      </div>

      {/* Kibera/Waste Sector Pulse */}
      <div className="bg-white/5 border border-blue-500/20 p-5 rounded-3xl">
        <h4 className="text-blue-500 text-[10px] font-black uppercase mb-3">Community Utility (Kenya)</h4>
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-300">Waste Management / Water Payments</p>
          <span className="h-2 w-2 bg-green-500 rounded-full animate-ping"></span>
        </div>
        <p className="text-lg font-mono text-white mt-2">Verified Decentralized</p>
      </div>
    </div>
  );
}
