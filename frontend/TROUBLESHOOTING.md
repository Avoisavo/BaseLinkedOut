# Frontend Troubleshooting Guide

This guide covers common errors you might encounter when setting up or running the frontend application.

---

## Table of Contents
1. [Installation Errors](#installation-errors)
2. [npm run start / npm run dev Errors](#npm-run-start--npm-run-dev-errors)
3. [Build Errors](#build-errors)
4. [Web3/Wallet Connection Errors](#web3wallet-connection-errors)
5. [TypeScript Errors](#typescript-errors)
6. [General Solutions](#general-solutions)

---

## Installation Errors

### Error: `ERESOLVE unable to resolve dependency tree`

**Symptoms:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solution:**
```bash
npm install --legacy-peer-deps
```

**Why this happens:** The project uses cutting-edge versions of React 19 and Next.js 15, which may have peer dependency conflicts with some Web3 libraries.

---

### Error: `npm ERR! peer dep missing`

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall with legacy peer deps
npm install --legacy-peer-deps
```

---

### Error: `gyp ERR! stack Error: Python not found`

**Symptoms:**
Build tools requiring Python fail during installation.

**Solution:**
- **macOS:** `brew install python3`
- **Windows:** Install Python from https://www.python.org/downloads/
- **Linux:** `sudo apt-get install python3`

---

## npm run start / npm run dev Errors

### Error: `Error: Invalid URL`

**Symptoms:**
```
Error: Invalid URL
    at getDefaultConfig
```

**Cause:** Missing or invalid `NEXT_PUBLIC_REOWN_PROJECT_ID` environment variable.

**Solution:**
1. Create `.env.local` file in the `frontend` directory
2. Add your Reown project ID:
```env
NEXT_PUBLIC_REOWN_PROJECT_ID=your_actual_project_id_here
```
3. Get your project ID from https://cloud.reown.com/
4. Restart the dev server

---

### Error: `Module not found: Can't resolve '@rainbow-me/rainbowkit/styles.css'`

**Symptoms:**
```
Module not found: Can't resolve '@rainbow-me/rainbowkit/styles.css'
```

**Solution:**
```bash
# Reinstall RainbowKit
npm uninstall @rainbow-me/rainbowkit
npm install @rainbow-me/rainbowkit@2.2.9

# If that doesn't work, full reinstall:
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

---

### Error: `Error: listen EADDRINUSE: address already in use :::3000`

**Symptoms:**
Port 3000 is already in use.

**Solution:**
```bash
# Find the process using port 3000
lsof -ti:3000

# Kill the process (macOS/Linux)
kill -9 $(lsof -ti:3000)

# Or run on a different port
PORT=3001 npm run dev
```

**Windows:**
```bash
# Find process
netstat -ano | findstr :3000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

---

### Error: `Error: Cannot find module 'next'`

**Symptoms:**
```
Error: Cannot find module 'next'
internal/modules/cjs/loader.js
```

**Cause:** Dependencies not installed or corrupted node_modules.

**Solution:**
```bash
# Remove all dependencies
rm -rf node_modules package-lock.json

# Clear npm cache
npm cache clean --force

# Reinstall
npm install --legacy-peer-deps
```

---

### Error: `Digital envelope routines::unsupported`

**Symptoms:**
```
Error: error:0308010C:digital envelope routines::unsupported
opensslErrorStack: [ 'error:03000086:digital envelope routines::initialization error' ]
```

**Cause:** Node.js version too old or OpenSSL version incompatibility.

**Solution:**
```bash
# Update Node.js to v18.18+ or v20+
# Using nvm (recommended):
nvm install 20
nvm use 20

# Verify version
node --version
```

---

## Build Errors

### Error: `Build failed because of webpack errors`

**Solution:**
```bash
# Delete build cache
rm -rf .next

# Try building again
npm run build
```

---

### Error: `Type error: Cannot find module or its corresponding type declarations`

**Symptoms:**
TypeScript cannot find installed packages.

**Solution:**
```bash
# Regenerate TypeScript types
npx next dev

# Wait for Next.js to generate types, then stop with Ctrl+C
# Then try building again
npm run build
```

---

## Web3/Wallet Connection Errors

### Error: `Hydration failed because the initial UI does not match what was rendered on the server`

**Symptoms:**
React hydration errors when using Web3 components.

**Cause:** Web3 components rendering on server-side when they should be client-only.

**Solution:**
This is already handled in the codebase with `'use client'` directive in `providers.tsx`. If you still see this:

```typescript
// Make sure your component using Web3 has 'use client' at the top
'use client';

import { useAccount } from 'wagmi';
```

---

### Error: `RainbowKitProvider: You must provide a valid Reown project ID`

**Solution:**
1. Ensure `.env.local` exists in the `frontend` directory
2. Verify `NEXT_PUBLIC_REOWN_PROJECT_ID` is set
3. Get a project ID from https://cloud.reown.com/
4. Restart the server after adding the env variable

---

### Error: `No wallets found` or Wallet not connecting

**Solution:**
1. Make sure you have a Web3 wallet installed (MetaMask, Coinbase Wallet, etc.)
2. Try in a different browser
3. Clear browser cache
4. Check that the wallet extension is enabled
5. Try connecting with a different wallet

---

## TypeScript Errors

### Error: `Cannot use import statement outside a module`

**Symptoms:**
ESLint or TypeScript configuration errors.

**Solution:**
The project is already configured correctly. If you see this error:

```bash
# Verify tsconfig.json has correct module settings
# Delete TypeScript build info
rm -rf **/*.tsbuildinfo .next

# Restart dev server
npm run dev
```

---

### Error: `Type 'X' is not assignable to type 'Y'`

**Solution:**
```bash
# Update TypeScript definitions
npm install --save-dev @types/node@latest @types/react@latest @types/react-dom@latest

# Restart TypeScript server in your IDE
# VSCode: Cmd/Ctrl + Shift + P -> "TypeScript: Restart TS Server"
```

---

## General Solutions

### Nuclear Option: Complete Reinstall

If nothing else works:

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Remove all generated files and dependencies
rm -rf node_modules
rm -rf .next
rm -rf out
rm -rf build
rm package-lock.json

# 3. Clear npm cache
npm cache clean --force

# 4. Reinstall everything
npm install --legacy-peer-deps

# 5. Start fresh
npm run dev
```

---

### Verify Your Environment

```bash
# Check Node version (should be 18.18+ or 20+)
node --version

# Check npm version (should be 9+)
npm --version

# Check if you're in the right directory
pwd
# Should end with: /BaseLinkedOut/frontend

# Check if package.json exists
ls package.json

# Check if .env.local exists
ls .env.local
```

---

### Common File Checklist

Make sure these files exist:

- [ ] `package.json` ✅
- [ ] `package-lock.json` (generated after npm install)
- [ ] `.env.local` (YOU MUST CREATE THIS)
- [ ] `next.config.ts` ✅
- [ ] `tsconfig.json` ✅
- [ ] `src/app/layout.tsx` ✅
- [ ] `src/app/providers.tsx` ✅
- [ ] `src/wagmi.ts` ✅

---

## Environment Variable Template

Create `.env.local` in the `frontend` directory with this content:

```env
# Required: Get from https://cloud.reown.com/
NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id_here

# Optional: Add other environment variables as needed
# NEXT_PUBLIC_ALCHEMY_ID=
# NEXT_PUBLIC_INFURA_ID=
```

---

## Still Having Issues?

### Provide This Information:

When asking for help, include:

```bash
# 1. Your environment info
node --version
npm --version
npx next --version

# 2. Operating System
# macOS / Windows / Linux (which distro?)

# 3. Full error message
# Copy the entire error from terminal

# 4. What you've tried
# List the solutions you've already attempted

# 5. Contents of your package.json (if modified)
cat package.json

# 6. Check if .env.local exists and has content (don't share the actual ID)
ls -la .env.local
```

---

## Quick Diagnostic Script

Run this to check your setup:

```bash
#!/bin/bash
echo "=== Frontend Diagnostic ==="
echo ""
echo "Node version:"
node --version
echo ""
echo "NPM version:"
npm --version
echo ""
echo "Current directory:"
pwd
echo ""
echo "package.json exists:"
ls package.json 2>&1
echo ""
echo ".env.local exists:"
ls .env.local 2>&1
echo ""
echo "node_modules exists:"
ls -d node_modules 2>&1
echo ""
echo ".next exists:"
ls -d .next 2>&1
echo ""
echo "=== End Diagnostic ==="
```

Save as `diagnostic.sh`, make executable with `chmod +x diagnostic.sh`, then run `./diagnostic.sh`

---

## Error Code Reference

| Error Code | Likely Cause | Quick Fix |
|------------|--------------|-----------|
| `ERESOLVE` | Peer dependency conflicts | `npm install --legacy-peer-deps` |
| `EADDRINUSE` | Port already in use | Kill process on port 3000 |
| `MODULE_NOT_FOUND` | Missing dependencies | `rm -rf node_modules && npm install` |
| `ERR_REQUIRE_ESM` | Module system mismatch | Check Next.js config |
| `ERR_INVALID_URL` | Missing env variables | Create `.env.local` with proper values |

---

## Additional Resources

- **Next.js Documentation:** https://nextjs.org/docs
- **RainbowKit Documentation:** https://www.rainbowkit.com/docs
- **Wagmi Documentation:** https://wagmi.sh/
- **Reown Cloud:** https://cloud.reown.com/
- **Node.js Downloads:** https://nodejs.org/

---

## Success Indicators

You know everything is working when:
- ✅ `npm install` completes without errors
- ✅ `npm run dev` starts server on port 3000
- ✅ Browser opens to http://localhost:3000
- ✅ No console errors in browser developer tools
- ✅ Wallet connect button appears and works
- ✅ Page loads without hydration errors

If all of these are true, your setup is complete! 🎉

