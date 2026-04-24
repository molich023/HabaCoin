import SecurityScanner from './components/SecurityScanner';
import { useAuth } from './hooks/useAuth';

export default function App() {
  const { user, isAuthenticated } = useAuth();
  const [isSecure, setIsSecure] = useState(false);

  // Global "Gatekeeper" logic
  if (isAuthenticated && !isSecure) {
    return (
      <SecurityScanner 
        gameName="HABA CORE SYSTEMS" 
        onComplete={async () => {
          // Send Audit Report to Admin before unlocking
          await fetch('/api/admin/audit-log', {
            method: 'POST',
            body: JSON.stringify({ event: 'CORE_ACCESS_GRANTED', userId: user.id })
          });
          setIsSecure(true);
        }} 
      />
    );
  }

  return (
    <main className={isSecure ? 'opacity-100' : 'opacity-0'}>
      {/* Rest of your PWA (Dashboard, Games, Map) */}
    </main>
  );
}

async function testDRPCConnection() {
  const drpcUrl = "https://lb.drpc.live/polygon/YOUR_API_KEY"; // Replace with your real dRPC key

  try {
    const response = await fetch(drpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_blockNumber",
        params: [],
        id: 1
      })
    });

    const data = await response.json();
    if (data.result) {
      console.log("✅ Haba-Network Connected! Current Block:", parseInt(data.result, 16));
      return true;
    }
  } catch (error) {
    console.error("❌ Connection failed:", error);
    return false;
  }
}
