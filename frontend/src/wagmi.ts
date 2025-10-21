import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia } from 'wagmi/chains';

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
    baseSepolia,
    base,
    hederaTestnet as any, // Custom chain
  ],
  ssr: true, // Enable server-side rendering support
});

