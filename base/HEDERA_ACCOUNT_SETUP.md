# 🛠️ Hedera Account Setup Guide

## The Problem: "Sender account not found"

When deploying to Hedera testnet, you encountered:
```
Error: execution reverted: Sender account not found.
```

### Why This Happens

**Ethereum/Base Networks:**
- Any private key automatically has a valid address
- You can send ETH to any address, even if it's never been used
- No account creation needed

**Hedera Network:**
- Accounts must be **explicitly created** before they can be used
- Your Ethereum address `0x8ADab1E200627b935ACD336FB3EDC14D63C3224f` doesn't exist on Hedera yet
- Even with the correct private key, you can't use an address until a Hedera account is created

---

## Solutions

### 🎯 Solution 1: Create Hedera ECDSA Account (Recommended)

This allows you to use the **same private key** on both Base Sepolia and Hedera.

#### Step 1: Install Hedera SDK

```bash
cd /Users/zwavo/BaseLinkedOut/base
npm install --save @hashgraph/sdk
```

#### Step 2: Get a Temporary Hedera Account

You need an existing Hedera account to create your new one (to pay the ~1 HBAR creation fee).

**Option A: Hedera Portal (Easiest)**
1. Go to https://portal.hedera.com/
2. Click "Create Account" → "Testnet"
3. Complete the form (it's free)
4. You'll receive:
   - Account ID (e.g., `0.0.1234567`)
   - Private Key (e.g., `302e...`)
5. Get free testnet HBAR (automatically added)

**Option B: Use Hashpack Wallet**
1. Install Hashpack wallet extension
2. Create testnet account
3. Get Account ID and export private key

#### Step 3: Update Your .env File

```bash
cd /Users/zwavo/BaseLinkedOut/base
nano .env
```

Add these lines:
```env
# Your existing Ethereum/Base private key
PRIVATE_KEY=0x...your_key...

# Temporary operator account (from Hedera Portal)
HEDERA_OPERATOR_ID=0.0.1234567
HEDERA_OPERATOR_KEY=302e...portal_key...

# RPC URLs
RPC_URL_BASE_SEPOLIA=https://sepolia.base.org
RPC_URL_HEDERA=https://testnet.hashio.io/api
```

#### Step 4: Create Your Hedera Account

```bash
node scripts/create-hedera-account.js
```

This will:
- Use your temporary operator account to pay fees
- Create a new Hedera account linked to your Ethereum private key
- Fund it with 10 HBAR
- Give you a Hedera Account ID

#### Step 5: Deploy to Hedera

Now your Ethereum address exists on Hedera!

```bash
npx hardhat lz:deploy --network hedera-testnet
```

---

### 🔄 Solution 2: Use HashIO JSON-RPC with Auto-Account Creation

Some Hedera JSON-RPC providers automatically create accounts, but this may not work with Hardhat deploy.

---

### 💡 Solution 3: Use Pre-Existing Hedera Account

If you already have a Hedera account with HBAR:

#### Option A: Update .env to Use That Account

```env
# Use your existing Hedera account's private key
PRIVATE_KEY=your_hedera_account_key
```

#### Option B: Create New Account from Existing One

If you want to keep using your current Ethereum key, follow Solution 1.

---

## Quick Start: Easiest Path

### 1️⃣ Get Hedera Portal Account (2 minutes)

```bash
# Open this URL:
open https://portal.hedera.com/
```

- Click "Create Account" → "Testnet"
- Save the Account ID and Private Key

### 2️⃣ Update .env

```bash
cd /Users/zwavo/BaseLinkedOut/base
cat >> .env << 'EOF'

# Hedera Operator Account (temporary, for account creation)
HEDERA_OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_OPERATOR_KEY=YOUR_PORTAL_PRIVATE_KEY
EOF
```

### 3️⃣ Install Hedera SDK

```bash
npm install --save @hashgraph/sdk
```

### 4️⃣ Create Your Hedera Account

```bash
node scripts/create-hedera-account.js
```

### 5️⃣ Deploy to Hedera

```bash
npx hardhat lz:deploy --network hedera-testnet
```

✅ **Done!**

---

## Understanding Hedera Accounts

### Account ID vs EVM Address

Hedera accounts have **two identifiers**:

| Type | Format | Example | Usage |
|------|--------|---------|-------|
| **Account ID** | `0.0.XXXXX` | `0.0.1234567` | Native Hedera transactions |
| **EVM Address** | `0x...` | `0x8ADab...` | Smart contract interactions |

When you create a Hedera ECDSA account:
- It gets an Account ID (e.g., `0.0.1234567`)
- It also has an EVM address (derived from your Ethereum key)
- Both point to the same account

### How It Works

```
Your Ethereum Private Key
         ↓
    Public Key (ECDSA)
         ↓
    ┌────┴────┐
    ↓         ↓
EVM Address   Hedera Account ID
0x8ADab...    0.0.1234567
    ↓         ↓
   └─────┬─────┘
         ↓
   Same Account!
```

---

## Verification Steps

### Check Your Hedera Account Was Created

```bash
# After running create-hedera-account.js, visit:
open https://hashscan.io/testnet/account/0.0.YOUR_ACCOUNT_ID
```

You should see:
- ✅ Account balance (10 HBAR)
- ✅ Public key
- ✅ EVM address matches your Ethereum address

### Test Deployment

```bash
# Should now work:
npx hardhat lz:deploy --network hedera-testnet
```

---

## Troubleshooting

### Error: "INSUFFICIENT_PAYER_BALANCE"

**Cause:** Your operator account doesn't have enough HBAR

**Fix:**
1. Go to https://portal.hedera.com/
2. Log in to your operator account
3. Request testnet HBAR (free)

### Error: "HEDERA_OPERATOR_ID not found"

**Cause:** .env file missing operator credentials

**Fix:**
```bash
cd /Users/zwavo/BaseLinkedOut/base
nano .env
# Add HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY
```

### Error: "Invalid private key format"

**Cause:** Hedera portal key format different from Ethereum

**Fix:**
- Ethereum keys: `0x...` (64 hex chars)
- Hedera ECDSA keys: Can be DER encoded or raw
- Use the exact format from the portal

### Account Created But Deploy Still Fails

**Cause:** Account might not have enough HBAR for gas

**Fix:**
```javascript
// Check balance on Hashscan:
open https://hashscan.io/testnet/account/YOUR_ACCOUNT_ID

// If balance is low, the create script gave you 10 HBAR
// That should be enough. If not, send more from portal account.
```

---

## Cost Breakdown

| Action | Cost | One-Time? |
|--------|------|-----------|
| Create Hedera account | ~1 HBAR | Yes |
| Initial balance (for new account) | 10 HBAR | Yes |
| Deploy MyOFT contract | ~5 HBAR | Yes |
| Deploy ConditionalBridge | ~8 HBAR | Yes |
| Bridge transaction | ~0.1 HBAR | Per transaction |

**Total to get started:** ~25 testnet HBAR (FREE from portal)

---

## Next Steps After Account Creation

### 1. Deploy Your Contracts

```bash
# Deploy MyOFT to Hedera
npx hardhat lz:deploy --network hedera-testnet

# Verify it deployed
open https://hashscan.io/testnet/contract/YOUR_CONTRACT_ADDRESS
```

### 2. Wire Base ↔ Hedera

```bash
# Connect the two chains
npx hardhat lz:oapp:wire --oapp-config layerzero.config.ts
```

### 3. Test Bridge

```bash
# See TESTING_COMMANDS.sh for full commands
cat TESTING_COMMANDS.sh
```

---

## Alternative: Use Different Key for Hedera

If you prefer, you can:
1. Use one private key for Base Sepolia
2. Use a different private key for Hedera

Update `hardhat.config.ts`:

```typescript
networks: {
  'base-sepolia': {
    accounts: process.env.BASE_PRIVATE_KEY ? [process.env.BASE_PRIVATE_KEY] : undefined,
  },
  'hedera-testnet': {
    accounts: process.env.HEDERA_PRIVATE_KEY ? [process.env.HEDERA_PRIVATE_KEY] : undefined,
  },
}
```

Then in `.env`:
```env
BASE_PRIVATE_KEY=0x...your_ethereum_key...
HEDERA_PRIVATE_KEY=0x...your_hedera_key...
```

---

## Resources

- 🏛️ **Hedera Portal:** https://portal.hedera.com/
- 📖 **Hedera Docs:** https://docs.hedera.com/
- 🔍 **HashScan Explorer:** https://hashscan.io/testnet
- 💧 **Testnet Faucet:** https://portal.hedera.com/ (automatic)
- 💻 **Hedera SDK:** https://github.com/hashgraph/hedera-sdk-js

---

## Summary

**The issue:** Hedera requires explicit account creation, unlike Ethereum.

**The fix:** 
1. Get temporary Hedera account from portal
2. Run `create-hedera-account.js` 
3. Deploy normally

**Result:** Your Ethereum private key now works on both Base Sepolia and Hedera! 🎉

