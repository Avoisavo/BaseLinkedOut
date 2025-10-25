# LinkedOut 🔗

**The first no-code onchain automation platform that bridges Web2 and Web3**

Build cross-chain workflows with a visual drag-and-drop interface — no coding required.

![Base](https://img.shields.io/badge/Built%20on-Base-0052FF?style=for-the-badge&logo=ethereum)
![LayerZero](https://img.shields.io/badge/Powered%20by-LayerZero-6C47FF?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

---

## 🎯 Problem Statement

**1. Onchain automation is complex** — requires coding, custom scripts, and manual monitoring  
**2. No unified workflow tool** — users can't easily connect wallets, smart contracts, and bridges across chains  
**3. Web3 lacks no-code accessibility** — unlike Web2 tools (n8n, Zapier), creating cross-chain automations isn't user-friendly

---

## 💡 The Solution

**LinkedOut** is a visual workflow automation platform that brings n8n/Zapier-like simplicity to Web3. Build sophisticated cross-chain automations by connecting nodes:

- 🤖 **AI Agents** (XMTP-powered conversational bots)
- 📱 **Telegram Bots** (trigger workflows from chat)
- 🌉 **Cross-Chain Bridges** (Base ↔ Hedera via LayerZero)
- 📊 **Price Oracles** (Pyth Network real-time data)
- 📧 **Web2 Integrations** (Gmail, APIs)
- ⚡ **Conditional Logic** (if/else, price triggers)

**No code. Just drag, drop, connect, and execute.**

---

## 🔥 Why We Built This

The Web3 ecosystem is fragmented. Developers spend weeks building custom scripts for simple automations like "bridge tokens when ETH hits $3500" or "send Telegram notifications when a transaction completes." Meanwhile, Web2 has had Zapier and n8n for years — tools that anyone can use without writing a single line of code.

**We saw three fundamental gaps:**

1. **Accessibility Barrier**: Setting up cross-chain bridges, price feeds, and conditional logic requires deep technical knowledge. Only developers can automate DeFi workflows, leaving 99% of crypto users stuck with manual processes.

2. **Tool Fragmentation**: Want to bridge tokens with price conditions? You'll need LayerZero docs, Pyth integration, custom keeper bots, wallet management, and weeks of development. Each protocol lives in isolation with no unified interface.

3. **Missing Web2 Bridge**: The most powerful Web3 use cases involve real-world triggers — Telegram commands, price alerts, email notifications. But combining Web2 APIs with Web3 smart contracts is a nightmare of incompatible systems.

**LinkedOut solves all three by creating a visual canvas where blockchain primitives become drag-and-drop building blocks.** A founder can now build "auto-bridge treasury funds during market dips" in 5 minutes, not 5 weeks. A community manager can create "distribute rewards when members complete tasks" without hiring a developer.

**We're democratizing onchain automation the same way Zapier democratized API integration** — by abstracting complexity into intuitive workflows. This isn't just a tool; it's the missing infrastructure layer that makes Web3 accessible to the next 100 million users.

---

## 🏗️ Architecture

### Tech Stack

**Frontend**
- **Next.js 15** - React framework with App Router
- **TailwindCSS** - Modern UI styling
- **Wagmi + RainbowKit** - Wallet connection
- **React Flow** - Visual workflow canvas

**Smart Contracts**
- **Solidity ^0.8.22** - Contract language
- **Hardhat** - Development environment
- **LayerZero V2** - Cross-chain messaging
- **OpenZeppelin** - Secure contract libraries
- **Pyth Network** - Price oracle integration

**Backend/Agents**
- **XMTP Agent SDK** - AI chat agents
- **Node.js** - Automation scripts
- **Ethers.js v6** - Blockchain interaction

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                        │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Visual    │  │   Workflow   │  │    Wallet    │       │
│  │   Canvas    │──│   Executor   │──│  Integration │       │
│  └─────────────┘  └──────────────┘  └──────────────┘       │
└────────────────────────────┬────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
        ┌───────────▼───────┐  ┌─────▼──────────┐
        │  Smart Contracts  │  │   XMTP Agent   │
        │    (Base Chain)   │  │  (AI Assistant)│
        └────────┬──────────┘  └────────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
┌───▼────┐  ┌───▼─────┐  ┌──▼──────┐
│LayerZero│  │  Pyth   │  │Telegram │
│  OFT    │  │ Oracle  │  │   Bot   │
└─────────┘  └─────────┘  └─────────┘
```

---

## ✨ Key Features

### 1. **Visual Workflow Builder**
Drag and drop nodes to create complex automations:
- **Trigger Nodes**: Start workflows (Telegram message, price threshold, time-based)
- **Action Nodes**: Execute operations (bridge tokens, send messages, swap assets)
- **Logic Nodes**: Add conditions (if/else, wait, loop)
- **Integration Nodes**: Connect services (AI agents, Gmail, APIs)

### 2. **Cross-Chain Bridge Integration**
Seamlessly move assets between chains:
- **Base Sepolia ↔ Hedera Testnet** (via LayerZero OFT)
- **Automatic fee calculation** and gas optimization
- **Real-time tracking** with block explorer links
- **Telegram notifications** on completion

### 3. **Conditional Bridge Execution**
Smart contracts that auto-execute when conditions are met:
- **Price-triggered bridges**: "Bridge when ETH > $3500"
- **Pyth Network integration** for real-time price feeds
- **Keeper bot system** (anyone can execute, earn rewards)
- **Order expiry** and cancellation support

### 4. **AI Agent Integration**
XMTP-powered conversational agents:
- **Natural language commands** ("bridge 0.1 ETH to Hedera")
- **Groq LLM integration** (Llama 3.3 70B)
- **Payment processing** (USDC transfers)
- **Multi-network support** (Base, Ethereum)

> ⚠️ **Note**: The AI agent is currently trained for specific workflows (bridging, payments). Custom workflows may require additional training and prompt engineering.

### 5. **Telegram Bot Workflows**
Trigger automations from chat:
- **Custom bot integration** (BotFather setup)
- **Command parsing** (extract amounts, addresses, actions)
- **Bidirectional notifications** (workflow → Telegram)
- **Group chat support**

---

## ⚠️ Important Disclaimer

**AI Agent Workflow Limitations**: The AI agent integration is currently optimized for specific use cases (cross-chain bridging and payment operations). While the visual workflow builder supports diverse node types, **AI-powered workflows beyond these core functions may not execute correctly** without additional training data and prompt engineering.

**What works today:**
- ✅ Cross-chain bridging (Base ↔ Hedera)
- ✅ USDC payment processing
- ✅ Telegram-triggered automations
- ✅ Price-conditional bridges (Pyth integration)

**What may require additional AI training:**
- ⚠️ Custom multi-step workflows with novel logic
- ⚠️ Complex Web2 integrations (Gmail, Discord, APIs)
- ⚠️ Advanced DeFi operations (swaps, liquidity, staking)
- ⚠️ NFT-related automations

We're actively expanding AI capabilities. If you build a workflow that doesn't execute as expected, please [open an issue](https://github.com/your-org/BaseLinkedOut/issues) with your workflow configuration so we can improve the model.

---

## 🚀 Quick Start

### Prerequisites

```bash
Node.js >= 18.16.0
npm or yarn
MetaMask or Coinbase Wallet
Base Sepolia testnet ETH
```

### 1. Clone Repository

```bash
git clone https://github.com/your-org/BaseLinkedOut.git
cd BaseLinkedOut
```

### 2. Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Smart Contracts
cd ../base
npm install

# XMTP Agent (optional)
cd ../xmtp-agent
npm install
```

### 3. Configure Environment

**Frontend** (`frontend/.env.local`):
```bash
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_BASE_RPC_URL=https://sepolia.base.org
```

**Contracts** (`base/.env`):
```bash
PRIVATE_KEY=your_private_key_here
BASE_SEPOLIA_RPC=https://sepolia.base.org
ETHERSCAN_API_KEY=your_etherscan_key
```

**XMTP Agent** (`xmtp-agent/agent/xmtp-ai-payment-agent/.env`):
```bash
XMTP_ENV=dev
CDP_API_KEY_NAME=your_cdp_key
CDP_API_KEY_PRIVATE_KEY=your_cdp_private_key
GROQ_API_KEY=your_groq_key
```

### 4. Deploy Smart Contracts

```bash
cd base

# Deploy OFT token
npx hardhat deploy --network base-sepolia --tags MyOFT

# Deploy Conditional Bridge
npx hardhat deploy --network base-sepolia --tags ConditionalBridge
```

### 5. Run Frontend

```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` and start building workflows!

---

## 📊 Deployed Contracts (Base Sepolia)

| Contract | Address | Explorer |
|----------|---------|----------|
| **MyOFT** | `0x612F53C77972F2ACaD4Bfc2D9b64cD255326aE3a` | [View on BaseScan](https://sepolia.basescan.org/address/0x612F53C77972F2ACaD4Bfc2D9b64cD255326aE3a) |
| **ConditionalBridge** | `0x07e43b886bAFBF35F9777BFD5C395023f4b01152` | [View on BaseScan](https://sepolia.basescan.org/address/0x07e43b886bAFBF35F9777BFD5C395023f4b01152) |

### Example Transactions

✅ **OFT Cross-Chain Bridge**: [View on LayerZero Scan](https://testnet.layerzeroscan.com/)  
✅ **Conditional Order Creation**: Multiple test orders created and executed  
✅ **Price Oracle Integration**: Active Pyth price feed queries

> **Note**: Check the [deployments folder](./base/deployments/base-sepolia/) for full deployment details including ABIs, transaction hashes, and deployment timestamps.

---

## 🎓 Usage Examples

### Example 1: Simple Bridge Workflow

```
[Telegram Trigger] → [Base Node] → [Telegram Notification]
```

**What it does**: User sends "/bridge 0.1" to bot → LinkedOut bridges 0.1 MyOFT from Base to Hedera → User receives confirmation

### Example 2: Price-Conditional Bridge

```
[Pyth Price Feed] → [If/Else Logic] → [Conditional Bridge]
                         ↓
                   [Telegram Alert]
```

**What it does**: Monitor ETH price → When price > $3500 → Execute bridge order → Notify user

### Example 3: AI-Powered Automation

```
[XMTP Chat] → [AI Agent Parse] → [Base Bridge] → [Confirmation]
```

**What it does**: User chats "send 0.5 ETH to Hedera when price dips" → AI extracts intent → Creates conditional order → Executes automatically

### Example 4: Multi-Step Workflow

```
[Gmail Trigger] → [If/Else] → [AI Agent] → [Bridge + Swap] → [Notifications]
                     ↓
              [Alternative Path]
```

**What it does**: Complex logic with multiple branches, external integrations, and conditional execution

---

## 🔬 Technical Highlights

### Originality: Unique Value Proposition

✅ **First visual workflow builder** for cross-chain DeFi automation  
✅ **Web2 + Web3 hybrid** — connects Telegram/Gmail with smart contracts  
✅ **No-code conditional bridges** — set price triggers without writing Solidity  
✅ **Decentralized keeper network** — open execution with incentive rewards  
✅ **XMTP AI agents** — conversational UX for complex blockchain operations

### Viability: Target Customer Profile

1. **DeFi Power Users** - Automate treasury management, yield farming, cross-chain strategies
2. **DAOs** - Build conditional payment systems, automated reward distributions
3. **Web3 Founders** - Create user-facing automations without hiring developers
4. **Community Managers** - Set up Telegram bots for bridging, payments, notifications
5. **Crypto Traders** - Implement price-based strategies across chains

### Practicality: Usable & Accessible

- ✅ **No coding required** — visual interface for all operations
- ✅ **Wallet-based auth** — no signups, just connect wallet
- ✅ **One-click workflows** — templates for common use cases
- ✅ **Real-time feedback** — visual execution tracking
- ✅ **Mobile-friendly** — works on desktop and mobile browsers

### Wow Factor: Remarkable Impact

**Before LinkedOut:**
```bash
# 2-3 weeks of development
1. Learn LayerZero OFT contracts
2. Integrate Pyth price feeds
3. Build custom keeper bot
4. Set up monitoring infrastructure
5. Handle error cases
6. Deploy and maintain servers
```

**With LinkedOut:**
```bash
# 5 minutes
1. Drag "Pyth Price" node
2. Connect to "If/Else" node
3. Add "Bridge" node
4. Click "Execute Workflow"
```

**Result**: 99% reduction in time, 100% reduction in code

---

## 🧪 Testing & Development

### Run Tests

```bash
# Smart Contract Tests
cd base
npx hardhat test

# Frontend Tests (if implemented)
cd frontend
npm test
```

### Local Development

```bash
# Start local Hardhat node
cd base
npx hardhat node

# Deploy to local network
npx hardhat deploy --network localhost

# Run frontend with local contracts
cd frontend
npm run dev
```

### Scripts

```bash
# Check balances
cd base/scripts
node check-balances.js

# Mint test tokens
node mint-base.js

# Manual bridge test
node bridge-to-hedera.js

# Auto-bridge with monitoring
node auto-bridge-base-to-hedera.js
```

---

## 📚 Documentation

Detailed guides in the `/frontend` and `/base` directories:

- **[Workflow Bridge Guide](./frontend/WORKFLOW_BRIDGE_GUIDE.md)** - Complete workflow execution tutorial
- **[Implementation Summary](./base/IMPLEMENTATION_SUMMARY.md)** - Smart contract architecture
- **[Wallet Setup](./frontend/WALLET_SETUP.md)** - Configure MetaMask/Coinbase
- **[Telegram Bot Setup](./frontend/TELEGRAM_BOT_SETUP.md)** - BotFather configuration
- **[Testing Commands](./base/TESTING_COMMANDS.sh)** - Common CLI operations

---

## 🛣️ Roadmap

### Phase 1: Foundation ✅ (Completed)
- [x] Visual workflow builder
- [x] LayerZero cross-chain bridge
- [x] Conditional bridge with Pyth
- [x] Telegram bot integration
- [x] XMTP AI agent
- [x] Deploy to Base Sepolia

### Phase 2: Expansion 🚧 (In Progress)
- [ ] Additional chains (Arbitrum, Optimism, Polygon)
- [ ] More Web2 integrations (Discord, Twitter, webhooks)
- [ ] DEX swap nodes (Uniswap, SushiSwap)
- [ ] NFT operations (mint, transfer, list)
- [ ] Scheduling/cron triggers
- [ ] Expand AI agent training for custom workflows

### Phase 3: Advanced Features 🔮 (Planned)
- [ ] Workflow marketplace (share/monetize workflows)
- [ ] Team collaboration (shared workflows)
- [ ] Advanced analytics dashboard
- [ ] Workflow versioning and rollback
- [ ] Custom node SDK (developer extensions)
- [ ] Mainnet deployment

### Phase 4: Enterprise 🏢 (Future)
- [ ] White-label solutions
- [ ] On-premise deployment
- [ ] Advanced access controls
- [ ] SLA monitoring
- [ ] Dedicated support

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style (ESLint/Prettier configured)
- Write tests for new features
- Update documentation
- Keep commits atomic and descriptive

---

## 🐛 Known Issues & Limitations

**Current Limitations:**
- ⚠️ **Testnet only** - Not yet audited for mainnet
- ⚠️ **Base Sepolia ↔ Hedera** - Limited to these chains currently
- ⚠️ **Manual wallet signatures** - Each transaction requires user approval
- ⚠️ **No workflow persistence** - Workflows stored in localStorage (not database)
- ⚠️ **AI agent training** - AI workflows are currently optimized for bridging and payment operations. Complex custom workflows may not work as expected without additional prompt engineering and model fine-tuning

**Planned Fixes:**
- Smart contract audit before mainnet launch
- Multi-chain expansion (Arbitrum, Optimism, Polygon)
- Account abstraction for gasless transactions
- Backend database for workflow storage





<p align="center">
  <a href="https://base.org">
    <img src="./frontend/public/newbaselogo.png" alt="Base" height="40"/>
  </a>
  &nbsp;&nbsp;&nbsp;
  <a href="https://layerzero.network">
    <img src="./frontend/public/layerzerologo.png" alt="LayerZero" height="40"/>
  </a>
  &nbsp;&nbsp;&nbsp;
  <a href="https://pyth.network">
    <img src="./frontend/public/pythlogo.png" alt="Pyth" height="40"/>
  </a>
</p>


