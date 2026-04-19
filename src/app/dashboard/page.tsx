import { getDb } from '@/lib/neon';

export default async function Dashboard() {
  const sql = getDb();
  
  // Fetch real-time Karma and HABA balance from Neon
  const stats = await sql`
    SELECT global_karma, (global_karma * 0.1) as haba_balance 
    FROM profiles 
    WHERE id = ${currentUserId}
  `;

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-green-500">HabaHaba Global</h1>
        <div className="bg-gray-900 px-4 py-2 rounded-full">
          Balance: <span className="text-green-400">{stats[0].haba_balance} HABA</span>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PTC Ad Wall */}
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
          <h2 className="text-xl mb-4">Daily Hustle (PTC Ads)</h2>
          <button className="w-full bg-blue-600 p-4 rounded-xl font-bold mb-2">
            Watch Video (+5 HABA)
          </button>
          <button className="w-full bg-blue-600 p-4 rounded-xl font-bold">
            Visit Partner (+2 HABA)
          </button>
        </div>

        {/* Global Miner Status */}
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
          <h2 className="text-xl mb-4">Miner Status</h2>
          <div className="text-center">
            <div className="text-4xl font-mono mb-2">1.2 GH/s</div>
            <p className="text-gray-400">Mining via WASM Service Worker</p>
          </div>
        </div>
      </section>
    </div>
  );
}
