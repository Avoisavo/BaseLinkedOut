# Bridge Testing Guide

This guide will help you test cross-chain token transfers between Base Sepolia and Hedera Testnet.

## 📋 Prerequisites

- [ ] `.env` file configured with your `PRIVATE_KEY`
- [ ] Base Sepolia ETH for gas fees (get from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet))
- [ ] Hedera Testnet HBAR for gas fees (get from [Hedera Faucet](https://portal.hedera.com/faucet))

## 🔗 Contract Addresses

- **Base Sepolia**: `0x1498FECa6fb7525616C369592440B6E8325C3D6D`
- **Hedera Testnet**: `0xAd9C65E6F4BD584A77bA942B7a5f4BEc67520181`

## 🚀 Step-by-Step Testing

### Step 1: Mint Test Tokens

First, mint some tokens on Base Sepolia to test with:

```bash
npx hardhat run scripts/1-mint-tokens.js --network base-sepolia
```

This will mint 1 token to your address.

### Step 2: Check Balances (Before)

Check your balances on both chains before bridging:

```bash
# Check Base Sepolia balance
npx hardhat run scripts/check-balances.js --network base-sepolia

# Check Hedera balance
npx hardhat run scripts/check-balances.js --network hedera-testnet
```

### Step 3: Bridge Base Sepolia → Hedera

Send 0.0005 tokens from Base Sepolia to Hedera:

```bash
npx hardhat lz:oft:send \
  --src-eid 40245 \
  --dst-eid 40285 \
  --to YOUR_ADDRESS \
  --amount 0.0005 \
  --network base-sepolia
```

**Replace `YOUR_ADDRESS` with your actual wallet address!**

Or use the helper script:
```bash
npx hardhat run scripts/2-bridge-base-to-hedera.js --network base-sepolia
```

⏳ **Wait 2-5 minutes** for the cross-chain message to be delivered.

### Step 4: Verify Receipt on Hedera

Check that tokens arrived on Hedera:

```bash
npx hardhat run scripts/check-balances.js --network hedera-testnet
```

You should see 0.0005 tokens in your Hedera balance!

### Step 5: Bridge Hedera → Base Sepolia

Send 0.0005 tokens back from Hedera to Base Sepolia:

```bash
npx hardhat lz:oft:send \
  --src-eid 40285 \
  --dst-eid 40245 \
  --to YOUR_ADDRESS \
  --amount 0.0005 \
  --network hedera-testnet
```

Or use the helper script:
```bash
npx hardhat run scripts/3-bridge-hedera-to-base.js --network hedera-testnet
```

⏳ **Wait 2-5 minutes** for the cross-chain message to be delivered.

### Step 6: Verify Receipt on Base Sepolia

Check that tokens arrived back on Base Sepolia:

```bash

npx hardhat run scripts/check-balances.js --network base-sepolia
```

## 📊 Tracking Your Transfers

### LayerZero Scan

Track your cross-chain messages on [LayerZero Scan](https://testnet.layerzeroscan.com/)

1. Copy your transaction hash from the bridge command output
2. Search for it on LayerZero Scan
3. Watch the message progress through verification and execution

### Block Explorers

- **Base Sepolia**: [BaseScan Sepolia](https://sepolia.basescan.org/)
- **Hedera Testnet**: [HashScan](https://hashscan.io/testnet)

## 🔧 Troubleshooting

### "Insufficient balance" error
- Run `npx hardhat run scripts/1-mint-tokens.js --network base-sepolia` to mint more tokens

### "Insufficient gas" error
- Make sure you have native tokens (ETH/HBAR) for gas fees on both chains

### Transaction stuck/pending
- Cross-chain messages can take 2-5 minutes
- Check LayerZero Scan for the message status
- Verify both chains have sufficient gas

### "Contract not deployed" error
- Verify the contract addresses in the scripts match your deployments
- Check that you're using the correct network flag

## 📝 Endpoint IDs

- **Base Sepolia**: `40245` (BASESEP_V2_TESTNET)
- **Hedera Testnet**: `40285` (HEDERA_V2_TESTNET)

## 🎯 Expected Results

After completing all steps:
- ✅ Tokens successfully sent from Base Sepolia to Hedera
- ✅ Balance updated on Hedera Testnet
- ✅ Tokens successfully sent back from Hedera to Base Sepolia
- ✅ Balance restored on Base Sepolia (minus a tiny amount for fees)

## 💡 Tips

- Start with small amounts (0.0005) for testing
- Always check balances before and after bridging
- Save transaction hashes for tracking
- Allow 2-5 minutes for cross-chain delivery
- Use LayerZero Scan to monitor message status

