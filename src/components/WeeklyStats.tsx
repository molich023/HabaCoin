"use client";

import React from 'react';

interface DayData {
  label: string;
  total: number;
}

interface WeeklyStatsProps {
  weeklyData?: DayData[];
}

export default function WeeklyStats({ weeklyData = [] }: WeeklyStatsProps) {
  // Safe extraction wrapper preventing execution faults on uninitialized states
  const safeData = Array.isArray(weeklyData) ? weeklyData : [];
  const weeklyTotal = safeData.reduce((sum, day) => sum + (Number(day.total) || 0), 0);

  return (
    <div className="bg-slate-900 border border-white/5 p-6 rounded-[2.5rem]">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-white font-black uppercase italic tracking-tight">Weekly Performance</h3>
          <p className="text-[10px] text-blue-400 font-bold font-mono">7-DAY REWARD VELOCITY</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-mono text-white font-black">+{weeklyTotal.toLocaleString()}</p>
          <p className="text-[8px] text-gray-500 font-bold tracking-widest">TOTAL HABA</p>
        </div>
      </div>

      <div className="flex items-end justify-between h-32 gap-2 px-2">
        {safeData.map((day, i) => {
          const dayTotal = Number(day.total) || 0;
          // Dynamically compute safe tracking scale relative to historical peak targets
          const calculatedHeight = Math.min(Math.max((dayTotal / 1000) * 100, 4), 100);

          return (
            <div key={i} className="flex flex-col items-center flex-1 gap-2 h-full justify-end">
              <div 
                style={{ height: `${calculatedHeight}%` }} 
                className="w-full bg-blue-500/40 border-t-2 border-blue-400 rounded-t-sm transition-all duration-500"
              />
              <span className="text-[8px] text-gray-600 font-mono font-bold uppercase">{String(day.label)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
