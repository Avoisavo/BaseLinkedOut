'use client';

import { useState, useEffect } from 'react';
import { parseEther, formatEther, encodeFunctionData, hexToBigInt, type Hex } from 'viem';
import { useAccount, useWalletClient, useSwitchChain, usePublicClient, useBalance } from 'wagmi';
import Header from '../../../component/Header';

// Extend Window interface for Base payment
declare global {
  interface Window {
    base?: {
      pay: (params: {
        amount: string;
        to: string;
        testnet?: boolean;
      }) => Promise<{ id: string }>;
      getPaymentStatus: (params: {
        id: string;
        testnet?: boolean;
      }) => Promise<{ status: string }>;
    };
  }
}

// Contract addresses
const BASE_SEPOLIA_OFT = '0x82A16c0a82452aD07aae296b3E408d6Bcd9C3adf';
const HEDERA_TESTNET_OFT = '0xAd9C65E6F4BD584A77bA942B7a5f4BEc67520181';

// LayerZero Endpoint IDs
const BASE_SEPOLIA_EID = 40245;
const HEDERA_TESTNET_EID = 40285;

// Hedera Testnet Chain Config
const hederaTestnet = {
  id: 296,
  name: 'Hedera Testnet',
  network: 'hedera-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HBAR',
    symbol: 'HBAR',
  },
  rpcUrls: {
    default: { http: ['https://testnet.hashio.io/api'] },
    public: { http: ['https://testnet.hashio.io/api'] },
  },
  blockExplorers: {
    default: { name: 'HashScan', url: 'https://hashscan.io/testnet' },
  },
  testnet: true,
} as const;

