# 🤖 Conditional Bridge - Automated Cross-Chain Bridging

> **Auto-execute token bridges when price conditions are met**  
> Perfect for Telegram bots, DeFi automation, and conditional trading

---

## 🎯 What Is This?

A smart contract system that lets users create **conditional bridge orders** that automatically execute when price targets are met.

### Example Use Case

**User says:** *"Bridge 0.005 ETH from Base Sepolia to HBAR when ETH price reaches $3800"*

**What happens:**
1. ✅ Order created on-chain
2. ✅ Keeper bot monitors Pyth price feed
3. ✅ When ETH hits $3800, order auto-executes via LayerZero
4. ✅ User notified via Telegram

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Deploy Contracts

```bash
npx hardhat deploy --network base-sepolia --tags ConditionalBridge
```

### 3. Test System

```bash
node scripts/test-system.js
```

### 4. Run Keeper Bot

```bash
node scripts/monitor-orders.js
```

**That's it!** You now have a working conditional bridge system.

---

## 📁 Project Structure

```
base/
├── contracts/
│   ├── ConditionalBridge.sol      # Main contract - conditional orders
│   ├── MyOFT.sol                  # LayerZero OFT token
│   └── PriceConsumer.sol          # Pyth price feed helper
│
├── deploy/
│   └── ConditionalBridge.ts       # Deployment script
│
├── scripts/
│   ├── test-system.js             # Test entire system
│   ├── create-conditional-order.js # Create new order
│   ├── execute-conditional-order.js # Execute single order
│   └── monitor-orders.js          # Keeper bot (continuous)
│
├── docs/
│   ├── QUICK_START.md             # 5-minute start guide
│   ├── CONDITIONAL_BRIDGE_GUIDE.md # Complete documentation
│   ├── IMPLEMENTATION_SUMMARY.md  # Architecture overview
│   ├── CONSTANTS.md               # All constants & IDs
│   └── README_CONDITIONAL_BRIDGE.md # This file
```

---

## 🔧 Core Features

### For Users
- ✅ Set price conditions for bridging
- ✅ Multiple condition types (above/below)
- ✅ Order expiry system
- ✅ Cancel anytime before execution
- ✅ Works with any Pyth price feed
- ✅ Any LayerZero-supported chain

### For Developers
- ✅ Simple integration with Telegram bots
- ✅ Event-driven architecture
- ✅ View functions for monitoring
- ✅ Secure (OpenZeppelin standards)
- ✅ Keeper incentives (0.1% reward)
- ✅ Well-documented code

---

## 📚 Documentation

| Document | Description | When to Read |
|----------|-------------|--------------|
| **QUICK_START.md** | Get running in 5 minutes | Start here |
| **IMPLEMENTATION_SUMMARY.md** | Architecture & design | Understanding system |
| **CONDITIONAL_BRIDGE_GUIDE.md** | Complete guide | Production setup |
| **CONSTANTS.md** | All IDs & addresses | Integration |

---

## 🎮 How to Use

### Create Order (JavaScript)

```javascript
const ethers = require('ethers');

// Setup
const conditionalBridge = await ethers.getContractAt('ConditionalBridge', address);
const ETH_USD = "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace";

// Approve tokens
await myOFT.approve(conditionalBridge.address, amount);

// Create order
const tx = await conditionalBridge.createOrder(
  ethers.parseEther("0.005"),  // amount
  40287,                        // destination chain (Hedera Testnet)
  ETH_USD,                      // price feed ID
  3800e8,                       // target price ($3800)
  0,                            // PRICE_ABOVE
  7 * 86400,                    // expires in 7 days
  "0x"                          // LayerZero options
);

await tx.wait();
console.log("Order created!");
```

### Monitor Orders (Keeper Bot)

```bash
# Run continuously
node scripts/monitor-orders.js

# Or with PM2 for production
pm2 start scripts/monitor-orders.js --name keeper-bot
```

### Listen for Events

```javascript
// Listen for order executions
conditionalBridge.on('OrderExecuted', (orderId, executor, price) => {
  console.log(`Order ${orderId} executed at $${Number(price) / 1e8}`);
  // Notify user via Telegram, Discord, etc.
});
```

---

## 🔗 Integration Examples

### Telegram Bot

```javascript
// Parse user command
bot.on('message', async (msg) => {
  const command = await aiAgent.parse(msg.text);
  // command: { action: "bridge", amount: "0.005", condition: { price: 3800, operator: ">=" } }
  
  // Create order
  const orderId = await conditionalBridge.createOrder(...);
  
  // Notify user
  bot.sendMessage(msg.chat.id, `✅ Order #${orderId} created!`);
});

// Listen for executions
conditionalBridge.on('OrderExecuted', async (orderId) => {
  const user = await getUserByOrder(orderId);
  bot.sendMessage(user.chatId, `🎉 Your order executed!`);
});
```

### Discord Bot

```javascript
client.on('messageCreate', async (message) => {
  if (message.content.startsWith('!bridge')) {
    // Parse command and create order
    const orderId = await createOrder(...);
    await message.reply(`Order #${orderId} created!`);
  }
});
```

### Web Frontend

```javascript
// React component
const createBridgeOrder = async () => {
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(address, abi, signer);
  
  const tx = await contract.createOrder(...);
  await tx.wait();
  
  toast.success("Order created!");
};
```

---

## 🧪 Testing

### 1. Run Full System Test

```bash
node scripts/test-system.js
```

This tests:
- ✅ Contract deployments
- ✅ Token balance
- ✅ Pyth price feeds
- ✅ Order creation
- ✅ Condition checking
- ✅ User queries

### 2. Create Test Order

```bash
node scripts/create-conditional-order.js
```

### 3. Execute Order Manually

```bash
node scripts/execute-conditional-order.js 0
```

### 4. Monitor Orders

```bash
node scripts/monitor-orders.js
```

---

## 📊 Smart Contract API

### Main Functions

#### `createOrder()`
Create a new conditional bridge order.

```solidity
function createOrder(
    uint256 amount,
    uint32 dstEid,
    bytes32 priceFeedId,
    int64 targetPrice,
    ConditionType conditionType,
    uint256 expiryDuration,
    bytes calldata lzOptions
) external returns (uint256 orderId)
```

#### `executeOrder()`
Execute order when price condition is met.

```solidity
function executeOrder(
    uint256 orderId,
    bytes[] calldata priceUpdate
) external payable
```

#### `checkOrderCondition()`
Check if order is ready to execute.

```solidity
function checkOrderCondition(uint256 orderId) 
    external view 
    returns (bool met, int64 currentPrice)
