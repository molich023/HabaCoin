<script>
  import { onMount } from 'svelte';
  import { ethers } from 'ethers';
  import { HABA_ABI } from './HabaABI.js';

  // Global Reactive Core Variables
  let walletAddress = '';
  let tokenBalance = '0';
  let totalClaims = 0;
  let contractInstance = null;
  let loading = false;
  
  // App Configuration
  const HABA_CONTRACT_ADDRESS = import.meta.env.VITE_HABA_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";
  const GLOBAL_RPC = import.meta.env.VITE_PUBLIC_RPC_URL || "https://mainnet.base.org";

  // Inbuilt Wallet Initialization Logic
  async function connectInbuiltWallet() {
    if (!window.ethereum) {
      alert("Please access HabaHub via a Web3 browser, or secure via our partner passkey system!");
      return;
    }
    try {
      loading = true;
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      walletAddress = await signer.getAddress();
      
      contractInstance = new ethers.Contract(HABA_CONTRACT_ADDRESS, HABA_ABI, signer);
      await refreshGlobalLedgerBalances();
    } catch (err) {
      console.error("Inbuilt wallet linking failed:", err);
    } finally {
      loading = false;
    }
  }

  async function refreshGlobalLedgerBalances() {
    if (!contractInstance || !walletAddress) return;
    try {
      const rawBalance = await contractInstance.balanceOf(walletAddress);
      tokenBalance = ethers.utils.formatUnits(rawBalance, 18);
      const metrics = await contractInstance.getRewards(walletAddress);
      totalClaims = metrics.totalClaimCycles;
    } catch (err) {
      console.error("Failed syncing balances:", err);
    }
  }

  // Integration Engine for PayPal Global Fiat On-Ramp
  function initPayPalButtonGateway() {
    // Check if the PayPal client script has fully mounted in our DOM lifecycle
    if (window.paypal) {
      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color:  'gold',
          shape:  'rect',
          label:  'paypal'
        },
        createOrder: function(data, actions) {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: '10.00', // Standard packaging price example ($10 USD)
                currency_code: 'USD'
              },
              description: "HabaCoin Global Allocation Package - 1000 HABA"
            }]
          });
        },
        onApprove: async function(data, actions) {
          const details = await actions.order.capture();
          alert(`Transaction completed by ${details.payer.name.given_name}! Initializing automated smart contract release to ${walletAddress}...`);
          // Here you can call an internal API endpoint or backend script to transfer the tokens automatically
          await refreshGlobalLedgerBalances();
        },
        onError: function(err) {
          console.error("PayPal Gateway Execution Error:", err);
        }
      }).render('#paypal-button-container');
    }
  }

  onMount(() => {
    // Automatically trigger PayPal rendering if wallet context is set up or upon load
    setTimeout(() => { initPayPalButtonGateway(); }, 1500);
  });
</script>

<main class="haba-global-wrapper">
  <header class="hub-header">
    <h1>🌐 HabaCoin Global Ledger Hub</h1>
    <p class="tagline">Decentralized Micro-Settlement Framework for Global Commerce</p>
    
    {#if walletAddress}
      <div class="wallet-badge success">
        🔒 Secure Node: {walletAddress.slice(0,6)}...{walletAddress.slice(-4)}
      </div>
    {:else}
      <button class="action-btn connect" on:click={connectInbuiltWallet} disabled={loading}>
        {loading ? "Syncing Networks..." : "Connect Secure Inbuilt Wallet"}
      </button>
    {/if}
  </header>

  {#if walletAddress}
    <div class="dashboard-grid">
      <div class="metric-card">
        <h3>Verified Token Inventory</h3>
        <p class="balance">{parseFloat(tokenBalance).toLocaleString()} <span class="ticker">HABA</span></p>
        <p class="sub-text">Active Network Claims: {totalClaims}</p>
        <button class="action-btn refresh" on:click={refreshGlobalLedgerBalances}>Sync Balance</button>
      </div>

      <div class="metric-card fiat-ramp">
        <h3>Global Credit & Fiat On-Ramp</h3>
        <p class="sub-text">Acquire HabaCoin assets using international credit networks via PayPal.</p>
        
        <div id="paypal-button-container"></div>
      </div>
    </div>
  {/if}
</main>

<style>
  .haba-global-wrapper {
    max-width: 1000px;
    margin: 40px auto;
    font-family: system-ui, -apple-system, sans-serif;
    color: #f0f6fc;
    padding: 0 20px;
  }
  .hub-header {
    text-align: center;
    background: #161b22;
    border: 1px solid #30363d;
    padding: 30px;
    border-radius: 12px;
    margin-bottom: 30px;
  }
  h1 { margin: 0 0 10px 0; color: #ffffff; font-size: 2.2rem; }
  .tagline { color: #8b949e; margin: 0 0 20px 0; font-size: 1.1rem; }
  .dashboard-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 25px;
  }
  @media (max-width: 768px) {
    .dashboard-grid { grid-template-columns: 1fr; }
  }
  .metric-card {
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 12px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .balance { font-size: 2.5rem; font-weight: bold; color: #58a6ff; margin: 15px 0; }
  .ticker { font-size: 1.2rem; color: #8b949e; }
  .sub-text { color: #8b949e; font-size: 0.9rem; margin-bottom: 20px; line-height: 1.4; }
  .action-btn {
    border: none;
    border-radius: 6px;
    padding: 12px;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s;
  }
  .connect { background: #238636; color: white; font-size: 1rem; width: auto; padding: 12px 30px; }
  .connect:hover { background: #2ea043; }
  .refresh { background: #21262d; color: #c9d1d9; border: 1px solid #30363d; }
  .refresh:hover { background: #30363d; }
  .wallet-badge {
    display: inline-block;
    padding: 8px 16px;
    border-radius: 20px;
    font-weight: 600;
    background: rgba(56, 139, 253, 0.15);
    color: #58a6ff;
    border: 1px solid #388bfd;
  }
  #paypal-button-container {
    width: 100%;
    margin-top: 10px;
  }
</style>
