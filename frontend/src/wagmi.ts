import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia } from 'wagmi/chains';
import { http } from 'viem';

// Base Sepolia Preconf (Flashblocks) Chain Config
export const baseSepoliaPreconf = {
  ...baseSepolia,
  name: 'Base Sepolia (Flashblocks)',
  rpcUrls: {
    default: { http: ['https://sepolia-preconf.base.org'] },
    public: { http: ['https://sepolia-preconf.base.org'] },
  },
} as const;

// Hedera Testnet Chain Config
export const hederaTestnet = {
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

export const config = getDefaultConfig({
  appName: 'LinkedOut',
  projectId: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || '',
  chains: [
    baseSepoliaPreconf as any, // Base Sepolia with Flashblocks support
    base,
    hederaTestnet as any, // Custom chain
  ],
  ssr: true, // Enable server-side rendering support
});

