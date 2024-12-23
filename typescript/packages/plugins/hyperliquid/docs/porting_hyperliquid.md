# Hyperliquid SDK Porting Guide

## Source Analysis

### Original SDK Structure (@nktkas/hyperliquid)

1. Transport Layer
   - `HttpTransport`: REST API communication
   - `WebSocketTransport`: Real-time data streaming
   - Common interface `IRESTTransport`

2. Client Classes
   - `PublicClient`: Market data and public endpoints
   - `WalletClient`: Trading and authenticated operations
   - Support for multiple wallet types (Viem, Ethers, MetaMask)

3. Core Components
   ```
   src/
   ├── clients/         # Public and Wallet client implementations
   ├── transports/     # HTTP and WebSocket transport layers
   ├── types/          # TypeScript type definitions
   └── utils/          # Helper functions and utilities
   ```

### GOAT Plugin Structure

Current implementation:
```
hyperliquid/
├── src/
│   ├── index.ts              # Exports
│   ├── hyperliquid.plugin.ts # Plugin class
│   ├── hyperliquid.service.ts# Service implementation
│   └── types/               # Type definitions
```

## Integration Plan

### 1. Service Layer Enhancement

Extend `HyperliquidService` to include:

```typescript
export class HyperliquidService {
    private transport: IRESTTransport;
    private publicClient: PublicClient;
    private walletClient?: WalletClient;

    constructor(config: HyperliquidConfig) {
        this.transport = new HttpTransport({
            url: config.baseUrl ?? 'https://api.hyperliquid.xyz',
            timeout: config.timeout ?? 10_000
        });
        
        this.publicClient = new PublicClient(this.transport);
        
        if (config.wallet) {
            this.walletClient = new WalletClient(config.wallet, this.transport);
        }
    }

    // Market Data Methods
    async getMarkets() {...}
    async getOrderbook() {...}
    async getTrades() {...}

    // Trading Methods (authenticated)
    async createOrder() {...}
    async cancelOrder() {...}
    async getPositions() {...}

    // WebSocket Methods
    subscribeToTrades() {...}
    subscribeToOrderbook() {...}
}
```

### 2. Type System Integration

1. Core Types (from original SDK):
   - Market structures
   - Order types
   - WebSocket message types
   - Response types

2. Plugin-specific Types:
   ```typescript
   export interface HyperliquidConfig {
       baseUrl?: string;
       timeout?: number;
       wallet?: WalletType;
   }

   export type WalletType = 
       | ViemWalletClient 
       | ethers.Wallet 
       | Account;
   ```

### 3. Transport Layer Implementation

1. HTTP Transport:
   - REST API endpoints
   - Request/response handling
   - Error management
   - Rate limiting

2. WebSocket Transport:
   - Connection management
   - Subscription handling
   - Message parsing
   - Reconnection logic

### 4. Authentication & Signing

1. Support multiple wallet types:
   - Viem wallet
   - Ethers wallet
   - External wallets (MetaMask)

2. Implement signing logic:
   - Order signing
   - Message signing
   - Authentication headers

## Migration Steps

1. Core Infrastructure
   - [x] Basic plugin structure
   - [x] Service class skeleton
   - [ ] Transport layer implementation
   - [ ] Type system port

2. Market Data Features
   - [ ] REST endpoints
   - [ ] WebSocket feeds
   - [ ] Data transformations

3. Trading Features
   - [ ] Order management
   - [ ] Position tracking
   - [ ] Wallet integration

4. Advanced Features
   - [ ] Rate limiting
   - [ ] Error handling
   - [ ] Reconnection logic
   - [ ] Event system

## Testing Strategy

1. Unit Tests
   - Service methods
   - Type validations
   - Transport layer

2. Integration Tests
   - Market data retrieval
   - Order placement (testnet)
   - WebSocket feeds

3. Error Cases
   - Network failures
   - Invalid responses
   - Authentication errors
