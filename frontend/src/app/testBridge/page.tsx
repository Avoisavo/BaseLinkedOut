'use client';

import { useState, useEffect } from 'react';
import { parseEther, formatEther } from 'viem';
import { useAccount, useWalletClient, useSwitchChain, usePublicClient } from 'wagmi';
import Header from '../../../component/Header';
import { baseSepoliaPreconf, hederaTestnet } from '../../wagmi';

// Updated contract addresses from deployment
const BASE_SEPOLIA_OFT = '0x612F53C77972F2ACaD4Bfc2D9b64cD255326aE3a';
const HEDERA_TESTNET_OFT = '0x1498FECa6fb7525616C369592440B6E8325C3D6D';

// LayerZero Endpoint IDs
const BASE_SEPOLIA_EID = 40245;
const HEDERA_TESTNET_EID = 40285;

// Contract owners from deployment
const BASE_OWNER = '0x8ADab1E200627b935ACD336FB3EDC14D63C3224f';
const HEDERA_OWNER = '0xfEC6BB7506B4c06ddA315c8C12ED030eb05bdE28';

// Simplified ABI
const OFT_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [],
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
    outputs: [],
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
        name: 'msgFee',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export default function TestBridgePage() {
  const { address, chain, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { switchChain } = useSwitchChain();
  const publicClient = usePublicClient();

  const [baseBalance, setBaseBalance] = useState('0');
  const [hederaBalance, setHederaBalance] = useState('0');
  const [totalSupply, setTotalSupply] = useState('0');
  const [mintAmount, setMintAmount] = useState('10');
  const [bridgeAmount, setBridgeAmount] = useState('0.001');
  const [recipientAddress, setRecipientAddress] = useState(HEDERA_OWNER);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [txHash, setTxHash] = useState('');

  // Fetch balances
  const fetchBalances = async () => {
    if (!publicClient) return;

    try {
      // Base balance
      const baseBalanceData = await publicClient.readContract({
        address: BASE_SEPOLIA_OFT as `0x${string}`,
        abi: OFT_ABI,
        functionName: 'balanceOf',
        args: [address || BASE_OWNER],
        chainId: baseSepoliaPreconf.id,
      } as any);
      setBaseBalance(formatEther(baseBalanceData as bigint));

      // Total supply
      const supply = await publicClient.readContract({
        address: BASE_SEPOLIA_OFT as `0x${string}`,
        abi: OFT_ABI,
        functionName: 'totalSupply',
        chainId: baseSepoliaPreconf.id,
      } as any);
      setTotalSupply(formatEther(supply as bigint));

      // Hedera balance
      const hederaBalanceData = await publicClient.readContract({
        address: HEDERA_TESTNET_OFT as `0x${string}`,
        abi: OFT_ABI,
        functionName: 'balanceOf',
        args: [address || HEDERA_OWNER],
        chainId: hederaTestnet.id,
      } as any);
      setHederaBalance(formatEther(hederaBalanceData as bigint));
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchBalances();
      const interval = setInterval(fetchBalances, 10000);
      return () => clearInterval(interval);
    }
  }, [isConnected, address, publicClient]);

  // Mint tokens
  const handleMint = async () => {
    if (!walletClient || !address) {
      setStatus('❌ Please connect wallet');
      return;
    }

    if (chain?.id !== baseSepoliaPreconf.id) {
      setStatus('🔄 Switching to Base Sepolia...');
      await switchChain?.({ chainId: baseSepoliaPreconf.id });
      return;
    }

    setLoading(true);
    setStatus('⏳ Minting tokens...');
    setTxHash('');

    try {
      const hash = await walletClient.writeContract({
        address: BASE_SEPOLIA_OFT as `0x${string}`,
        abi: OFT_ABI,
        functionName: 'mint',
        args: [address, parseEther(mintAmount)],
      });

      setTxHash(hash);
      setStatus('⏳ Waiting for confirmation...');

      await publicClient?.waitForTransactionReceipt({ hash });

      setStatus(`✅ Minted ${mintAmount} MyOFT!`);
      await fetchBalances();
    } catch (error: any) {
      console.error('Mint error:', error);
      setStatus(`❌ Error: ${error.message || 'Mint failed'}`);
    } finally {
      setLoading(false);
    }
  };

  // Bridge tokens
  const handleBridge = async () => {
    if (!walletClient || !address) {
      setStatus('❌ Please connect wallet');
      return;
    }

    if (chain?.id !== baseSepoliaPreconf.id) {
      setStatus('🔄 Switching to Base Sepolia...');
      await switchChain?.({ chainId: baseSepoliaPreconf.id });
      return;
    }

    setLoading(true);
    setStatus('⏳ Preparing bridge...');
    setTxHash('');

    try {
      const amountInWei = parseEther(bridgeAmount);
      
      // Convert recipient address to bytes32
      const recipientBytes32 = `0x000000000000000000000000${recipientAddress.slice(2)}` as `0x${string}`;

      // Prepare send params
      const sendParam = {
        dstEid: HEDERA_TESTNET_EID,
        to: recipientBytes32,
        amountLD: amountInWei,
        minAmountLD: amountInWei,
        extraOptions: '0x' as `0x${string}`,
        composeMsg: '0x' as `0x${string}`,
        oftCmd: '0x' as `0x${string}`,
      };

      // Quote the fee
      setStatus('⏳ Getting quote...');
      const quote = await publicClient?.readContract({
        address: BASE_SEPOLIA_OFT as `0x${string}`,
        abi: OFT_ABI,
        functionName: 'quoteSend',
        args: [sendParam, false],
      } as any);

      const fee = quote as { nativeFee: bigint; lzTokenFee: bigint };
      const nativeFee = fee.nativeFee;

      setStatus('⏳ Sending bridge transaction...');

      // Send the bridge transaction
      const hash = await walletClient.writeContract({
        address: BASE_SEPOLIA_OFT as `0x${string}`,
        abi: OFT_ABI,
        functionName: 'send',
        args: [sendParam, { nativeFee, lzTokenFee: BigInt(0) }, address],
        value: nativeFee,
      });

      setTxHash(hash);
      setStatus('⏳ Waiting for confirmation...');

      await publicClient?.waitForTransactionReceipt({ hash });

      setStatus(`✅ Bridge initiated! Wait 2-5 minutes for delivery.`);
      await fetchBalances();
    } catch (error: any) {
      console.error('Bridge error:', error);
      setStatus(`❌ Error: ${error.message || 'Bridge failed'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #0a0a0f 0%, #1a1a25 100%)' }}>
      <Header title="MyOFT Bridge" showBackButton={true} />

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 
            className="text-5xl font-bold mb-4"
            style={{
              background: 'linear-gradient(to right, #60a5fa, #a78bfa, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Cross-Chain Token Bridge
          </h1>
          <p className="text-gray-400">Mint and bridge MyOFT tokens between Base Sepolia and Hedera Testnet</p>
        </div>

        {!isConnected ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-400 mb-4">👆 Connect your wallet to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Balances */}
            <div className="space-y-6">
              {/* Base Sepolia Card */}
              <div
                className="p-6 rounded-2xl"
                style={{
                  background: 'rgba(30, 30, 40, 0.6)',
                  border: '1px solid rgba(96, 165, 250, 0.3)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-blue-400">🔵 Base Sepolia</h3>
                  <button
                    onClick={() => switchChain?.({ chainId: baseSepoliaPreconf.id })}
                    className="px-3 py-1 rounded-lg text-xs"
                    style={{
                      background: 'rgba(96, 165, 250, 0.2)',
                      border: '1px solid rgba(96, 165, 250, 0.4)',
                      color: '#60a5fa',
                    }}
                  >
                    Switch
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-sm">Your Address</p>
                    <p className="text-white font-mono text-xs break-all">{address || BASE_OWNER}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Contract</p>
                    <p className="text-white font-mono text-xs break-all">{BASE_SEPOLIA_OFT}</p>
                  </div>
                  <div className="pt-3 border-t border-gray-700">
                    <p className="text-gray-400 text-sm">MyOFT Balance</p>
                    <p className="text-3xl font-bold text-blue-400">{parseFloat(baseBalance).toFixed(4)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Supply</p>
                    <p className="text-xl font-bold text-gray-300">{parseFloat(totalSupply).toFixed(4)}</p>
                  </div>
                </div>
              </div>

              {/* Hedera Card */}
              <div
                className="p-6 rounded-2xl"
                style={{
                  background: 'rgba(30, 30, 40, 0.6)',
                  border: '1px solid rgba(167, 139, 250, 0.3)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-purple-400">🟣 Hedera Testnet</h3>
                  <button
                    onClick={() => switchChain?.({ chainId: hederaTestnet.id })}
                    className="px-3 py-1 rounded-lg text-xs"
                    style={{
                      background: 'rgba(167, 139, 250, 0.2)',
                      border: '1px solid rgba(167, 139, 250, 0.4)',
                      color: '#a78bfa',
                    }}
                  >
                    Switch
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-sm">Recipient Address</p>
                    <p className="text-white font-mono text-xs break-all">{recipientAddress}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Contract</p>
                    <p className="text-white font-mono text-xs break-all">{HEDERA_TESTNET_OFT}</p>
                  </div>
                  <div className="pt-3 border-t border-gray-700">
                    <p className="text-gray-400 text-sm">MyOFT Balance</p>
                    <p className="text-3xl font-bold text-purple-400">{parseFloat(hederaBalance).toFixed(4)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Actions */}
            <div className="space-y-6">
              {/* Mint Card */}
              <div
                className="p-6 rounded-2xl"
                style={{
                  background: 'rgba(30, 30, 40, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <h3 className="text-xl font-bold text-white mb-4">🪙 Mint Tokens</h3>
                <p className="text-gray-400 text-sm mb-4">Mint MyOFT tokens on Base Sepolia</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Amount to Mint</label>
                    <input
                      type="number"
                      value={mintAmount}
                      onChange={(e) => setMintAmount(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg text-white"
                      style={{
                        background: 'rgba(50, 50, 60, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                      }}
                      placeholder="10"
                    />
                  </div>
                  
                  <button
                    onClick={handleMint}
                    disabled={loading}
                    className="w-full px-6 py-4 rounded-lg font-bold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                    }}
                  >
                    {loading ? '⏳ Minting...' : '🪙 Mint Tokens'}
                  </button>
                </div>
              </div>

              {/* Bridge Card */}
              <div
                className="p-6 rounded-2xl"
                style={{
                  background: 'rgba(30, 30, 40, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <h3 className="text-xl font-bold text-white mb-4">🌉 Bridge Tokens</h3>
                <p className="text-gray-400 text-sm mb-4">Send MyOFT from Base to Hedera</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Amount to Bridge</label>
                    <input
                      type="number"
                      value={bridgeAmount}
                      onChange={(e) => setBridgeAmount(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg text-white"
                      style={{
                        background: 'rgba(50, 50, 60, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                      }}
                      placeholder="0.001"
                      step="0.001"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Recipient on Hedera</label>
                    <input
                      type="text"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg text-white font-mono text-xs"
                      style={{
                        background: 'rgba(50, 50, 60, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                      }}
                      placeholder="0x..."
                    />
                  </div>
                  
                  <button
                    onClick={handleBridge}
                    disabled={loading}
                    className="w-full px-6 py-4 rounded-lg font-bold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(to right, #8b5cf6, #ec4899)',
                    }}
                  >
                    {loading ? '⏳ Bridging...' : '🌉 Bridge to Hedera'}
                  </button>
                </div>
              </div>

              {/* Status Card */}
              {status && (
                <div
                  className="p-6 rounded-2xl"
                  style={{
                    background: 'rgba(30, 30, 40, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <p className="text-white mb-2">{status}</p>
                  {txHash && (
                    <a
                      href={`https://sepolia.basescan.org/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 text-sm hover:underline break-all"
                    >
                      View TX: {txHash}
                    </a>
                  )}
                </div>
              )}

              {/* Links */}
              <div
                className="p-4 rounded-2xl"
                style={{
                  background: 'rgba(30, 30, 40, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <p className="text-gray-400 text-sm mb-2">🔗 Useful Links</p>
                <div className="space-y-1">
                  <a
                    href="https://testnet.layerzeroscan.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 text-sm hover:underline block"
                  >
                    LayerZero Scan
                  </a>
                  <a
                    href={`https://sepolia.basescan.org/address/${BASE_SEPOLIA_OFT}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 text-sm hover:underline block"
                  >
                    Base Contract
                  </a>
                  <a
                    href={`https://hashscan.io/testnet/contract/${HEDERA_TESTNET_OFT}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 text-sm hover:underline block"
                  >
                    Hedera Contract
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

