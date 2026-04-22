export default function EarlyBirdBanner({ totalClaimed }: { totalClaimed: number }) {
  const remaining = 10000 - totalClaimed;
  
  if (remaining <= 0) return null;

  return (
    <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-y border-yellow-500/30 p-3 text-center mb-6">
      <div className="flex items-center justify-center gap-3">
        <span className="flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-yellow-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
        </span>
        <p className="text-[11px] font-black text-yellow-500 uppercase tracking-widest italic">
          GENESIS ALERT: {remaining.toLocaleString()} Early Bird Slots Remaining!
        </p>
      </div>
      <p className="text-[9px] text-gray-400 mt-1 uppercase">Claim your first HABA today for a +50% Mining Boost</p>
    </div>
  );
}
