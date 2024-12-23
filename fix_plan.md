# Hyperliquid Plugin Fix Plan

## Current Issues

### 1. API Structure Issues
- Current API implementation is monolithic in `api.ts`
- Need to split into modular structure like the example:
  - info/perpetuals.ts
  - info/spot.ts
  - info/general.ts
  - rest/info.ts

### 2. API Type Definition Problems
- Current types don't match actual API responses
- Missing proper type definitions for all endpoints
- Need to align with working curl examples from project_status.md

### 3. Environment Configuration
- Current implementation doesn't properly utilize all env variables
- Need to implement proper configuration validation
- Missing proper error handling for missing/invalid env variables

### 4. Testing Infrastructure
- Missing proper test structure
- Need integration tests for all working endpoints
- Need proper mocking for API responses
- Need to use actual API credentials from .env for live tests

## Required Changes

### 1. API Restructuring
1. Create new directory structure:
   ```
   src/
     rest/
       info/
         perpetuals.ts
         spot.ts
         general.ts
       info.ts
   ```
2. Move existing API calls to appropriate modules
3. Implement proper type exports/imports

### 2. Type System Updates
1. Update types based on working curl examples:
   - OrderbookResponse
   - MarketInfo
   - UserStateResponse
   - All other response types
2. Add proper validation for request/response types
3. Implement proper error types

### 3. Configuration Updates
1. Implement proper config validation
2. Add environment variable validation
3. Add proper error messages for missing/invalid config
4. Implement network selection (mainnet/testnet)

### 4. Testing Implementation
1. Create test structure:
   ```
   tests/
     integration/
       perpetuals.test.ts
       spot.test.ts
       general.test.ts
     unit/
       config.test.ts
       validation.test.ts
   ```
2. Implement tests using actual API credentials
3. Add proper mocking for unit tests
4. Add proper error case testing

## Implementation Priority

1. API Structure
   - Split current api.ts into modular structure
   - Move types to appropriate modules
   - Implement proper imports/exports

2. Type System
   - Update types based on working examples
   - Add validation
   - Add error types

3. Configuration
   - Implement config validation
   - Add network selection
   - Add error handling

4. Testing
   - Create test structure
   - Implement integration tests
   - Add unit tests
   - Add error case tests

## Testing Plan

### Phase 1: Unit Tests
1. Config validation
2. Type validation
3. Error handling

### Phase 2: Integration Tests
1. Test all working curl endpoints:
   - meta
   - allMids
   - l2Book
   - recentTrades
   - openOrders
   - clearinghouseState
   - userFills

### Phase 3: Error Case Tests
1. Invalid config
2. Network errors
3. API errors
4. Rate limiting

## Success Criteria
1. All curl examples from project_status.md work through the plugin
2. All tests pass
3. Proper error handling for all cases
4. Proper type safety throughout the codebase

## Notes
- Use actual API credentials from .env for testing
- Ensure rate limiting is properly implemented
- Follow plugin patterns from other plugins in the codebase
- Maintain proper error handling throughout
- Keep types strict and accurate 

## API Testing Results

### Public Endpoints Testing (Working)

1. Get Market Meta Info
```bash
curl -X POST "https://api.hyperliquid.xyz/info" \
  -H "Content-Type: application/json" \
  -d '{"type":"meta"}'
```
Response: Success - Returns full market information including decimals, name, and max leverage for each trading pair.

2. Get All Market Prices (allMids)
```bash
curl -X POST "https://api.hyperliquid.xyz/info" \
  -H "Content-Type: application/json" \
  -d '{"type":"allMids"}'
```
Response: Success - Returns current prices for all trading pairs.

3. Get L2 Orderbook (BTC)
```bash
curl -X POST "https://api.hyperliquid.xyz/info" \
  -H "Content-Type: application/json" \
  -d '{"type":"l2Book","coin":"BTC"}'
```
Response: Success - Returns detailed orderbook with bids and asks, including price, size, and number of orders.

4. Get Recent Trades (BTC)
```bash
curl -X POST "https://api.hyperliquid.xyz/info" \
  -H "Content-Type: application/json" \
  -d '{"type":"recentTrades","coin":"BTC"}'
```
Response: Success - Returns recent trades with full details including price, size, side, and timestamp.

### Account Endpoints Testing (Working)

1. Get User's Open Orders
```bash
curl -X POST "https://api.hyperliquid.xyz/info" \
  -H "Content-Type: application/json" \
  -d '{"type":"openOrders","user":"0x2CE4EaF47CACFbC6590686f8f7521e0385822334"}'
```
Response: Success - Returns empty array (no open orders).

2. Get User's Clearinghouse State
```bash
curl -X POST "https://api.hyperliquid.xyz/info" \
  -H "Content-Type: application/json" \
  -d '{"type":"clearinghouseState","user":"0x2CE4EaF47CACFbC6590686f8f7521e0385822334"}'
```
Response: Success - Shows account value of 50.0 USDC with no open positions.

### Trading Endpoints Testing (Issues Found)