// Simplified ABI for the OFT contract
const OFT_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'uint32', name: 'dstEid', type: 'uint32' },
          { internalType: 'bytes32', name: 'to', type: 'bytes32' },
          { internalType: 'uint256', name: 'amountLD', type: 'uint256' },
          { internalType: 'uint256', name: 'minAmountLD', type: 'uint256' },
          { internalType: 'bytes', name: 'extraOptions', type: 'bytes' },
          { internalType: 'bytes', name: 'composeMsg', type: 'bytes' },
          { internalType: 'bytes', name: 'oftCmd', type: 'bytes' },
        ],
        internalType: 'struct SendParam',
        name: '_sendParam',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'uint256', name: 'nativeFee', type: 'uint256' },
          { internalType: 'uint256', name: 'lzTokenFee', type: 'uint256' },
        ],
        internalType: 'struct MessagingFee',
        name: '_fee',
        type: 'tuple',
      },
      { internalType: 'address', name: '_refundAddress', type: 'address' },
    ],
    name: 'send',
    outputs: [
      {
        components: [
          { internalType: 'bytes32', name: 'guid', type: 'bytes32' },
          { internalType: 'uint64', name: 'nonce', type: 'uint64' },
          {
            components: [
              { internalType: 'uint256', name: 'nativeFee', type: 'uint256' },
              { internalType: 'uint256', name: 'lzTokenFee', type: 'uint256' },
            ],
            internalType: 'struct MessagingFee',
            name: 'fee',
            type: 'tuple',
          },
        ],
        internalType: 'struct MessagingReceipt',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'uint32', name: 'dstEid', type: 'uint32' },
          { internalType: 'bytes32', name: 'to', type: 'bytes32' },
          { internalType: 'uint256', name: 'amountLD', type: 'uint256' },
          { internalType: 'uint256', name: 'minAmountLD', type: 'uint256' },
          { internalType: 'bytes', name: 'extraOptions', type: 'bytes' },
          { internalType: 'bytes', name: 'composeMsg', type: 'bytes' },
          { internalType: 'bytes', name: 'oftCmd', type: 'bytes' },
        ],
        internalType: 'struct SendParam',
        name: '_sendParam',
        type: 'tuple',
      },
      { internalType: 'bool', name: '_payInLzToken', type: 'bool' },
    ],
    name: 'quoteSend',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'nativeFee', type: 'uint256' },
          { internalType: 'uint256', name: 'lzTokenFee', type: 'uint256' },
        ],
        internalType: 'struct MessagingFee',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export default function SwapPage() {
  const { address, isConnected, chainId } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { switchChain } = useSwitchChain();
  
  // For compatibility with existing code
  const provider = walletClient;

  const [amount, setAmount] = useState('');
  const [isBaseToHedera, setIsBaseToHedera] = useState(true);
  const [txStatus, setTxStatus] = useState<string>('');
  const [estimatedFee, setEstimatedFee] = useState<string>('0');
  const [balance, setBalance] = useState<string>('0');
  const [nativeBalance, setNativeBalance] = useState<string>('0');
  const [hash, setHash] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  
  // Base Account SDK states for payment feature
  const [baseAccountStatus, setBaseAccountStatus] = useState<string>('');

  // Chain configs
  const baseSepolia = { 
    id: 84532, 
    name: 'Base Sepolia', 
    nativeCurrency: { symbol: 'ETH' },
    blockExplorers: { default: { url: 'https://sepolia.basescan.org' } }
  };
  const hederaTestnet = { 
    id: 296, 
    name: 'Hedera Testnet', 
    nativeCurrency: { symbol: 'HBAR' },
    blockExplorers: { default: { url: 'https://hashscan.io/testnet' } }
  };

  const sourceChain = isBaseToHedera ? baseSepolia : hederaTestnet;
  const destChain = isBaseToHedera ? hederaTestnet : baseSepolia;
  const sourceContract = isBaseToHedera ? BASE_SEPOLIA_OFT : HEDERA_TESTNET_OFT;
  const destEid = isBaseToHedera ? HEDERA_TESTNET_EID : BASE_SEPOLIA_EID;

  // Fetch balances using publicClient
  const fetchBalances = async () => {
    if (!publicClient || !address) {
      console.log('Skipping balance fetch: publicClient or address not available');
      return;
    }

    try {
      // Get native balance
      const ethBalance = await publicClient.getBalance({ address });
      setNativeBalance(`0x${ethBalance.toString(16)}`);
      console.log('Native balance:', ethBalance);

      // Get token balance using balanceOf
      const paddedAddress = address.slice(2).toLowerCase().padStart(64, '0');
      const data = `0x70a08231${paddedAddress}` as `0x${string}`;
      
      const balanceData = await publicClient.call({
        to: sourceContract as `0x${string}`,
        data: data,
      });
      setBalance(balanceData.data || '0x0');
      console.log('Token balance:', balanceData.data);
    } catch (error: any) {
      console.error('Error fetching balances:', {
        error: error,
        message: error?.message || 'Unknown error',
        code: error?.code,
        publicClient: !!publicClient,
        address: address,
        sourceContract: sourceContract,
      });
      // Set default values on error
      setBalance('0x0');
      setNativeBalance('0x0');
    }
  };

  // Handle swap direction change
  const handleSwapDirection = () => {
    setIsBaseToHedera(!isBaseToHedera);
    setAmount('');
    setTxStatus('');
  };

  // Handle network switch
  const handleSwitchNetwork = async () => {
    try {
      setTxStatus('Switching to Base Sepolia...');
      await switchChain({ chainId: 84532 });
      setTxStatus('✅ Switched to Base Sepolia!');
      setTimeout(() => setTxStatus(''), 3000);
      // Refresh balances after switching
      fetchBalances();
      } catch (error: any) {
        console.error('Failed to switch network:', error);
      setTxStatus(`❌ Failed to switch network: ${error.message}`);
    }
  };

  // Convert address to bytes32 for LayerZero
  const addressToBytes32 = (addr: string): `0x${string}` => {
    return `0x${addr.slice(2).padStart(64, '0')}` as `0x${string}`;
  };

  // Handle bridge transaction using Base Smart Wallet
  const handleBridge = async () => {
    if (!address || !amount || parseFloat(amount) <= 0) {
      setTxStatus('Please enter a valid amount');
      return;
    }

    if (!provider) {
      setTxStatus('Wallet not connected');
      return;
    }

    if (chainId !== sourceChain.id) {
      setTxStatus(`Please switch to ${sourceChain.name} in your wallet`);
      return;
    }

    try {
      setIsPending(true);
      setTxStatus('Preparing transaction...');
      const amountInWei = parseEther(amount);

      // Prepare SendParam struct
      const sendParam = {
        dstEid: destEid,
        to: addressToBytes32(address),
        amountLD: amountInWei,
        minAmountLD: amountInWei,
        extraOptions: '0x0003010011010000000000000000000000000000ea60' as `0x${string}`, // LayerZero options
        composeMsg: '0x' as `0x${string}`,
        oftCmd: '0x' as `0x${string}`,
      };

      // Step 1: Call quoteSend to get the actual messaging fee
      setTxStatus('Estimating gas fees...');
      console.log('Calling quoteSend with params:', sendParam);
      
      const quoteData = encodeFunctionData({
        abi: OFT_ABI,
        functionName: 'quoteSend',
        args: [sendParam, false],
      });

      const quoteResult = await publicClient!.call({
        to: sourceContract as `0x${string}`,
        data: quoteData as `0x${string}`,
      });

      // Parse the quote result to get nativeFee
      // Result is a tuple (nativeFee, lzTokenFee) - we need the first 32 bytes
      const quoteHex = quoteResult.data || '0x0';
      const nativeFee = hexToBigInt(quoteHex);
      console.log('Estimated native fee:', nativeFee);
      
      setEstimatedFee(formatEther(nativeFee));

      // Step 2: Prepare the send transaction
      setTxStatus('Preparing bridge transaction...');
      
      const messagingFee = {
        nativeFee: nativeFee,
        lzTokenFee: BigInt(0),
      };

      // Encode the send function call
      const sendData = encodeFunctionData({
        abi: OFT_ABI,
        functionName: 'send',
        args: [sendParam, messagingFee, address as `0x${string}`],
      });

      console.log('Sending transaction with:');
      console.log('- To:', sourceContract);
      console.log('- Value:', nativeFee);
      console.log('- Data:', sendData);
      console.log('- From:', address);

      setTxStatus('🔄 Signing transaction with your wallet...');

      // Step 3: Send transaction using walletClient
      if (!walletClient) {
        throw new Error('Wallet not connected');
      }

      const txHash = await walletClient.sendTransaction({
        to: sourceContract as `0x${string}`,
        value: nativeFee,
        data: sendData as `0x${string}`,
        account: address as `0x${string}`,
        chain: walletClient.chain,
      });

      setHash(txHash);
      setTxStatus('✅ Transaction sent! Waiting for confirmation...');
      setIsConfirming(true);
      
      console.log('Transaction hash:', txHash);

      // Step 4: Wait for transaction receipt
      const receipt = await publicClient!.waitForTransactionReceipt({
        hash: txHash,
        timeout: 120_000, // 2 minutes
      });

      if (!receipt) {
        throw new Error('Transaction timeout - check Base Sepolia explorer');
      }

      setIsConfirming(false);
      setIsConfirmed(true);
      setTxStatus('✅ Bridge successful! Tokens will arrive on Hedera in 2-5 minutes.');
      setAmount('');

      // Refresh balances
      setTimeout(() => fetchBalances(), 3000);
    } catch (error: any) {
      console.error('Bridge error:', error);
      setTxStatus(`❌ Error: ${error.message || 'Transaction failed'}`);
      setIsConfirming(false);
    } finally {
      setIsPending(false);
    }
  };

  // Fetch balances when address or chain changes
  useEffect(() => {
    if (address && publicClient && isConnected && chainId) {
      // Add a small delay to ensure publicClient is fully ready
      const timer = setTimeout(() => {
        console.log('Fetching balances for:', { address, chainId, sourceContract });
        fetchBalances();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [address, publicClient, isConnected, chainId, sourceContract]);

  useEffect(() => {
    if (isConfirming) {
      setTxStatus('Transaction confirming...');
    }
    if (isConfirmed) {
      setTxStatus('✅ Bridge successful! Tokens will arrive in a few minutes.');
      setAmount('');
    }
  }, [isConfirming, isConfirmed]);

  // Pay with Base Account
  const handleBaseAccountPay = async () => {
    if (!window.base) {
      setBaseAccountStatus('❌ Base Account SDK not fully loaded');
      return;
    }

    try {
      setBaseAccountStatus('🔄 Processing payment...');
      
      const result = await window.base.pay({
        amount: "5.00", // USD – SDK quotes equivalent USDC
        to: "0x2211d1D0020DAEA8039E46Cf1367962070d77DA9",
        testnet: true // Using testnet
      });

      const status = await window.base.getPaymentStatus({
        id: result.id,
        testnet: true
      });
      
      setBaseAccountStatus(`🎉 Payment completed! Status: ${status.status}`);
      console.log('Payment result:', result, 'Status:', status);
      
    } catch (error: any) {
      console.error('Base Account payment error:', error);
      setBaseAccountStatus(`❌ Payment failed: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #0a0e1a, #1a1f35, #0f1419)' }}>
      <Header title="LinkedOut Bridge" showBackButton={true} />

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
        <div className="w-full max-w-4xl space-y-6">
          {/* Base Pay Feature Section */}
          {isConnected && (
            <div
              className="w-full p-6 rounded-2xl"
              style={{
                background: 'rgba(20, 20, 30, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              }}
            >
              <h3 className="text-xl font-bold text-center mb-4 text-white">
                💳 Quick USDC Payment
              </h3>

              <button
                onClick={handleBaseAccountPay}
                disabled={!isConnected}
                className="w-full py-3 px-6 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: isConnected
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : 'rgba(100, 100, 120, 0.5)',
                  color: 'white',
                }}
              >
                Pay $5 USDC (Testnet)
              </button>

              {baseAccountStatus && (
                <div
                  className="mt-4 p-3 rounded-xl text-center"
                  style={{
                    background: baseAccountStatus.includes('✅') || baseAccountStatus.includes('🎉')
                      ? 'rgba(34, 197, 94, 0.1)'
                      : baseAccountStatus.includes('❌')
                      ? 'rgba(239, 68, 68, 0.1)'
                      : 'rgba(96, 165, 250, 0.1)',
                    border: `1px solid ${
                      baseAccountStatus.includes('✅') || baseAccountStatus.includes('🎉')
                        ? 'rgba(34, 197, 94, 0.3)'
                        : baseAccountStatus.includes('❌')
                        ? 'rgba(239, 68, 68, 0.3)'
                        : 'rgba(96, 165, 250, 0.3)'
                    }`,
                  }}
                >
                  <p
                    className={`text-sm ${
                      baseAccountStatus.includes('✅') || baseAccountStatus.includes('🎉')
                        ? 'text-green-400'
                        : baseAccountStatus.includes('❌')
                        ? 'text-red-400'
                        : 'text-blue-400'
                    }`}
                  >
                    {baseAccountStatus}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Bridge Section */}
          <div
            className="w-full p-8 rounded-2xl"
            style={{
              background: 'rgba(20, 20, 30, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}
          >
          <h2
            className="text-3xl font-bold text-center mb-8"
            style={{
              background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Cross-Chain Bridge
          </h2>

          {!isConnected ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Please connect your wallet to start bridging</p>
            </div>
          ) : (
            <>
              {/* Debug Info */}
              {process.env.NODE_ENV === 'development' && (
                <div
                  className="mb-4 p-3 rounded-lg text-xs font-mono"
                  style={{
                    background: 'rgba(30, 30, 45, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div className="text-gray-400">Debug Info:</div>
                  <div className="text-gray-300">Address: {address}</div>
                  <div className="text-gray-300">Chain ID: {chainId}</div>
                  <div className="text-gray-300">Provider: {provider ? '✓' : '✗'}</div>
                  <div className="text-gray-300">Connected: {isConnected ? '✓' : '✗'}</div>
                  <div className="text-gray-300">Contract: {sourceContract}</div>
                  <div className="text-gray-300">Token Balance: {balance}</div>
                  <div className="text-gray-300">Native Balance: {nativeBalance}</div>
                </div>
              )}

              {/* From Section */}
              <div
                className="p-6 rounded-xl mb-4"
                style={{
                  background: 'rgba(30, 30, 45, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-400 text-sm">From</span>
                  <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">
                      Balance: {balance !== '0x0' && balance !== '0' ? formatEther(BigInt(balance)).slice(0, 8) : '0.00'} MyOFT
                  </span>
                    <button
                      onClick={fetchBalances}
                      className="p-1 rounded hover:bg-white/10 transition-all"
                      title="Refresh balance"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="0.0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="flex-1 bg-transparent text-3xl text-white outline-none"
                    step="0.0001"
                  />
                  <div
                    className="px-4 py-2 rounded-lg flex items-center gap-2"
                    style={{
                      background: 'rgba(60, 60, 70, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{
                        background: isBaseToHedera
                          ? 'linear-gradient(135deg, #0052FF, #0095FF)'
                          : 'linear-gradient(135deg, #9333EA, #C026D3)',
                      }}
                    />
                    <span className="text-white font-semibold">{sourceChain.name}</span>
                  </div>
                </div>
              </div>

              {/* Swap Direction Button */}
              <div className="flex justify-center -my-2 relative z-10">
                <button
                  onClick={handleSwapDirection}
                  className="p-3 rounded-xl transition-all hover:scale-110 active:scale-95"
                  style={{
                    background: 'rgba(60, 60, 70, 0.8)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    />
                  </svg>
                </button>
              </div>

              {/* To Section */}
              <div
                className="p-6 rounded-xl mb-6"
                style={{
                  background: 'rgba(30, 30, 45, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-400 text-sm">To</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="0.0"
                    value={amount}
                    disabled
                    className="flex-1 bg-transparent text-3xl text-gray-500 outline-none"
                  />
                  <div
                    className="px-4 py-2 rounded-lg flex items-center gap-2"
                    style={{
                      background: 'rgba(60, 60, 70, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{
                        background: !isBaseToHedera
                          ? 'linear-gradient(135deg, #0052FF, #0095FF)'
                          : 'linear-gradient(135deg, #9333EA, #C026D3)',
                      }}
                    />
                    <span className="text-white font-semibold">{destChain.name}</span>
                  </div>
                </div>
              </div>

              {/* Transaction Info */}
              <div
                className="p-4 rounded-xl mb-6 space-y-2"
                style={{
                  background: 'rgba(30, 30, 45, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Estimated Fee</span>
                  <span className="text-white">~0.01 {sourceChain.nativeCurrency.symbol}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Estimated Time</span>
                  <span className="text-white">2-5 minutes</span>
                </div>
              </div>

              {/* Bridge Button */}
              {chainId !== sourceChain.id ? (
                <div className="space-y-3">
                  <div
                    className="p-4 rounded-xl text-center"
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                    }}
                  >
                    <p className="text-red-400 text-sm mb-2">
                      ⚠️ Wrong network detected!
                    </p>
                    <p className="text-gray-400 text-xs">
                      Current: {chainId ? `Chain ${chainId}` : 'Unknown'} | Required: {sourceChain.name}
                    </p>
                  </div>
                  
                  <button
                    onClick={handleSwitchNetwork}
                    className="w-full py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: 'linear-gradient(135deg, #0052FF, #0095FF)',
                      color: 'white',
                    }}
                  >
                    Switch to {sourceChain.name}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleBridge}
                  disabled={isPending || isConfirming || !amount || parseFloat(amount) <= 0}
                  className="w-full py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background:
                      isPending || isConfirming
                        ? 'rgba(100, 100, 120, 0.5)'
                        : 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                    color: 'white',
                  }}
                >
                  {isPending || isConfirming ? 'Processing...' : 'Bridge Tokens'}
                </button>
              )}

              {/* Status Message */}
              {txStatus && (
                <div
                  className="mt-4 p-4 rounded-xl text-center"
                  style={{
                    background: isConfirmed
                      ? 'rgba(34, 197, 94, 0.1)'
                      : 'rgba(96, 165, 250, 0.1)',
                    border: `1px solid ${isConfirmed ? 'rgba(34, 197, 94, 0.3)' : 'rgba(96, 165, 250, 0.3)'}`,
                  }}
                >
                  <p className={isConfirmed ? 'text-green-400' : 'text-blue-400'}>{txStatus}</p>
                  {hash && (
                    <a
                      href={`${sourceChain.blockExplorers?.default.url}/tx/${hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:text-blue-300 underline mt-2 inline-block"
                    >
                      View Transaction
                    </a>
                  )}
                </div>
              )}

              {/* Native Balance Warning */}
              {nativeBalance && nativeBalance !== '0x0' && Number(formatEther(BigInt(nativeBalance))) < 0.02 && (
                <div
                  className="mt-4 p-4 rounded-xl text-center"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                  }}
                >
                  <p className="text-red-400 text-sm">
                    ⚠️ Low {sourceChain.nativeCurrency.symbol} balance. You may not have enough for gas
                    fees.
                  </p>
                </div>
              )}
            </>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

