# GOAT Etherscan Plugin

This plugin enables your agent to interact with the Ethereum blockchain data from Etherscan.

## Installation

```bash
pnpm add @goat-sdk/plugin-etherscan
```

## Configuration

To use the Etherscan plugin, you'll need an API key from [Etherscan](https://etherscan.io/apis).

```typescript
import { etherscan } from "@goat-sdk/plugin-etherscan";

const tools = getOnChainTools({
  plugins: [
    etherscan({
      apiKey: "YOUR_ETHERSCAN_API_KEY",
    }),
  ],
});
```

## Features

- Account balance and transaction history
- Contract ABI and source code retrieval
- Transaction status and receipt information
- Block data
- Token balances and transfers
- Gas price tracking
- Event logs

## Network Support

The plugin supports both mainnet and testnet networks:
- Ethereum Mainnet
- Goerli Testnet
- Sepolia Testnet

## Example Usage

```typescript
// Get account balance
const balance = await tools.get_account_balance({
  address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  network: "mainnet",
});

// Get contract ABI
const abi = await tools.get_contract_abi({
  address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  network: "mainnet",
});

// Get gas price
const gasPrice = await tools.get_gas_price({
  network: "mainnet",
});
```

## API Reference

For detailed API documentation, please refer to the TypeScript types and JSDoc comments in the source code.
