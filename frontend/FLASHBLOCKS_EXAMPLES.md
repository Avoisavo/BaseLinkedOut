# Base Flashblocks - Usage Examples

Quick reference guide for using Flashblocks in your LinkedOut project.

## ✅ Already Configured

Your project is now using Flashblocks! All transactions on Base Sepolia automatically benefit from ~200ms confirmations.

## Example 1: Reading Contract with Pending State

```typescript
'use client';

import { callContractReadFunction } from '@/lib/web3';
import { useAccount } from 'wagmi';

export default function MyComponent() {
  const { address } = useAccount();

  const fetchBalance = async () => {
    // Option 1: Standard read (waits for latest block)
    const balance = await callContractReadFunction(
      '0x82A16c0a82452aD07aae296b3E408d6Bcd9C3adf', // contract address
      OFT_ABI,
      'balanceOf',
      [address],
      'base',
      false  // usePending = false (default)
    );

    // Option 2: Fast read with pending block (~200ms!)
    const pendingBalance = await callContractReadFunction(
      '0x82A16c0a82452aD07aae296b3E408d6Bcd9C3adf',
      OFT_ABI,
      'balanceOf',
      [address],
      'base',
      true  // usePending = true ⚡
    );

    console.log('Current balance:', balance);
    console.log('Pending balance:', pendingBalance);
  };

  return (
    <button onClick={fetchBalance}>
      Check Balance (Instant with Flashblocks!)
    </button>
  );
}
```

## Example 2: Get Pending Balance Helper

```typescript
import { getPendingBalance } from '@/lib/web3';

// Get balance including pending transactions
const balance = await getPendingBalance(
  '0xYourAddress' as `0x${string}`,
  'base'
);

console.log('Balance with pending txs:', balance);
```

## Example 3: Get Pending Transaction Count (Nonce)

```typescript
import { getPendingTransactionCount } from '@/lib/web3';

// Get nonce including pending transactions
const nonce = await getPendingTransactionCount(
  address as `0x${string}`,
  'base'
);

console.log('Next nonce:', nonce);
```

## Example 4: Get Pending Block Info

```typescript
import { getPendingBlock } from '@/lib/web3';

// Get information about the pending block
const block = await getPendingBlock('base');

console.log('Pending block:', {
  number: block.number,
  timestamp: block.timestamp,
  transactions: block.transactions.length,
});
```

## Example 5: Direct Viem Usage with Pending Tag

```typescript
import { createPublicClient, http } from 'viem';
import { baseSepoliaPreconf } from '@/wagmi';

const client = createPublicClient({
  chain: baseSepoliaPreconf,
  transport: http(),
});

// Get balance with pending tag
const balance = await client.getBalance({
  address: '0xYourAddress',
  blockTag: 'pending',  // Use pending for instant results
});

// Get block with pending tag
const block = await client.getBlock({
  blockTag: 'pending',
});

// Read contract with pending tag
const result = await client.readContract({
  address: '0xContractAddress',
  abi: YOUR_ABI,
  functionName: 'balanceOf',
  args: [address],
  blockTag: 'pending',  // ⚡ Flashblocks magic
});
```

## Example 6: Sending Transactions (Auto-Fast!)

```typescript
import { useWalletClient } from 'wagmi';
import { parseEther } from 'viem';

export default function SendTransaction() {
  const { data: walletClient } = useWalletClient();

  const sendTx = async () => {
    if (!walletClient) return;

    // Send transaction - automatically gets ~200ms confirmation with Flashblocks!
    const hash = await walletClient.sendTransaction({
      to: '0xRecipientAddress',
      value: parseEther('0.01'),
    });

    console.log('Transaction sent:', hash);
    
    // Wait for receipt - much faster with Flashblocks!
    const publicClient = createPublicClient({
      chain: baseSepoliaPreconf,
      transport: http(),
    });

    const receipt = await publicClient.waitForTransactionReceipt({ 
      hash,
      timeout: 120_000,
    });

    console.log('✅ Confirmed in ~200ms!', receipt);
  };

  return <button onClick={sendTx}>Send (Fast!)</button>;
}
```

## Example 7: Using Wagmi Hooks with Flashblocks

```typescript
import { usePublicClient, useAccount } from 'wagmi';
import { useEffect, useState } from 'react';

export default function FlashblocksComponent() {
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const [balance, setBalance] = useState<bigint>(0n);

  useEffect(() => {
    const fetchPendingBalance = async () => {
      if (!publicClient || !address) return;

      // Wagmi's publicClient automatically uses the Flashblocks RPC
      const bal = await publicClient.getBalance({
        address,
        blockTag: 'pending',  // Use pending for instant updates
      });

      setBalance(bal);
    };

    fetchPendingBalance();

    // Poll every second to show real-time pending updates
    const interval = setInterval(fetchPendingBalance, 1000);
    return () => clearInterval(interval);
  }, [publicClient, address]);

  return (
    <div>
      Pending Balance: {balance.toString()}
    </div>
  );
}
```

## Example 8: Bridge with Flashblocks (Your Current Implementation)

Your bridge at `/testBridgeOnly` already uses Flashblocks! It benefits from:

- ⚡ ~200ms transaction confirmations instead of 2-12 seconds
- 🔄 Faster balance updates
- 📊 Real-time pending state visibility

```typescript
// This is already in your code!
const txHash = await walletClient.sendTransaction({
  to: sourceContract,
  value: nativeFee,
  data: sendData,
});

// This will complete in ~200ms with Flashblocks!
const receipt = await publicClient.waitForTransactionReceipt({
  hash: txHash,
  timeout: 120_000,
});
```

## When to Use Pending vs Latest

### Use `pending` (blockTag: 'pending') when:
- ✅ You want near-instant feedback (~200ms)
- ✅ Showing real-time balance updates
- ✅ Getting the latest nonce for transactions
- ✅ Building responsive UIs

### Use `latest` (blockTag: 'latest' or omit) when:
- ✅ You need confirmed data only
- ✅ Generating reports or analytics
- ✅ Critical financial operations that need finality

## Testing Flashblocks

1. Open your app at `http://localhost:3000/testBridgeOnly`
2. Connect your wallet
3. Switch to Base Sepolia
4. Try bridging tokens - notice the fast confirmations!

## Performance Comparison

| Operation | Without Flashblocks | With Flashblocks |
|-----------|---------------------|------------------|
| Read Balance | 2-12 seconds | ~200ms ⚡ |
| Transaction Confirmation | 2-12 seconds | ~200ms ⚡ |
| Block Updates | 2 seconds | ~200ms ⚡ |
| Pending State | Not available | Real-time 🚀 |

## Additional Resources

- [Base Flashblocks Docs](https://docs.base.org/tools/flashblocks)
- [Viem Block Tags](https://viem.sh/docs/contract/readContract.html#blocktag)
- [Your Implementation Guide](./FLASHBLOCKS_GUIDE.md)