```

#### `cancelOrder()`
Cancel pending order and get refund.

```solidity
function cancelOrder(uint256 orderId) external
```

---

## 🔒 Security

### Audited Components
- ✅ OpenZeppelin Ownable
- ✅ OpenZeppelin ReentrancyGuard
- ✅ LayerZero OFT (audited)
- ✅ Pyth Network (audited)

### Security Features
- ✅ Explicit token approvals required
- ✅ Order ownership checks
- ✅ Price staleness checks
- ✅ No proxy patterns (simpler, safer)
- ✅ Emergency withdraw function

### Recommendations
- 🔐 Use hardware wallet for deployment
- 🔐 Implement rate limiting in backend
- 🔐 Use account abstraction for better UX
- 🔐 Monitor contract events
- 🔐 Get professional audit before mainnet

---

## 💰 Economics

### Costs

| Action | Gas | Cost @ 50 gwei | Paid By |
|--------|-----|----------------|---------|
| Create Order | ~150k | ~$2.50 | User |
| Execute Order | ~300k | ~$5.00 | Keeper |
| Cancel Order | ~50k | ~$0.83 | User |

### Keeper Rewards

- **Default**: 0.1% of bridged amount
- **Example**: Bridge 1 ETH → Keeper earns 0.001 ETH
- **Profitable when**: Reward > Gas cost
- **Typical**: Profitable for orders > 0.1 ETH

---

## 🌐 Supported Networks

### Testnet
- ✅ Base Sepolia
- ✅ Hedera Testnet
- ✅ Ethereum Sepolia
- ✅ Arbitrum Sepolia
- ✅ Optimism Sepolia

### Mainnet (Ready)
- ✅ Base
- ✅ Ethereum
- ✅ Arbitrum
- ✅ Optimism
- ✅ Polygon
- ✅ Avalanche

**Full list:** See `CONSTANTS.md`

---

## 📈 Pyth Price Feeds

### Supported Assets
- 💎 Crypto: ETH, BTC, SOL, AVAX, MATIC, etc.
- 💵 Stablecoins: USDC, USDT, DAI
- 🏦 Stocks: AAPL, TSLA, GOOGL, etc.
- 🌍 Forex: EUR/USD, GBP/USD, JPY/USD

**400+ price feeds available!**

**Full list:** https://pyth.network/developers/price-feed-ids

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Write tests
4. Submit a pull request

---

## 📝 License

MIT License - see LICENSE file for details

---

## 🆘 Support

### Common Issues

**"Transfer failed"**
- Solution: Approve ConditionalBridge to spend tokens first

**"Price condition not met"**
- Solution: Check current price vs target with `checkOrderCondition()`

**"Insufficient fee"**
- Solution: Send more ETH with `executeOrder()` for Pyth + LayerZero fees

**"Order expired"**
- Solution: Call `markExpired()` to return tokens, create new order

### Get Help

- 📖 **Docs**: See CONDITIONAL_BRIDGE_GUIDE.md
- 🐛 **Issues**: Open GitHub issue
- 💬 **Discord**: [Your Discord]
- 📧 **Email**: [Your Email]

---

## 🔗 Useful Links

- **Pyth Network**: https://pyth.network
- **LayerZero**: https://layerzero.network
- **OpenZeppelin**: https://openzeppelin.com
- **Hermes API**: https://hermes.pyth.network/docs
- **Base Docs**: https://docs.base.org

---

## 🎯 Roadmap

### ✅ Phase 1: MVP (Current)
- [x] Basic conditional orders
- [x] Pyth price feeds
- [x] LayerZero bridging
- [x] Keeper bot
- [x] Documentation

### 🚧 Phase 2: Enhanced Features
- [ ] Multi-condition orders (AND/OR)
- [ ] Recurring orders
- [ ] Stop-loss orders
- [ ] Take-profit orders
- [ ] Order templates

### 🔮 Phase 3: Advanced
- [ ] Account abstraction integration
- [ ] Decentralized keeper network
- [ ] Social trading features
- [ ] Mobile app
- [ ] Analytics dashboard

---

## 🙏 Acknowledgments

Built with:
- **LayerZero** - Cross-chain messaging
- **Pyth Network** - Price feeds
- **OpenZeppelin** - Secure contracts
- **Hardhat** - Development environment

---

## 📞 Contact

- **GitHub**: [Your GitHub]
- **Twitter**: [Your Twitter]
- **Telegram**: [Your Telegram]
- **Discord**: [Your Discord]

---

<div align="center">

**Made with ❤️ for the DeFi community**

[Documentation](./CONDITIONAL_BRIDGE_GUIDE.md) • [Quick Start](./QUICK_START.md) • [Constants](./CONSTANTS.md)

</div>

