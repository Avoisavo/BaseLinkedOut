'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Extend Window interface for Base Account SDK
declare global {
  interface Window {
    createBaseAccountSDK?: any;
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

interface BaseAccountContextType {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
  provider: any;
  isSDKLoaded: boolean;
  signIn: () => Promise<void>;
  signOut: () => void;
  switchChain: (chainId: number) => Promise<void>;
}

const BaseAccountContext = createContext<BaseAccountContextType | undefined>(undefined);

export function BaseAccountProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  // Load Base Account SDK
  useEffect(() => {
    const loadBaseAccountSDK = () => {
      if (document.getElementById('base-account-sdk')) {
        setIsSDKLoaded(true);
        if (typeof window.createBaseAccountSDK === 'function') {
          const sdk = window.createBaseAccountSDK({
            appName: 'LinkedOut',
            appLogoUrl: 'https://base.org/logo.png',
          });
          setProvider(sdk.getProvider());
        }
        return;
      }

      const script = document.createElement('script');
      script.id = 'base-account-sdk';
      script.src = 'https://unpkg.com/@base-org/account/dist/base-account.min.js';
      script.async = true;
      script.onload = () => {
        setIsSDKLoaded(true);
        if (typeof window.createBaseAccountSDK === 'function') {
          const sdk = window.createBaseAccountSDK({
            appName: 'LinkedOut',
            appLogoUrl: 'https://base.org/logo.png',
          });
          setProvider(sdk.getProvider());
        }
      };
      document.body.appendChild(script);
    };

    loadBaseAccountSDK();
  }, []);

  // Check for existing session on mount and verify chain
  useEffect(() => {
    const savedAddress = localStorage.getItem('baseAccountAddress');
    const savedChainId = localStorage.getItem('baseAccountChainId');
    
    if (savedAddress && savedChainId) {
      setAddress(savedAddress);
      setChainId(parseInt(savedChainId));
      
      // Verify current chain matches when provider is ready
      if (provider) {
        provider.request({ method: 'eth_chainId' }).then((chainIdHex: string) => {
          const currentChainId = parseInt(chainIdHex, 16);
          if (currentChainId !== parseInt(savedChainId)) {
            setChainId(currentChainId);
            localStorage.setItem('baseAccountChainId', currentChainId.toString());
          }
        }).catch(console.error);
      }
    }
  }, [provider]);

  // Listen for chain changes
  useEffect(() => {
    if (!provider) return;

    const handleChainChanged = (chainIdHex: string) => {
      const newChainId = parseInt(chainIdHex, 16);
      setChainId(newChainId);
      localStorage.setItem('baseAccountChainId', newChainId.toString());
    };

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected
        signOut();
      } else if (accounts[0] !== address) {
        // User switched accounts
        setAddress(accounts[0]);
        localStorage.setItem('baseAccountAddress', accounts[0]);
      }
    };

    // Set up event listeners
    if (provider.on) {
      provider.on('chainChanged', handleChainChanged);
      provider.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (provider.removeListener) {
        provider.removeListener('chainChanged', handleChainChanged);
        provider.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [provider, address]);

  const generateNonce = () => {
    return crypto.randomUUID().replace(/-/g, '');
  };

  const signOut = () => {
    setAddress(null);
    setChainId(null);
    localStorage.removeItem('baseAccountAddress');
    localStorage.removeItem('baseAccountChainId');
  };

  const signIn = async () => {
    if (!provider) {
      throw new Error('Base Account SDK not loaded yet');
    }

    try {
      const nonce = generateNonce();
      
      // Connect with Base Sepolia chain requirement
      const { accounts } = await provider.request({
        method: 'wallet_connect',
        params: [{
          version: '1',
          capabilities: {
            signInWithEthereum: { 
              nonce, 
              chainId: '0x14A34' // Base Sepolia - 84532
            }
          }
        }]
      });
      
      const { address: accountAddress } = accounts[0];
      
      // Get current chain
      const chainIdHex = await provider.request({ method: 'eth_chainId' });
      const chainIdDec = parseInt(chainIdHex, 16);
      
      // If not on Base Sepolia, switch to it
      if (chainIdDec !== 84532) {
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x14A34' }], // Base Sepolia
          });
          setChainId(84532);
        } catch (switchError: any) {
          // If chain doesn't exist, add it
          if (switchError.code === 4902) {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x14A34',
                chainName: 'Base Sepolia',
                nativeCurrency: {
                  name: 'Ether',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: ['https://sepolia.base.org'],
                blockExplorerUrls: ['https://sepolia.basescan.org']
              }]
            });
            setChainId(84532);
          } else {
            throw switchError;
          }
        }
      } else {
        setChainId(chainIdDec);
      }
      
      setAddress(accountAddress);
      
      // Save to localStorage
      localStorage.setItem('baseAccountAddress', accountAddress);
      localStorage.setItem('baseAccountChainId', '84532');
      
    } catch (error) {
      console.error('Base Account sign-in error:', error);
      throw error;
    }
  };

  const switchChain = async (newChainId: number) => {
    if (!provider) {
      throw new Error('Base Account SDK not loaded yet');
    }

    try {
      const chainIdHex = `0x${newChainId.toString(16)}`;
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
      
      setChainId(newChainId);
      localStorage.setItem('baseAccountChainId', newChainId.toString());
    } catch (error) {
      console.error('Failed to switch chain:', error);
      throw error;
    }
  };

  return (
    <BaseAccountContext.Provider
      value={{
        address,
        isConnected: !!address,
        chainId,
        provider,
        isSDKLoaded,
        signIn,
        signOut,
        switchChain,
      }}
    >
      {children}
    </BaseAccountContext.Provider>
  );
}

export function useBaseAccount() {
  const context = useContext(BaseAccountContext);
  if (context === undefined) {
    throw new Error('useBaseAccount must be used within a BaseAccountProvider');
  }
  return context;
}

