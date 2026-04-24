const stats = [
  { label: 'Mining', value: '450 HABA', icon: <Zap size={14}/>, color: 'text-yellow-400' },
  { label: 'Gaming', value: '120 HABA', icon: <Trophy size={14}/>, color: 'text-blue-400' },
  { label: 'Social', value: '35 HABA', icon: <MessageCircle size={14}/>, color: 'text-purple-400' },
  { label: 'Bonus', value: '10 HABA', icon: <Gift size={14}/>, color: 'text-green-400' }
];

return (
  <div className="grid grid-cols-2 gap-3 mb-6">
    {stats.map(s => (
      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
        <div className={`flex items-center gap-2 mb-1 ${s.color}`}>
          {s.icon}
          <span className="text-[9px] font-black uppercase tracking-widest">{s.label}</span>
        </div>
        <p className="text-sm font-mono text-white font-bold">{s.value}</p>
      </div>
    ))}
  </div>
);
