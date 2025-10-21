#!/bin/bash
# Bridge Testing Commands - Quick Reference
# Make this file executable: chmod +x TESTING_COMMANDS.sh

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get your wallet address
YOUR_ADDRESS=$(grep PRIVATE_KEY .env 2>/dev/null || echo "YOUR_ADDRESS_HERE")

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Base Sepolia ↔️ Hedera Bridge Testing Commands    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"

echo -e "\n${GREEN}Step 1: Mint test tokens on Base Sepolia${NC}"
echo "npx hardhat run scripts/1-mint-tokens.js --network base-sepolia"

echo -e "\n${GREEN}Step 2: Check balances before bridging${NC}"
echo "npx hardhat run scripts/check-balance.js --network base-sepolia"
echo "npx hardhat run scripts/check-balance.js --network hedera-testnet"

echo -e "\n${GREEN}Step 3: Bridge Base Sepolia → Hedera (0.0005 tokens)${NC}"
echo "npx hardhat lz:oft:send \\"
echo "  --src-eid 40245 \\"
echo "  --dst-eid 40285 \\"
echo "  --to YOUR_ADDRESS \\"
echo "  --amount 0.0005 \\"
echo "  --network base-sepolia"

echo -e "\n${YELLOW}⏳ Wait 2-5 minutes for cross-chain delivery...${NC}"

echo -e "\n${GREEN}Step 4: Verify tokens received on Hedera${NC}"
echo "npx hardhat run scripts/check-balance.js --network hedera-testnet"

echo -e "\n${GREEN}Step 5: Bridge Hedera → Base Sepolia (0.0005 tokens)${NC}"
echo "npx hardhat lz:oft:send \\"
echo "  --src-eid 40285 \\"
echo "  --dst-eid 40245 \\"
echo "  --to YOUR_ADDRESS \\"
echo "  --amount 0.0005 \\"
echo "  --network hedera-testnet"

echo -e "\n${YELLOW}⏳ Wait 2-5 minutes for cross-chain delivery...${NC}"

echo -e "\n${GREEN}Step 6: Verify tokens received back on Base Sepolia${NC}"
echo "npx hardhat run scripts/check-balance.js --network base-sepolia"

echo -e "\n${BLUE}📊 Track transactions on LayerZero Scan:${NC}"
echo "https://testnet.layerzeroscan.com/"

echo -e "\n${BLUE}📝 Contract Addresses:${NC}"
echo "Base Sepolia:   0x82A16c0a82452aD07aae296b3E408d6Bcd9C3adf"
echo "Hedera Testnet: 0xAd9C65E6F4BD584A77bA942B7a5f4BEc67520181"

echo ""

