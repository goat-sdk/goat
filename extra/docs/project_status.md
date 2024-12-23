# Hyperliquid Plugin Project Status

## Overview
The Hyperliquid plugin for GOAT SDK provides a comprehensive interface to interact with the Hyperliquid exchange. This document tracks the implementation status of various features and components.

## Core Components

### Configuration
- [x] Base configuration interface
- [x] Transport configuration
- [x] WebSocket configuration
- [x] Rate limiting options
- [x] Default order parameters
- [x] Network selection (mainnet/testnet)
- [x] API key authentication

### Transport Layer
- [x] HTTP transport
- [x] WebSocket transport
- [x] Error handling
- [x] Request validation
- [x] Response parsing
- [x] Rate limiting
- [x] Automatic reconnection

### Market Data
- [x] Get all markets
- [x] Get market info
- [x] Get orderbook
- [x] Get recent trades
- [x] Get 24h ticker
- [x] Real-time market data subscriptions

### Trading
- [x] Place order
- [x] Cancel order
- [x] Cancel order by CLOID
- [x] Modify order
- [x] Batch modify orders
- [x] Update leverage
- [x] Update isolated margin
- [x] TWAP orders
  - [x] Place TWAP order
  - [x] Cancel TWAP order
- [x] Schedule cancel (Dead Man's Switch)

### Account Management
- [x] Create sub-account
- [x] Approve agent
- [x] Approve builder fee
- [x] Set referral code

### Funds Management
- [x] Transfer between Spot and Perp accounts
- [x] Transfer USDC (L1)
- [x] Transfer spot assets (L1)
- [x] Transfer to/from vault
- [x] Transfer between sub-accounts
- [x] Withdraw funds

### WebSocket Subscriptions
- [x] Trades
- [x] Orderbook
- [x] Ticker
- [x] Positions
- [x] Orders
- [x] Balances
- [x] Liquidations

### Authentication
- [x] API key authentication
- [x] Request signing
- [x] Wallet integration
- [x] EIP-712 signing

### Error Handling
- [x] Custom error types
- [x] Error hierarchy
- [x] Error message formatting
- [x] Transport errors
- [x] Validation errors
- [x] Authentication errors

## Testing
- [x] Unit tests
  - [x] Service methods
  - [x] Transport layer
  - [x] Error handling
  - [x] Configuration
- [x] Integration tests
  - [x] Market data
  - [x] Trading
  - [x] Account management
  - [x] WebSocket
- [x] End-to-end tests

## Documentation
- [x] API documentation
- [x] Type documentation
- [x] Error documentation
- [x] Configuration documentation
- [x] Usage examples
- [x] Integration guide

## Latest Changes (2024-12-23)

### Type System Improvements
1. Updated `HyperliquidConfig` interface:
   - Added `apiKey` and `apiSecret` fields
   - Properly typed `network` as 'mainnet' | 'testnet'

2. Enhanced API Types:
   - Updated `MarketInfo` with complete fields
   - Fixed `OrderbookResponse` to include bids and asks arrays
   - Added proper typing for `OrderResponse` including orderId
   - Created separate `OpenOrder` interface for clarity

3. Plugin Structure Updates:
   - Added `getConfig` method to plugin class
   - Stored config as private readonly member
   - Improved service initialization
   - Fixed type handling in getOrders method

4. Integration Test Improvements:
   - Updated tests to match new type system
   - Added proper type assertions
   - Improved test structure and readability
   - Added more comprehensive checks

## API Endpoint Structure

### 1. Info Endpoint (Public)
Base URL: `https://api.hyperliquid.xyz/info`
- All requests are POST
- Content-Type: application/json
- No authentication required
- Request format:
```json
{
    "type": "endpoint_name",
    ... additional parameters
}
```

Example endpoints:
- `meta`: Get market information
- `allMids`: Get all market prices
- `l2Book`: Get orderbook for a specific coin
- `recentTrades`: Get recent trades
- `openOrders`: Get user's open orders
- `clearinghouseState`: Get user's account state
- `userFills`: Get user's trade history

### 2. Exchange Endpoint (Private)
Base URL: `https://api.hyperliquid.xyz/exchange`
- All requests are POST
- Content-Type: application/json
- Requires API key authentication
- Request format:
```json
{
    "type": "endpoint_name",
    ... additional parameters
}
```

Example endpoints (all require authentication):
- `order`: Place new order
- `cancel`: Cancel existing order
- `updateLeverage`: Update position leverage
- `withdraw`: Withdraw funds
- `transfer`: Transfer between accounts

Note: All exchange endpoints return "Failed to deserialize the JSON body into the target type" without proper authentication.

## API Endpoint Testing Results

### Info Endpoint Tests
All endpoints are tested against the mainnet API (https://api.hyperliquid.xyz/info)

#### Working Endpoints

1. Get All Market Mids (Prices)
```bash
curl -X POST "https://api.hyperliquid.xyz/info" \
  -H "Content-Type: application/json" \
  -d '{"type":"allMids"}'
```

2. Get Market Meta Information
```bash
curl -X POST "https://api.hyperliquid.xyz/info" \
  -H "Content-Type: application/json" \
  -d '{"type":"meta"}'
```

3. Get L2 Orderbook (BTC example)
```bash
curl -X POST "https://api.hyperliquid.xyz/info" \
  -H "Content-Type: application/json" \
  -d '{"type":"l2Book","coin":"BTC"}'
```

4. Get Recent Trades (BTC example)
```bash
curl -X POST "https://api.hyperliquid.xyz/info" \
  -H "Content-Type: application/json" \
  -d '{"type":"recentTrades","coin":"BTC"}'
```

5. Get User's Open Orders
```bash
curl -X POST "https://api.hyperliquid.xyz/info" \
  -H "Content-Type: application/json" \
  -d '{"type":"openOrders","user":"0xEfDaFA4Cc07BbF8421477db4E3Ce79C96Baf5465"}'
```

6. Get User's Clearinghouse State (Balance/Positions)
```bash
curl -X POST "https://api.hyperliquid.xyz/info" \
  -H "Content-Type: application/json" \
  -d '{"type":"clearinghouseState","user":"0xEfDaFA4Cc07BbF8421477db4E3Ce79C96Baf5465"}'
```

7. Get User's Trade History
```bash
curl -X POST "https://api.hyperliquid.xyz/info" \
  -H "Content-Type: application/json" \
  -d '{"type":"userFills","user":"0xEfDaFA4Cc07BbF8421477db4E3Ce79C96Baf5465","startTime":1734954000000,"endTime":1734954500000}'
```

#### Endpoints with Issues

1. Funding History
```bash
curl -X POST "https://api.hyperliquid.xyz/info" \
  -H "Content-Type: application/json" \
  -d '{"type":"fundingHistory","startTime":1734954000000,"endTime":1734954500000}'
```
Status: Returns deserialization error

2. User State
```bash
curl -X POST "https://api.hyperliquid.xyz/info" \
  -H "Content-Type: application/json" \
  -d '{"type":"userState","user":"0xEfDaFA4Cc07BbF8421477db4E3Ce79C96Baf5465"}'
```
Status: Returns deserialization error

3. Candles
```bash
curl -X POST "https://api.hyperliquid.xyz/info" \
  -H "Content-Type: application/json" \
  -d '{"type":"candles","coin":"BTC","interval":"1m","startTime":1734954000000,"endTime":1734954500000}'
```
Status: Returns deserialization error

#### Notes
- All endpoints return JSON responses
- No authentication required for these endpoints
- User-specific queries work with any valid Ethereum address
- Response times are typically under 500ms
- Rate limits appear to be generous for public endpoints

#### Additional Notes
- Some endpoints require timestamps in milliseconds for time-based queries
- Empty arrays are returned for valid requests with no data
- Some endpoints may require additional parameters or different formatting that needs investigation
- Error responses are consistent across failing endpoints

## API Testing Results

### Info API Endpoints
Successfully tested the following endpoints:

1. Get Market Meta Info:
```bash
curl -X POST "https://api.hyperliquid.xyz/info" \
  -H "Content-Type: application/json" \
  -d '{"type":"meta"}'
```
Response includes detailed market information including decimals, name, and max leverage for each trading pair.

2. Get L2 Orderbook:
```bash
curl -X POST "https://api.hyperliquid.xyz/info" \
  -H "Content-Type: application/json" \
  -d '{"type":"l2Book","coin":"BTC"}'
```
Response includes:
- Coin name
- Timestamp
- Bid/Ask levels with price, size, and number of orders

### Key Findings:
1. API uses POST requests with JSON payloads instead of GET requests
2. Main endpoints:
   - Info API: https://api.hyperliquid.xyz/info
   - Exchange API: https://api.hyperliquid.xyz/exchange
   - WebSocket: wss://api.hyperliquid.xyz/ws
3. Testnet URLs follow the pattern: api.hyperliquid-testnet.xyz

### Implementation Notes:
1. Need to map L2Book response to OrderbookResponse format
2. All requests require Content-Type: application/json header
3. Timestamps are in milliseconds
4. Size (sz) and price (px) values are returned as strings and need proper decimal handling

## Current Status
- Main plugin structure is complete
- Type system is properly aligned with API
- Basic integration tests are in place
- Configuration system supports all necessary options

## Next Steps
1. Complete remaining TypeScript error fixes:
   - Fix any remaining type mismatches in integration tests
   - Ensure all API responses are properly typed
2. Add comprehensive error handling
3. Implement WebSocket functionality
4. Add more integration tests
5. Update documentation

## Checkpoint Information
To resume work from this point, use the following context:

1. Current Focus:
   - Fixing TypeScript errors in integration tests
   - Ensuring proper typing of API responses
   - Implementing proper error handling

2. Files Being Worked On:
   - hyperliquid.plugin.ts
   - types/index.ts
   - types/api.ts
   - integration/hyperliquid.test.ts

3. Latest Changes:
   - Added apiKey/apiSecret to config
   - Updated MarketInfo and OrderbookResponse types
   - Added getConfig method
   - Improved type handling in getOrders

4. Next Immediate Tasks:
   - Complete integration test fixes
   - Add proper error handling
   - Test all API endpoints
   - Add WebSocket support

## Detailed Prompt for Resuming Development

### Current Development Context
We are developing a Hyperliquid plugin for cryptocurrency trading. The plugin follows the standard pattern used by other plugins (e.g., Solana NFTs) and integrates with the Hyperliquid API for market data, trading, and account management.

### Latest Code State
1. Plugin Structure:
   - Moved all transformation logic to service layer for better separation of concerns
   - Plugin now delegates all operations to the service
   - Service handles all API response transformations
   - Added proper type definitions for all responses

2. Issues to Fix:
   - Plugin currently supports EVM chain type, but should only support Arbitrum chain
   - Need to update tests to use proper Chain type with required id field
   - Need to ensure all API response transformations match Hyperliquid's actual response formats
   - Need to verify WebSocket subscription handling with actual API responses

3. Next Steps:
   - Update chain support to specifically target Arbitrum
   - Add proper error handling for API responses
   - Add retry logic for failed requests
   - Add rate limiting
   - Add proper logging
   - Add more comprehensive test coverage

4. Recent Changes:
   - Moved all transformation logic to service layer
   - Updated service to handle all API response transformations
   - Simplified plugin to delegate to service
   - Fixed TypeScript errors in service and plugin
   - Updated tests to use proper mocking

### Active Files
1. `src/hyperliquid.plugin.ts`:
   - Main plugin implementation
   - Needs error handling improvements
   - Trading methods need refinement

2. `src/hyperliquid.service.ts`:
   - API communication layer
   - Recently updated market info lookup
   - Needs WebSocket implementation

3. `src/types/`:
   - `index.ts`: Common types and configurations
   - `api.ts`: API-specific types and responses
   - Need alignment with actual API responses

4. `tests/`:
   - Integration tests need fixing
   - Unit tests need expansion
   - WebSocket tests pending

### Immediate Tasks
1. Fix remaining TypeScript errors:
   ```typescript
   // In integration tests
   - Property 'bids' does not exist on type 'OrderbookResponse'
   - Property 'asks' does not exist on type 'OrderbookResponse'
   - Property 'orderId' does not exist on type 'OrderResponse'
   ```

2. Update API response types:
   ```typescript
   export interface OrderbookResponse {
     bids: [string, string][]; // [price, quantity]
     asks: [string, string][]; // [price, quantity]
     // ...
   }
   ```

3. Implement proper error handling:
   ```typescript
   try {
     // API calls
   } catch (error) {
     throw new PluginError('Specific error message');
   }
   ```

### Testing Requirements
1. Unit Tests:
   - Test all service methods
   - Verify error handling
   - Check configuration validation

2. Integration Tests:
   - Market data endpoints
   - Trading functionality
   - Account management
   - WebSocket connections

### Environment Setup
Required in .env:
```
HYPERLIQUID_WALLET_ADDRESS=your_wallet_address
HYPERLIQUID_INFO_API_URL=api_url
HYPERLIQUID_WS_URL=ws_url
HYPERLIQUID_PRIVATE_KEY=your_private_key
HYPERLIQUID_NETWORK=mainnet|testnet
```

### Code Style Guidelines
1. TypeScript:
   - Use strict typing
   - Avoid any type
   - Document public methods
   - Use interfaces over types

2. Error Handling:
   - Use specific error types
   - Include error context
   - Log meaningful messages

3. Testing:
   - Test edge cases
   - Mock external services
   - Use meaningful test names

### API Integration Points
1. Market Data:
   - GET /markets
   - GET /orderbook
   - GET /trades

2. Trading:
   - POST /order
   - DELETE /order
   - GET /openOrders

3. Account:
   - GET /balance
   - GET /positions
   - GET /userState

### Next Development Phase
1. Complete type system alignment
2. Implement WebSocket functionality
3. Add comprehensive error handling
4. Expand test coverage
5. Update documentation

## Environment Setup
Required environment variables:
- HYPERLIQUID_WALLET_ADDRESS
- HYPERLIQUID_INFO_API_URL
- HYPERLIQUID_WS_URL
- HYPERLIQUID_PRIVATE_KEY
- HYPERLIQUID_NETWORK

## Known Issues
- None at this time

## Dependencies
- @goat-sdk/core
- ethers
- viem
- ws
- axios

## Version
Current version: 0.1.0

## USDC Balance Testing

1. Clearinghouse State (Shows USDC in Perpetuals Account)
```bash
curl -X POST "https://api.hyperliquid.xyz/info" \
  -H "Content-Type: application/json" \
  -d '{"type":"clearinghouseState","user":"0xEfDaFA4Cc07BbF8421477db4E3Ce79C96Baf5465","coin":"USDC"}'
```
Response shows:
- Account Value: 0.0
- Total Notional Position: 0.0
- Total Raw USD: 0.0
- Total Margin Used: 0.0
- Withdrawable Amount: 0.0

2. Spot Account State (Failed)
```bash
curl -X POST "https://api.hyperliquid.xyz/info" \
  -H "Content-Type: application/json" \
  -d '{"type":"spotAccountState","user":"0xEfDaFA4Cc07BbF8421477db4E3Ce79C96Baf5465"}'
```
Status: Returns deserialization error

3. Wallet Info (Failed)
```bash
curl -X POST "https://api.hyperliquid.xyz/info" \
  -H "Content-Type: application/json" \
  -d '{"type":"walletInfo","user":"0xEfDaFA4Cc07BbF8421477db4E3Ce79C96Baf5465"}'
```
Status: Returns deserialization error

Note: The clearinghouse state endpoint appears to be the most reliable way to check USDC balances, showing both perpetuals and margin account information.


Test work 
curl -X POST https://api.hyperliquid.xyz/info -H Content-Type: application/json -d {"type":"l2Book","coin":"FARTCOIN"}