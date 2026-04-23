// Inside your HustleLedger component
const calculatePotential = (assetType: string) => {
  const multipliers = {
    'phone': 1.0,
    'active_human': 1.2,
    'hybrid': 1.4,
    'tuktuk': 1.8,
    'waste': 2.0,
    'ev': 2.5,
    'transit': 3.0
  };
  
  const baseRate = 100; // Base HABA per session
  return baseRate * (multipliers[assetType] || 1.0);
};

// ... in your JSX
<div className="flex justify-between items-center bg-blue-600/20 p-4 rounded-2xl border border-blue-500/30">
  <p className="text-[10px] text-blue-300 font-bold uppercase">Estimated Session Yield</p>
  <p className="text-2xl font-mono text-white animate-bounce">
    {calculatePotential(selectedNode)} <span className="text-xs">HABA</span>
  </p>
</div>
