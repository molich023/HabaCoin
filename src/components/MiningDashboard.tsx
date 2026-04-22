export default function MiningDashboard({ userKarma }: { userKarma: number }) {
  const [habaRate, setHabaRate] = useState(0.85); // HABA/hr
  const [energyStrength, setEnergyStrength] = useState(1.14); // 1.14x multiplier today

  return (
    <div className="bg-black p-6 rounded-[2.5rem] border-t-4 border-blue-600 shadow-[0_0_50px_-12px_rgba(37,99,235,0.5)]">
      {/* Header: Power Status */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-white text-3xl font-black italic tracking-tighter">HABA MINER v2.6</h2>
          <p className="text-[10px] text-blue-500 font-bold uppercase">Truth-Verification Protocol Active</p>
        </div>
        <div className="bg-blue-600/20 px-3 py-1 rounded-full border border-blue-500/40">
           <span className="text-blue-400 text-[10px] font-mono animate-pulse">● sPoW CONNECTED</span>
        </div>
      </div>

      {/* The "Secret" Energy Meter */}
      <div className="relative h-48 flex items-center justify-center mb-8">
        <div className="absolute inset-0 border-[16px] border-white/5 rounded-full"></div>
        <div className="absolute inset-0 border-[16px] border-blue-600 rounded-full border-t-transparent animate-spin [animation-duration:3s]"></div>
        <div className="text-center">
          <p className="text-4xl font-black text-white">{energyStrength}x</p>
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Energy Multiplier</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
          <p className="text-[9px] text-gray-500 uppercase">Mining Rate</p>
          <p className="text-xl font-mono text-green-400">+{habaRate} H/hr</p>
        </div>
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
          <p className="text-[9px] text-gray-500 uppercase">Karma Bonus</p>
          <p className="text-xl font-mono text-blue-400">+{userKarma}%</p>
        </div>
      </div>

      {/* The Hustle Button */}
      <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 uppercase italic tracking-widest">
        Boost Mining Efficiency
      </button>
    </div>
  );
}
