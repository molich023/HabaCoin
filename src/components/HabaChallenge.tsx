"use client";
import React, { useState, useEffect } from 'react';
import { Zap, Shield, Sun, Car } from 'lucide-react';

const ICONS = [Zap, Shield, Sun, Car];

export default function HabaChallenge({ onSuccess }: { onSuccess: () => void }) {
  const [pattern, setPattern] = useState<number[]>([]);
  const [input, setInput] = useState<number[]>([]);

  useEffect(() => {
    // Generate a random 3-icon pattern
    setPattern([Math.floor(Math.random()*4), Math.floor(Math.random()*4), Math.floor(Math.random()*4)]);
  }, []);

  const handleInput = (index: number) => {
    const newInput = [...input, index];
    setInput(newInput);
    
    if (newInput.length === 3) {
      if (newInput.every((val, i) => val === pattern[i])) {
        onSuccess();
      } else {
        alert("Pattern Mismatch. Security Lock Engaged.");
        setInput([]);
      }
    }
  };

  return (
    <div className="bg-slate-950 p-6 rounded-3xl border border-blue-500/30 text-center">
      <h3 className="text-white text-xs font-black uppercase mb-4 tracking-widest">Verify Human Kinetic</h3>
      
      {/* Pattern Display */}
      <div className="flex justify-center gap-4 mb-8 bg-white/5 p-4 rounded-2xl">
        {pattern.map((p, i) => {
          const Icon = ICONS[p];
          return <Icon key={i} size={24} className="text-blue-400 opacity-50" />;
        })}
      </div>

      {/* Input Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {ICONS.map((Icon, i) => (
          <button key={i} onClick={() => handleInput(i)} className="p-4 bg-white/5 hover:bg-blue-600/20 rounded-xl border border-white/5 flex justify-center">
            <Icon size={20} className="text-white" />
          </button>
        ))}
      </div>
    </div>
  );
}
