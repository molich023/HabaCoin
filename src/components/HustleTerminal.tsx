export default function HustleTerminal({ habaBalance }: { habaBalance: number }) {
  return (
    <div className="bg-black border border-white/5 rounded-3xl p-6 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-blue-500 font-black italic tracking-tighter uppercase text-sm">
          Live Market Protocol
        </h3>
        <div className="flex gap-2">
           <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
           <span className="text-[10px] text-gray-500">NETWORK LIVE</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* HABA PRICE (Your Secret Calculation) */}
        <div className="flex justify-between items-center p-4 bg-blue-600/5 border border-blue-500/20 rounded-2xl">
          <span className="text-white font-bold">HABA COIN</span>
          <div className="text-right">
             <p className="text-green-400 font-mono font-bold">$0.0042</p>
             <p className="text-[9px] text-gray-500">ENERGY-BACKED</p>
          </div>
        </div>

        {/* EXTERNAL MARKET (CoinGecko Widget) */}
        <div className="pt-4 border-t border-white/10">
          <p className="text-[10px] text-gray-600 mb-4 uppercase font-bold">Global Benchmarks</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-white/5 rounded-xl text-center">
              <p className="text-[9px] text-gray-500">BITCOIN</p>
              <p className="text-xs font-mono">$75,105</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl text-center">
              <p className="text-[9px] text-gray-500">POLYGON</p>
              <p className="text-xs font-mono">$0.62</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
