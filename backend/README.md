# DeFi Strategy Backend

A TypeScript Express backend for managing and executing DeFi trading strategies with MongoDB persistence and automated trigger-based execution. Built for ETH Global hackathon.

## 🚀 Features

- **Strategy Management**: Create, store, and validate DeFi strategies with Zod schema validation
- **X402 Payment Integration**: Buy strategies using crypto payments with X402 protocol
- **Automated Execution**: Trigger-based strategy execution with cron scheduling
- **Uniswap Integration**: Execute token swaps, approvals, and liquidity operations
- **Polygon Support**: Deployed on Polygon mainnet with testnet support
- **Modular Architecture**: Clean separation of concerns with dedicated executors

## 🏗️ Architecture

### Core Components

```
src/
├── main.ts                     # Express server entry point
├── config/
│   ├── database.ts            # MongoDB configuration
│   └── web3.ts                # Viem client setup for Polygon
├── database/
│   └── connection.ts          # Mongoose connection manager
├── models/
│   ├── Strategy.ts            # Strategy MongoDB model
│   └── StrategyPurchase.ts    # Purchase tracking model
├── routes/
│   ├── index.ts               # Main router
│   ├── health.ts              # Health check endpoints
│   ├── createStrategy.ts      # Strategy CRUD operations
│   ├── buyStrategy.ts         # X402 payment integration
│   └── executeStrategy.ts     # Strategy execution endpoint
├── services/
│   └── strategyExecutor.ts    # Main execution orchestrator
├── executors/
│   ├── approvalExecutor.ts    # ERC20 token approvals
│   ├── swapExecutor.ts        # Uniswap token swaps
│   └── liquidityExecutor.ts   # Liquidity operations
├── utils/
│   ├── triggerManager.ts      # Cron-based trigger scheduling
│   ├── transactionHelper.ts   # Transaction utilities
│   ├── strategyHash.ts        # Strategy uniqueness hashing
│   └── schemas/               # Zod validation schemas
│       ├── index.ts
│       ├── common.ts          # Address and common schemas
│       └── uniswap.ts         # Uniswap-specific schemas
└── middleware/
    └── x402Config.ts          # X402 payment configuration
```

## 📋 API Endpoints

### Strategy Management
- `GET /api/health` - Server health check with database status
- `GET /api/strategies` - Fetch all strategies or filter by `?userAddress=0x...`
- `POST /api/strategies` - Create new strategy with validation

### Payment & Execution
- `POST /api/strategies/buy` - Purchase strategy with X402 crypto payment
- `POST /api/strategies/execute` - Execute strategy (called by triggers)
- `GET /api/users/:userAddress/purchases` - Get user's purchased strategies

## 🔧 Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express 5.x
- **Database**: MongoDB with Mongoose ODM
- **Blockchain**: Viem for Ethereum interactions
- **Validation**: Zod schemas
- **Payments**: X402 protocol integration
- **Scheduling**: node-cron for trigger management
- **Network**: Polygon mainnet (with Amoy testnet support)

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB instance
- Private key for strategy execution

### Installation

```bash
# Clone and install dependencies
git clone <repository>
cd backend
yarn install

# Set up environment variables
cp .env.example .env
```

### Environment Variables

```bash
# Database
MONGODB_URL=mongodb://localhost:27017/defi-backend

# Server
PORT=3000

# Web3 Configuration
PRIVATE_KEY=0x...                                    # Private key for strategy execution
POLYGON_AMOY_RPC_URL=https://1rpc.io/matic          # Polygon RPC endpoint

# X402 Payment
FACILITATOR_URL=https://x402.polygon.technology     # X402 facilitator URL
```

### Development Commands

```bash
yarn dev        # Start development server with hot reload
yarn build      # Compile TypeScript
yarn start      # Run production build
yarn type-check # TypeScript validation
```

## 📊 Strategy Schema

### Core Structure
```typescript
{
  name: string,
  desc: string,
  creator: Address,
  triggers: Trigger[],           // Time/price based triggers
  execution_steps: ExecutionStep[], // Uniswap operations
  pre_conditions: any[],
  max_supply: Address & { amount: number },
  fee: Address & { amount: number, recipient: string },
  payment_mode: "x402"
}
```