1. Place Test Order (Failed)
```bash
curl -X POST "https://api.hyperliquid.xyz/exchange" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${HYPERLIQUID_PRIVATE_KEY}" \
  -d '{"type":"order","coin":"BTC","side":"Buy","size":"0.1","limitPx":"40000","reduceOnly":false}'
```
Response: Failed - "Failed to deserialize the JSON body into the target type"

### Key Findings

1. Public Endpoints:
   - All public endpoints are working correctly
   - Response formats are consistent and match documentation
   - No authentication required

2. Account Endpoints:
   - Account query endpoints working correctly
   - Can successfully retrieve user state and orders
   - Account shows 50.0 USDC balance

3. Trading Endpoints:
   - Current order placement implementation is incorrect
   - Need to investigate proper order signing mechanism
   - Authorization header format may be incorrect

### Required Fixes

1. Order Placement:
   - Need to implement proper order signing
   - Investigate correct request format for exchange endpoints
   - Add proper authentication headers

2. Type System Updates:
   - Update types based on working responses:
     ```typescript
     interface MarketInfo {
         name: string;
         szDecimals: number;
         maxLeverage: number;
         onlyIsolated?: boolean;
     }

     interface OrderbookLevel {
         px: string;
         sz: string;
         n: number;
     }

     interface L2BookResponse {
         coin: string;
         time: number;
         levels: [OrderbookLevel[], OrderbookLevel[]];
     }

     interface ClearinghouseState {
         marginSummary: {
             accountValue: string;
             totalNtlPos: string;
             totalRawUsd: string;
             totalMarginUsed: string;
         };
         withdrawable: string;
         assetPositions: any[];
         time: number;
     }
     ```

3. Authentication:
   - Implement proper request signing
   - Add proper API key handling
   - Add proper error handling for auth failures

### Testing Plan Update

1. Unit Tests:
   - Add tests for response type parsing
   - Add tests for request signing
   - Add tests for error handling

2. Integration Tests:
   - Test all working endpoints first
   - Add proper error case testing
   - Add authentication testing

3. Order Flow Testing:
   - Test order signing
   - Test order placement
   - Test order cancellation

### Next Steps

1. Fix order placement implementation:
   - Research correct order signing mechanism
   - Update request format
   - Add proper authentication

2. Update type system:
   - Implement new types based on working responses
   - Add validation
   - Add proper error handling

3. Implement proper testing:
   - Add unit tests for new types
   - Add integration tests for working endpoints
   - Add order flow testing

4. Documentation:
   - Document authentication process
   - Document order signing process
   - Update API response examples

### Order Signing Implementation Required

Based on testing, we need to implement proper order signing in our TypeScript code. Here's what we need to do:

1. Implement EIP-712 Signing:
```typescript
interface OrderSignatureData {
    types: {
        'HyperliquidTransaction:Order': {
            name: string;
            type: string;
        }[];
    };
    primaryType: string;
    domain: {
        name: string;
        version: string;
        chainId: number;
        verifyingContract: string;
    };
    message: {
        hyperliquidChain: string;
        orders: Order[];
        time: number;
    };
}

interface Order {
    a: number;      // asset index
    b: boolean;     // isBuy
    p: string;      // price
    s: string;      // size
    r: boolean;     // reduceOnly
    t: {
        limit: {
            tif: 'Alo' | 'Ioc' | 'Gtc';
        };
    };
}

async function signOrder(order: Order, privateKey: string): Promise<string> {
    const signatureData: OrderSignatureData = {
        types: {
            'HyperliquidTransaction:Order': [
                { name: 'hyperliquidChain', type: 'string' },
                { name: 'orders', type: 'Order[]' },
                { name: 'time', type: 'uint64' }
            ]
        },
        primaryType: 'HyperliquidTransaction:Order',
        domain: {
            name: 'HyperliquidSignTransaction',
            version: '1',
            chainId: 42161,  // Arbitrum
            verifyingContract: '0x0000000000000000000000000000000000000000'
        },
        message: {
            hyperliquidChain: 'Testnet',
            orders: [order],
            time: Date.now()
        }
    };

    // Use ethers.js to sign
    const wallet = new Wallet(privateKey);
    return wallet._signTypedData(
        signatureData.domain,
        signatureData.types,
        signatureData.message
    );
}
```

2. Implement Order Placement:
```typescript
interface OrderRequest {
    action: {
        type: 'order';
        orders: Order[];
        grouping: 'na' | 'normalTpsl' | 'positionTpsl';
    };
    nonce: number;
    signature: string;
}

async function placeOrder(order: Order, privateKey: string): Promise<OrderResponse> {
    const nonce = Date.now();
    const signature = await signOrder(order, privateKey);
    
    const request: OrderRequest = {
        action: {
            type: 'order',
            orders: [order],
            grouping: 'na'
        },
        nonce,
        signature
    };

    return await fetch('https://api.hyperliquid.xyz/exchange', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
    }).then(res => res.json());
}
```

