"use client";
import { useState } from 'react';
import { ExternalLink, CheckCircle, Coins } from 'lucide-react';

const AD_LIST = [
  { id: 1, title: "Explore Polygon DeFi", reward: 50, url: "https://polygon.technology", timer: 15 },
  { id: 2, title: "Hustle Newsletter", reward: 25, url: "https://habacoin.com/news", timer: 10 },
];

export default function PTCDashboard({ onReward }: { onReward: (amt: number) => void }) {
  const [activeAd, setActiveAd] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const startAd = (ad: typeof AD_LIST[0]) => {
    setActiveAd(ad.id);
    setTimeLeft(ad.timer);
    window.open(ad.url, '_blank');

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          claimReward(ad);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const claimReward = async (ad: typeof AD_LIST[0]) => {
    // 1. Instant UI Update
    onReward(ad.reward);
    
    // 2. Secure Backend Sync
    await fetch('/api/ptc-reward', {
      method: 'POST',
      body: JSON.stringify({ adId: ad.id, reward: ad.reward })
    });
    
    setActiveAd(null);
    alert(`Success! ${ad.reward} HABA added to your vault.`);
  };

  return (
    <div className="p-6 bg-gray-900 rounded-3xl border border-blue-900/30">
      <h2 className="text-xl font-bold text-blue-400 mb-6 flex items-center gap-2">
        <Coins size={20} /> PTC Hustle
      </h2>

      <div className="space-y-4">
        {AD_LIST.map((ad) => (
          <div key={ad.id} className="p-4 bg-black/40 rounded-2xl border border-gray-800 flex justify-between items-center">
            <div>
              <p className="font-bold">{ad.title}</p>
              <p className="text-xs text-green-500">+{ad.reward} HABA</p>
            </div>
            
            <button 
              disabled={activeAd !== null}
              onClick={() => startAd(ad)}
              className="px-4 py-2 bg-blue-600 rounded-xl text-sm font-bold disabled:opacity-50"
            >
              {activeAd === ad.id ? `Wait ${timeLeft}s` : 'View Ad'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