### Supported Operations
- **Approval**: ERC20 token approvals for Uniswap router
- **Swap**: Token swaps via Uniswap V2/V3 router
- **Add Liquidity**: Provide liquidity to Uniswap pairs
- **Remove Liquidity**: Remove liquidity positions

## 🔄 Execution Flow

1. **Strategy Creation**: User creates strategy with time-based triggers
2. **Strategy Purchase**: User pays via X402 protocol to buy strategy
3. **Trigger Registration**: Time trigger gets registered with cron scheduler
4. **Automated Execution**: When trigger fires:
   - Validates strategy and execution parameters
   - Executes steps sequentially (approval → swap → liquidity)
   - Tracks gas usage and transaction hashes
   - Logs detailed execution results

## 🔒 Security Features

- **Schema Validation**: Zod schemas prevent malformed strategy data
- **Duplicate Prevention**: SHA-256 hashing prevents duplicate strategies per user
- **Balance Checks**: Verify sufficient token balances before execution
- **Allowance Optimization**: Skip unnecessary approvals if allowance exists
- **Fail-Fast Execution**: Stop execution immediately on step failure
- **Transaction Monitoring**: Wait for confirmations with timeout protection

## 💾 Database Schema

### Strategy Collection
```typescript
{
  userAddress: string,           // Indexed
  strategyHash: string,          // SHA-256 of triggers + execution_steps
  strategy: StrategyObject,      // Complete validated strategy
  createdAt: Date,
  updatedAt: Date
}
```
**Unique Index**: `(userAddress, strategyHash)` - prevents duplicates per user

### Strategy Purchase Collection
```typescript
{
  buyerAddress: string,
  strategyId: ObjectId,
  paymentAmount: number,
  paymentRecipient: string,
  paymentCurrency: string,
  paymentStatus: string,
  x402PaymentId: string,
  transactionHash?: string,
  purchasedAt: Date
}
```

## 🌐 Deployment

### Production Build
```bash
yarn build
yarn start
```

### Docker Deployment
```bash
docker build -t defi-backend .
docker run -p 3000:3000 --env-file .env defi-backend
```

## 🧪 Testing Strategy Execution

### Create Test Strategy
```bash
curl -X POST http://localhost:3000/api/strategies \
  -H "Content-Type: application/json" \
  -d '{
    "userAddress": "0x...",
    "strategy": {
      "name": "USDC to WMATIC Swap",
      "desc": "Swap USDC for WMATIC every hour",
      "creator": { "chainId": "137", "address": "0x..." },
      "triggers": [
        { "type": "time", "time": "0 * * * *" }
      ],
      "execution_steps": [
        {
          "integration_type": "uniswap",
          "integration_steps": [
            {
              "step_type": "approval",
              "token": { "chainId": "137", "address": "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359" },
              "amount": "1000000",
              "spender": { "chainId": "137", "address": "0xE592427A0AEce92De3Edee1F18E0157C05861564" }
            },
            {
              "step_type": "swap",
              "version": "v3",
              "function_name": "exactInputSingle",
              "token_in": { "chainId": "137", "address": "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359" },
              "token_out": { "chainId": "137", "address": "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619" },
              "amount_in": "1000000",
              "amount_out_min": "950000000000000000",
              "recipient": { "chainId": "137", "address": "0x..." }
            }
          ]
        }
      ],
      "pre_conditions": [],
      "max_supply": { "chainId": "137", "address": "0x...", "amount": 100 },
      "fee": { "chainId": "137", "address": "0x...", "amount": 0.01, "recipient": "0x..." },
      "payment_mode": "x402"
    }
  }'
```

## 📈 Monitoring & Logs

The system provides comprehensive logging for:
- Strategy validation and execution
- Transaction confirmations and gas usage
- Trigger scheduling and firing
- Payment processing via X402
- Error handling and debugging

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

This project is built for ETH Global hackathon. See LICENSE file for details.

## 🏆 ETH Global Hackathon

This backend powers a DeFi strategy automation platform, enabling users to:
- Create sophisticated DeFi strategies with multiple steps
- Pay for strategies using crypto via X402 protocol
- Execute strategies automatically based on time triggers
- Support Uniswap operations on Polygon network

Built with modern TypeScript patterns, comprehensive error handling, and production-ready architecture for hackathon demonstration and potential scaling.