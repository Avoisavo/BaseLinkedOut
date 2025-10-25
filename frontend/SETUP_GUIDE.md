# Frontend Setup Guide

## Overview
This is a Next.js 15 application with Web3 integration using RainbowKit, Wagmi, and OnchainKit. It supports Base, Base Sepolia, and Hedera Testnet chains.

---

## Prerequisites

### Required Software
- **Node.js**: v18.18.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher (comes with Node.js)
- **Git**: Latest version

To check your versions:
```bash
node --version
npm --version
```

---

## Step-by-Step Setup

### 1. Clone the Repository (if not already done)
```bash
git clone <repository-url>
cd BaseLinkedOut/frontend
```

### 2. Install Dependencies
```bash
npm install
```

**Important**: This project uses specific versions of dependencies. If you encounter peer dependency warnings, use:
```bash
npm install --legacy-peer-deps
```

### 3. Create Environment Variables File

Create a `.env.local` file in the `frontend` directory:

```bash
touch .env.local
```

Add the following required environment variable:

```env
NEXT_PUBLIC_REOWN_PROJECT_ID=your_reown_project_id_here
```

**Where to get your REOWN_PROJECT_ID:**
1. Go to https://cloud.reown.com/
2. Sign up or log in
3. Create a new project
4. Copy your Project ID
5. Paste it in the `.env.local` file

⚠️ **CRITICAL**: Without this environment variable, the app will fail to start or throw Web3 connection errors.

---

## Running the Application

### Development Mode

```bash
npm run dev
```

This will start the development server with Turbopack at http://localhost:3000

### Production Build

```bash
npm run build
npm run start
```

### HTTPS Development Mode (Optional)

For testing with Web3 wallets that require HTTPS:

```bash
# First time only - setup certificates
npm run setup-https

# Then run with HTTPS
npm run dev:https
```

---

## Key Dependencies

### Core Framework
- **Next.js 15.5.5**: React framework with App Router
- **React 19.1.0**: Latest React version
- **TypeScript 5**: Type safety

### Web3 Stack
- **@rainbow-me/rainbowkit 2.2.9**: Wallet connection UI
- **wagmi 2.18.1**: React hooks for Ethereum
- **viem 2.38.2**: TypeScript Ethereum library
- **@coinbase/onchainkit 1.1.1**: Coinbase Web3 utilities
- **@base-org/account 2.4.0**: Base account abstraction

### UI/3D Graphics
- **Three.js 0.180.0**: 3D graphics
- **@react-three/fiber 9.4.0**: React renderer for Three.js
- **@react-three/drei 10.7.6**: Three.js helpers
- **Tailwind CSS 4.1.15**: Utility-first CSS

### State Management
- **@tanstack/react-query 5.90.5**: Data fetching and caching

---

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout with Web3Provider
│   │   ├── page.tsx           # Home page
│   │   ├── globals.css        # Global styles
│   │   ├── providers.tsx      # Web3 provider configuration
│   │   ├── flow/              # Flow builder pages
│   │   ├── land/              # Landing page
│   │   ├── prompt/            # Prompt pages
│   │   ├── testBridgeOnly/    # Bridge testing
│   │   └── workflowOverview/  # Workflow overview
│   ├── contexts/
│   │   └── BaseAccountContext.tsx
│   ├── lib/
│   │   ├── blockscout.ts      # Blockchain explorer integration
│   │   ├── telegram.ts        # Telegram bot integration
│   │   ├── web3.ts            # Web3 utilities
│   │   └── workflowStorage.ts # Workflow persistence
│   └── wagmi.ts               # Wagmi/RainbowKit configuration
├── component/
│   ├── Header.tsx
│   ├── TelegramNodeConfig.tsx
│   └── TemplateSidebar.tsx
├── public/                     # Static assets
├── next.config.ts             # Next.js configuration
├── tsconfig.json              # TypeScript configuration
├── postcss.config.mjs         # PostCSS configuration
├── eslint.config.mjs          # ESLint configuration
├── package.json               # Dependencies
└── .env.local                 # Environment variables (create this!)
```

---

## Supported Blockchain Networks

The application is configured to work with:

1. **Base Mainnet** (Chain ID: 8453)
2. **Base Sepolia Testnet** (Chain ID: 84532)
3. **Hedera Testnet** (Chain ID: 296)

Configuration is in `src/wagmi.ts`.

---

## Configuration Files

### next.config.ts
Basic Next.js configuration - currently uses default settings.

### tsconfig.json
TypeScript configuration with:
- Target: ES2017
- Strict mode enabled
- Path alias: `@/*` → `./src/*`

### postcss.config.mjs
Tailwind CSS v4 integration via PostCSS.

### eslint.config.mjs
Next.js and TypeScript linting rules.

---

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start development server with Turbopack |
| `dev:https` | `npm run dev:https` | Start HTTPS development server |
| `setup-https` | `npm run setup-https` | Setup HTTPS certificates for local dev |
| `build` | `npm run build` | Build production bundle |
| `start` | `npm run start` | Start production server |
| `lint` | `npm run lint` | Run ESLint |

---

## Important Notes

### 1. Environment Variables
- The app requires `NEXT_PUBLIC_REOWN_PROJECT_ID` to initialize Web3 providers
- Without it, you'll get wallet connection errors

### 2. Node Version
- This project uses Next.js 15 and React 19
- Requires Node.js 18.18+ (Node 20+ recommended)
- Using older Node versions will cause build failures

### 3. Package Installation
- If you see peer dependency warnings, use `--legacy-peer-deps`
- The project uses latest versions of Web3 libraries which may have peer dependency conflicts

### 4. First-Time Setup
- Always run `npm install` after cloning
- Create `.env.local` with required variables before starting
- If you get "module not found" errors, delete `node_modules` and `.next` folders and reinstall

### 5. Server-Side Rendering
- Web3 components are marked with `'use client'` directive
- The app supports SSR (configured in wagmi.ts)

---

## Getting Help

If you encounter issues:
1. Check the **TROUBLESHOOTING.md** file
2. Verify all prerequisites are met
3. Ensure environment variables are set correctly
4. Delete `node_modules`, `.next` folders and reinstall dependencies
5. Check that you're using the correct Node.js version

---

## Additional Documentation

- **BRIDGE_SETUP.md**: LayerZero bridge configuration
- **TELEGRAM_BOT_GUIDE.md**: Telegram bot integration
- **HTTPS_SETUP.md**: HTTPS development setup
- **RAINBOWKIT_SETUP_COMPLETE.md**: RainbowKit integration details
- **TROUBLESHOOTING.md**: Common errors and solutions

---

## Quick Start Checklist

- [ ] Node.js 18.18+ installed
- [ ] Cloned repository
- [ ] Navigated to `frontend` directory
- [ ] Created `.env.local` file
- [ ] Added `NEXT_PUBLIC_REOWN_PROJECT_ID` to `.env.local`
- [ ] Ran `npm install` (or `npm install --legacy-peer-deps`)
- [ ] Ran `npm run dev`
- [ ] Opened http://localhost:3000

If all steps are completed and you still have errors, see **TROUBLESHOOTING.md**.