3. Integration Test:
```typescript
describe('Hyperliquid Order Placement', () => {
    it('should place a limit order', async () => {
        const order: Order = {
            a: 0,  // BTC
            b: true,  // Buy
            p: '40000',  // Price
            s: '0.1',  // Size
            r: false,  // Not reduce only
            t: {
                limit: {
                    tif: 'Gtc'
                }
            }
        };

        const response = await placeOrder(order, process.env.HYPERLIQUID_PRIVATE_KEY);
        expect(response.status).toBe('ok');
        expect(response.response.type).toBe('order');
        expect(response.response.data.statuses[0].resting).toBeDefined();
    });
});
```

### Next Steps for Order Implementation

1. Create Order Signing Module:
   - Implement EIP-712 signing
   - Add proper error handling
   - Add validation

2. Create Order Service:
   - Implement order placement
   - Implement order cancellation
   - Add proper response handling

3. Add Tests:
   - Unit tests for signing
   - Integration tests for order flow
   - Error case testing

4. Add Documentation:
   - Document signing process
   - Document order placement
   - Add examples

### Required Dependencies
```json
{
    "dependencies": {
        "ethers": "^5.7.2",
        "viem": "^1.0.0"
    }
}
```

### EIP-712 Signing Implementation

Based on the documentation, we need to implement proper EIP-712 signing. Here's the correct format:

1. Create Typed Data:
```typescript
const typedData = {
    types: {
        'HyperliquidTransaction:Order': [
            { name: 'hyperliquidChain', type: 'string' },
            { name: 'orders', type: 'Order[]' },
            { name: 'time', type: 'uint64' }
        ],
        Order: [
            { name: 'a', type: 'uint64' },
            { name: 'b', type: 'bool' },
            { name: 'p', type: 'string' },
            { name: 's', type: 'string' },
            { name: 'r', type: 'bool' },
            { name: 't', type: 'OrderType' }
        ],
        OrderType: [
            { name: 'limit', type: 'LimitOrder' }
        ],
        LimitOrder: [
            { name: 'tif', type: 'string' }
        ]
    },
    primaryType: 'HyperliquidTransaction:Order',
    domain: {
        name: 'HyperliquidSignTransaction',
        version: '1',
        chainId: 42161,  // Arbitrum
        verifyingContract: '0x0000000000000000000000000000000000000000'
    },
    message: {
        hyperliquidChain: 'Testnet',
        orders: [{
            a: 0,  // BTC
            b: true,  // Buy
            p: '40000',  // Price
            s: '0.1',  // Size
            r: false,  // Not reduce only
            t: {
                limit: {
                    tif: 'Gtc'
                }
            }
        }],
        time: Date.now()
    }
};
```

2. Sign the Data:
```typescript
import { Wallet } from 'ethers';

async function signOrder(order: Order, privateKey: string): Promise<string> {
    const wallet = new Wallet(privateKey);
    const signature = await wallet._signTypedData(
        typedData.domain,
        typedData.types,
        typedData.message
    );
    return signature;
}
```

3. Send the Request:
```typescript
async function placeOrder(order: Order, privateKey: string): Promise<OrderResponse> {
    const nonce = Date.now();
    const signature = await signOrder(order, privateKey);
    
    const request = {
        action: {
            type: 'order',
            orders: [order],
            grouping: 'na'
        },
        nonce,
        signature
    };

    return await fetch('https://api.hyperliquid.xyz/exchange', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
    }).then(res => res.json());
}
```

### Testing Implementation

1. Unit Test:
```typescript
describe('Order Signing', () => {
    it('should generate valid EIP-712 signature', async () => {
        const order = {
            a: 0,
            b: true,
            p: '40000',
            s: '0.1',
            r: false,
            t: {
                limit: {
                    tif: 'Gtc'
                }
            }
        };

        const signature = await signOrder(order, process.env.HYPERLIQUID_PRIVATE_KEY);
        expect(signature).toMatch(/^0x[0-9a-f]{130}$/i);
    });
});
```

2. Integration Test:
```typescript
describe('Order Placement', () => {
    it('should place a limit order', async () => {
        const order = {
            a: 0,
            b: true,
            p: '40000',
            s: '0.1',
            r: false,
            t: {
                limit: {
                    tif: 'Gtc'
                }
            }
        };

        const response = await placeOrder(order, process.env.HYPERLIQUID_PRIVATE_KEY);
        expect(response.status).toBe('ok');
        expect(response.response.type).toBe('order');
        expect(response.response.data.statuses[0].resting).toBeDefined();

        // Clean up - cancel the order
        const orderId = response.response.data.statuses[0].resting.oid;
        const cancelResponse = await cancelOrder(orderId, process.env.HYPERLIQUID_PRIVATE_KEY);
        expect(cancelResponse.status).toBe('ok');
    });
});
```

### Required Dependencies
```json
{
    "dependencies": {
        "ethers": "^5.7.2"
    }
}
```

### Next Steps

1. Implement EIP-712 signing module
2. Add proper error handling for signing failures
3. Add validation for order parameters
4. Add comprehensive testing
5. Document signing process