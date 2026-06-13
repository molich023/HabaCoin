"use client";
import React, { useState, useEffect } from 'react';
import { Zap, Shield, Sun, Car } from 'lucide-react';

const ICONS = [Zap, Shield, Sun, Car];

interface HabaChallengeProps {
  onSuccess: () => void;
}

export default function HabaChallenge({ onSuccess }: HabaChallengeProps) {
  const [pattern, setPattern] = useState<number[]>([]);
  const [input, setInput] = useState<number[]>([]);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  const generatePattern = () => {
    // Generate secure randomized tracking patterns dynamically
    const newPattern = Array.from({ length: 3 }, () => Math.floor(Math.random() * 4));
    setPattern(newPattern);
    setInput([]);
  };

  useEffect(() => {
    generatePattern();
  }, []);

  const handleInput = (index: number) => {
    if (isLocked || pattern.length === 0) return;

    const newInput = [...input, index];
    setInput(newInput);
    
    if (newInput.length === pattern.length) {
      const match = newInput.every((val, i) => val === pattern[i]);
      
      if (match) {
        onSuccess();
      } else {
        // Enforce structural inputs throttling to neutralize raw click-spamming tools
        setIsLocked(true);
        alert("Verification sequence invalid. Interface reset triggered.");
        setTimeout(() => {
          generatePattern();
          setIsLocked(false);
        }, 1500);
      }
    }
  };

  return (
    <div className="bg-slate-950 p-6 rounded-3xl border border-blue-500/30 text-center select-none">
      <h3 className="text-white text-[10px] font-black uppercase mb-4 tracking-widest">Verify Human Kinetic</h3>
      
      <div className="flex justify-center gap-4 mb-8 bg-white/5 p-4 rounded-2xl">
        {pattern.map((p, i) => {
          const Icon = ICONS[p];
          return <Icon key={i} size={24} className="text-blue-400 opacity-40 animate-pulse" />;
        })}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {ICONS.map((Icon, i) => (
          <button 
            key={i} 
            onClick={() => handleInput(i)} 
            disabled={isLocked}
            className="p-4 bg-white/5 hover:bg-blue-600/20 active:bg-blue-600/40 rounded-xl border border-white/5 flex justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Icon size={20} className="text-white" />
          </button>
        ))}
      </div>
    </div>
  );
}
