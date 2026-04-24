"use client";
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';

export default function WeeklyStats({ weeklyData }: { weeklyData: any[] }) {
  const weeklyTotal = weeklyData.reduce((sum, day) => sum + day.total, 0);

  return (
    <div className="bg-slate-900 border border-white/5 p-6 rounded-[2.5rem]">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-white font-black uppercase italic">Weekly Performance</h3>
          <p className="text-[10px] text-blue-400 font-bold">7-DAY REWARD VELOCITY</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-mono text-white">+{weeklyTotal}</p>
          <p className="text-[8px] text-gray-500">TOTAL HABA</p>
        </div>
      </div>

      <div className="flex items-end justify-between h-32 gap-2 px-2">
        {weeklyData.map((day, i) => (
          <div key={i} className="flex flex-col items-center flex-1 gap-2">
            {/* Simple CSS bar height based on total */}
            <div 
              style={{ height: `${(day.total / 1000) * 100}%`, minHeight: '4px' }} 
              className="w-full bg-blue-500/40 border-t-2 border-blue-400 rounded-t-sm transition-all duration-500"
            />
            <span className="text-[8px] text-gray-600 font-bold uppercase">{day.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
