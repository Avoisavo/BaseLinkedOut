'use client';

import { useState, useEffect } from 'react';
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { baseSepolia } from 'wagmi/chains';
import Header from '../../../component/Header';

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Contract addresses
const BASE_SEPOLIA_OFT = '0x1498FECa6fb7525616C369592440B6E8325C3D6D';
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
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const { writeContract, data: hash, isPending } = useWriteContract();

  const [amount, setAmount] = useState('');
  const [isBaseToHedera, setIsBaseToHedera] = useState(true);
  const [txStatus, setTxStatus] = useState<string>('');
  const [estimatedFee, setEstimatedFee] = useState<string>('0');

  const sourceChain = isBaseToHedera ? baseSepolia : hederaTestnet;
  const destChain = isBaseToHedera ? hederaTestnet : baseSepolia;
  const sourceContract = isBaseToHedera ? BASE_SEPOLIA_OFT : HEDERA_TESTNET_OFT;
  const destEid = isBaseToHedera ? HEDERA_TESTNET_EID : BASE_SEPOLIA_EID;

  // Get token balance on current chain
  const { data: balance } = useReadContract({
    address: sourceContract as `0x${string}`,
    abi: OFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: sourceChain.id,
  });

  // Get native balance for gas
  const { data: nativeBalance } = useBalance({
    address: address,
    chainId: sourceChain.id,
  });

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Handle swap direction change
  const handleSwapDirection = () => {
    setIsBaseToHedera(!isBaseToHedera);
    setAmount('');
    setTxStatus('');
  };

  // Add Hedera Testnet to MetaMask
  const addHederaToMetaMask = async () => {
    if (typeof window.ethereum === 'undefined') {
      setTxStatus('MetaMask is not installed');
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x128', // 296 in hex
            chainName: 'Hedera Testnet',
            nativeCurrency: {
              name: 'HBAR',
              symbol: 'HBAR',
              decimals: 18,
            },
            rpcUrls: ['https://testnet.hashio.io/api'],
            blockExplorerUrls: ['https://hashscan.io/testnet'],
          },
        ],
      });
      setTxStatus('Hedera Testnet added to MetaMask successfully!');
    } catch (error: any) {
      console.error('Failed to add Hedera Testnet:', error);
      setTxStatus(`Failed to add Hedera: ${error.message}`);
    }
  };

  // Switch to correct network if needed
  const handleNetworkSwitch = async () => {
    if (switchChain && chain?.id !== sourceChain.id) {
      try {
        await switchChain({ chainId: sourceChain.id });
      } catch (error: any) {
        console.error('Failed to switch network:', error);
        // If it's Hedera and the error is about unknown chain, offer to add it
        if (sourceChain.id === 296 && error.message?.includes('Unrecognized chain')) {
          await addHederaToMetaMask();
        } else {
          setTxStatus('Failed to switch network');
        }
      }
    }
  };

  // Convert address to bytes32 for LayerZero
  const addressToBytes32 = (addr: string): `0x${string}` => {
    return `0x${addr.slice(2).padStart(64, '0')}` as `0x${string}`;
  };

  // Handle bridge transaction
  const handleBridge = async () => {
    if (!address || !amount || parseFloat(amount) <= 0) {
      setTxStatus('Please enter a valid amount');
      return;
    }

    if (chain?.id !== sourceChain.id) {
      setTxStatus('Please switch to the correct network');
      await handleNetworkSwitch();
      return;
    }

    try {
      setTxStatus('Preparing transaction...');
      const amountInWei = parseEther(amount);

      // Prepare SendParam struct
      const sendParam = {
        dstEid: destEid,
        to: addressToBytes32(address),
        amountLD: amountInWei,
        minAmountLD: amountInWei,
        extraOptions: '0x' as `0x${string}`,
        composeMsg: '0x' as `0x${string}`,
        oftCmd: '0x' as `0x${string}`,
      };

      // Estimate fee (you'll need to implement quoteSend call)
      // For now, using a default value
      const messagingFee = {
        nativeFee: parseEther('0.01'), // Approximate fee
        lzTokenFee: BigInt(0),
      };

      setTxStatus('Sending transaction...');
      writeContract({
        address: sourceContract as `0x${string}`,
        abi: OFT_ABI,
        functionName: 'send',
        args: [sendParam, messagingFee, address],
        value: messagingFee.nativeFee,
        chainId: sourceChain.id,
      });
    } catch (error: any) {
      console.error('Bridge error:', error);
      setTxStatus(`Error: ${error.message || 'Transaction failed'}`);
    }
  };

  useEffect(() => {
    if (isConfirming) {
      setTxStatus('Transaction confirming...');
    }
    if (isConfirmed) {
      setTxStatus('✅ Bridge successful! Tokens will arrive in a few minutes.');
      setAmount('');
    }
  }, [isConfirming, isConfirmed]);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #0a0e1a, #1a1f35, #0f1419)' }}>
      <Header title="LinkedOut Bridge" showBackButton={true} />

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
        <div
          className="w-full max-w-lg p-8 rounded-2xl"
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
                  <span className="text-gray-400 text-sm">
                    Balance: {balance ? formatEther(balance as bigint).slice(0, 8) : '0'} MyOFT
                  </span>
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
              {chain?.id !== sourceChain.id ? (
                <div className="space-y-3">
                  <button
                    onClick={handleNetworkSwitch}
                    className="w-full py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                      color: 'white',
                    }}
                  >
                    Switch to {sourceChain.name}
                  </button>
                  {sourceChain.id === 296 && (
                    <button
                      onClick={addHederaToMetaMask}
                      className="w-full py-2 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95"
                      style={{
                        background: 'rgba(147, 51, 234, 0.2)',
                        border: '1px solid rgba(147, 51, 234, 0.4)',
                        color: '#a78bfa',
                      }}
                    >
                      Add Hedera Testnet to MetaMask
                    </button>
                  )}
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
              {nativeBalance && Number(formatEther(nativeBalance.value)) < 0.02 && (
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
  );
}

