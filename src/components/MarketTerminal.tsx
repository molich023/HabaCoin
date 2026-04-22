export default function MarketTerminal() {
  return (
    <div className="rounded-3xl overflow-hidden border border-white/10">
      <h3 className="p-4 bg-black text-xs font-bold text-gray-500 uppercase tracking-tighter">
        Global Market Pulse (Real-Time)
      </h3>
      {/* CoinGecko Free Widget */}
      <script src="https://widgets.coingecko.com/gecko-coin-price-static-list-widget.js"></script>
      <gecko-coin-price-static-list-widget 
        locale="en" coin-ids="bitcoin,ethereum,polygon,solana" 
        initial-currency="usd" v-bind:realtime="true">
      </gecko-coin-price-static-list-widget>
    </div>
  );
}
