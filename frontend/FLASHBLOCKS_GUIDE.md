# Base Flashblocks Integration Guide

This project now uses **Base Flashblocks** (preconfirmations) for near-instant transaction confirmations (~200ms) on Base Sepolia.

## What is Flashblocks?

Flashblocks provides "preconfirmations" - credible commitments that transactions will be included in the next block. This dramatically reduces confirmation times from several seconds to ~200ms.

## Configuration

### 1. ✅ RPC URL Updated
The project now uses the Flashblocks RPC endpoint:
```
https://sepolia-preconf.base.org
```

This is configured in:
- `/frontend/src/wagmi.ts` - For Wagmi configuration
- `/frontend/src/lib/web3.ts` - For Viem clients

### 2. ✅ Wagmi Configuration
The `baseSepoliaPreconf` chain is now the default for Base Sepolia in your Wagmi config:

```typescript
import { baseSepoliaPreconf } from './wagmi';

export const config = getDefaultConfig({
  chains: [
    baseSepoliaPreconf,  // Base Sepolia with Flashblocks
    base,
    hederaTestnet,
  ],
  // ... other config
});
```

### 3. ✅ Viem Clients
All Viem clients automatically use the Flashblocks RPC when connecting to Base Sepolia.

## Using the 'pending' Block Tag

Flashblocks supports the `pending` block tag for near-instant responses. The project includes helper functions for this:

### Reading Balances with Pending State

```typescript
import { getPendingBalance } from '@/lib/web3';

// Get balance with pending transactions included (~200ms)
const balance = await getPendingBalance(address, 'base');
```

### Reading Contract State with Pending

```typescript
import { callContractReadFunction } from '@/lib/web3';

// Standard read (waits for latest block)
const result = await callContractReadFunction(
  contractAddress,
  abi,
  'balanceOf',
  [address],
  'base',
  false  // usePending = false
);

// Fast read with pending block tag (~200ms)
const fastResult = await callContractReadFunction(
  contractAddress,
  abi,
  'balanceOf',
  [address],
  'base',
  true  // usePending = true
);
```

### Other Flashblocks Utilities

```typescript
import { 
  getPendingBlock, 
  getPendingBalance, 
  getPendingTransactionCount 
} from '@/lib/web3';

// Get pending block information
const block = await getPendingBlock('base');

// Get pending transaction count (nonce)
const nonce = await getPendingTransactionCount(address, 'base');
```

## Write Transactions

Write transactions (sending transactions) automatically benefit from Flashblocks' ~200ms confirmation times when using the Flashblocks RPC. No code changes needed!

```typescript
// This will confirm in ~200ms on Base Sepolia
const hash = await walletClient.sendTransaction({
  to: contractAddress,
  value: parseEther('0.1'),
  data: encodedData,
});

// Wait for receipt - much faster with Flashblocks!
const receipt = await publicClient.waitForTransactionReceipt({ hash });
```

## Direct JSON-RPC Calls

If you need to make direct JSON-RPC calls with the `pending` tag:

```typescript
// Using Viem's public client
const client = createPublicClient({
  chain: baseSepoliaPreconf,
  transport: http(),
});

// Get balance with pending tag
const balance = await client.request({
  method: 'eth_getBalance',
  params: [address, 'pending']
});

// Get block with pending tag
const block = await client.request({
  method: 'eth_getBlockByNumber',
  params: ['pending', true]
});
```

## Benefits

✅ **Fast Confirmations**: ~200ms instead of 2-12 seconds  
✅ **Better UX**: Near-instant feedback for users  
✅ **Pending State**: Query pending transactions before they're mined  
✅ **Drop-in Replacement**: Works with existing code  

## Testing

Your bridge page (`/testBridgeOnly`) now uses Flashblocks automatically. Test it by:

1. Connect your wallet
2. Switch to Base Sepolia network
3. Bridge tokens - you'll notice much faster confirmations!

## Documentation

- [Base Flashblocks Documentation](https://docs.base.org/tools/flashblocks)
- [Viem Documentation](https://viem.sh)
- [Wagmi Documentation](https://wagmi.sh)

## Notes

- Flashblocks is currently available on **Base Sepolia** testnet
- Mainnet support may be added in the future
- The `pending` block tag provides preconfirmation data, not final confirmations
- Always wait for final transaction receipts for critical operations

