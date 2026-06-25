import { ethers } from 'ethers';
import { HABA_ABI } from './abi.js';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_HABA_CONTRACT_ADDRESS || '';
const POLYGON_RPC_URL = process.env.NEXT_PUBLIC_POLYGON_RPC_URL || 'https://polygon-rpc.com';

export function getReadOnlyClient() {
    const provider = new ethers.JsonRpcProvider(POLYGON_RPC_URL);
    return new ethers.Contract(CONTRACT_ADDRESS, HABA_ABI, provider);
}

export async function getActiveSignerClient() {
    if (!window.ethereum) throw new Error("No secure Web3 wallet wrapper discovered.");
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, HABA_ABI, signer);
}
