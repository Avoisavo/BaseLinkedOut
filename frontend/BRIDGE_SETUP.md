# Cross-Chain Bridge UI Setup

## Overview
A sleek UI for bridging MyOFT tokens between Base Sepolia and Hedera Testnet using LayerZero.

## Features
✅ **Header Component** - Integrated wallet connection with network display
✅ **Dual Chain Support** - Base Sepolia ↔️ Hedera Testnet
✅ **MetaMask Integration** - Automatic wallet interaction and balance display
✅ **Network Switching** - Auto-switch to correct network for bridging
✅ **Hedera Setup** - One-click button to add Hedera Testnet to MetaMask
✅ **Real-time Balance** - Live token balance display for connected wallet
✅ **Transaction Status** - Visual feedback for bridge operations

## Contract Addresses

### Base Sepolia
- **Contract:** `0x1498FECa6fb7525616C369592440B6E8325C3D6D`
- **Chain ID:** 84532
- **LayerZero EID:** 40245

### Hedera Testnet
- **Contract:** `0xAd9C65E6F4BD584A77bA942B7a5f4BEc67520181`
- **Chain ID:** 296
- **LayerZero EID:** 40285

## How to Use

### 1. Connect Your Wallet
- Click "Connect Wallet" in the header
- Approve MetaMask connection
- The app will auto-switch to Base Sepolia initially

### 2. Set Up Networks
- Base Sepolia should already be in your MetaMask
- For Hedera Testnet, click "Add Hedera Testnet to MetaMask" when prompted
- This adds the network configuration automatically

### 3. Bridge Tokens

#### From Base Sepolia to Hedera:
1. Ensure you're on the `/test` page
2. Connect wallet (will default to Base Sepolia)
3. Enter amount of MyOFT tokens to bridge
4. Click "Bridge Tokens"
5. Approve the transaction in MetaMask
6. Wait 2-5 minutes for cross-chain delivery

#### From Hedera to Base Sepolia:
1. Click the swap direction button (arrows icon)
2. Click "Switch to Hedera Testnet" (or add it first if needed)
3. Enter amount of MyOFT tokens to bridge
4. Click "Bridge Tokens"
5. Approve the transaction in MetaMask
6. Wait 2-5 minutes for cross-chain delivery

## UI Components

### From/To Panels
- **Balance Display** - Shows your MyOFT balance on the source chain
- **Amount Input** - Enter the amount to bridge
- **Chain Indicator** - Visual indicator showing source/destination chains

### Transaction Info
- **Estimated Fee** - ~0.01 in native token (ETH for Base, HBAR for Hedera)
- **Estimated Time** - 2-5 minutes for cross-chain messaging

### Status Messages
- Real-time transaction status
- Link to block explorer to view transaction
- Success/error notifications

## Requirements

### Testnet Tokens
- **Base Sepolia ETH** - For gas fees (get from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet))
- **Hedera HBAR** - For gas fees (get from [Hedera Faucet](https://portal.hedera.com))
- **MyOFT Tokens** - Must have tokens on the source chain to bridge

### MetaMask Setup
- Install [MetaMask](https://metamask.io/)
- Base Sepolia is added automatically
- Hedera Testnet can be added via the UI button

## Technical Details

### LayerZero Integration
- Uses LayerZero V2 OFT (Omnichain Fungible Token) standard
- Cross-chain messaging via LayerZero endpoints
- Secure token burning on source chain and minting on destination

### Smart Contract Functions
- `send()` - Initiates cross-chain token transfer
- `balanceOf()` - Queries token balance
- `quoteSend()` - Estimates cross-chain messaging fee

### Wagmi Configuration
- Configured for both Base Sepolia and Hedera Testnet
- Auto-network switching
- Real-time balance updates

## Troubleshooting

### "Please switch to the correct network"
- Click the "Switch to [Network]" button
- Approve the network switch in MetaMask

### "Unrecognized chain" error
- Click "Add Hedera Testnet to MetaMask"
- Try switching again after adding

### "Insufficient balance" or low balance warning
- You need native tokens (ETH/HBAR) for gas fees
- Get testnet tokens from faucets (see Requirements section)

### Transaction not confirming
- Check your MetaMask for pending transactions
- Ensure you have enough gas tokens
- Check block explorer for transaction status

## Page Location
`/frontend/src/app/test/page.tsx`

## Dependencies Updated
- Added Hedera Testnet chain to `providers.tsx`
- Header component imported from `component/Header.tsx`
- Uses Wagmi v2 hooks for wallet interactions

## Styling
- Dark gradient background matching LinkedOut theme
- Glassmorphic card design
- Smooth transitions and hover effects
- Responsive layout for mobile/desktop

---

**Note:** This is a testnet implementation. Always verify contract addresses and network configurations before using on mainnet.

