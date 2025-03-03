# MerchantMoe Plugin

A GOAT SDK plugin for interacting with MerchantMoe protocol on Mode Network. This plugin provides a comprehensive interface for MOE token operations, staking, liquidity management, and token swaps.

## Features

### MOE Token Operations
- Check MOE token balances
- View veMOE balances
- Track token positions

### Staking Functionality
- Stake MOE tokens
- Unstake MOE tokens
- View staking positions
- Claim staking rewards
- Check earned rewards
- Complete staking exit (withdraw + claim)

### DEX Operations
- Swap tokens through MerchantMoe router
- Get token pair addresses
- View liquidity pairs
- Calculate swap amounts and rates
- Execute token swaps with slippage protection

## Installation

```bash
pnpm add @goat-sdk/plugin-merchantmoe
```

## Usage

### Basic Setup

```typescript
import { MerchantMoePlugin } from "@goat-sdk/plugin-merchantmoe";
import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { viem } from "@goat-sdk/wallet-viem";

// Initialize the plugin
const merchantmoePlugin = new MerchantMoePlugin({
    rpcUrl: "https://mainnet.mode.network",
});

// Set up tools with the plugin
const tools = await getOnChainTools({
    wallet: viem(walletClient),
    plugins: [merchantmoePlugin],
});
```

### Example Operations

#### Check MOE Balance
```typescript
// Get MOE token balance
const balance = await merchantmoe_get_moe_balance({
    address: "0x..."
});
```

#### Stake MOE Tokens
```typescript
// Stake 100 MOE tokens
const stakeResult = await merchantmoe_stake_moe({
    amount: "100"
});
```

#### Swap Tokens
```typescript
// Swap USDC for MOE
const swapResult = await merchantmoe_swap_tokens({
    amountIn: "10000000", // 10 USDC (6 decimals)
    amountOutMin: "9000000", // Minimum MOE to receive
    path: [USDC_ADDRESS, MOE_TOKEN_ADDRESS],
    to: "0x...",
    deadline: 300 // 5 minutes
});
```

## Contract Addresses

The plugin interacts with the following Mode Network contracts:

- MOE Token: `0x4515A45337F461A11Ff0FE8aBF3c606AE5dC00c9`
- MOE Staking: `0xE92249760e1443FbBeA45B03f607Ba84471Fa793`
- MOE Router: `0xeaEE7EE68874218c3558b40063c42B82D3E7232a`
- MOE Factory: `0x5bef015ca9424a7c07b68490616a4c1f094bedec`
- veMOE: `0x240616e2448e078934863fB6eb5133834BF14Ef1`

## Supported Networks

- Mode Network (Chain ID: 5000)

## API Reference

### Token Operations
- `getMoeBalance(address)`: Get MOE token balance
- `getVeMoeBalance(address)`: Get veMOE balance

### Staking Operations
- `stakeMoe(amount)`: Stake MOE tokens
- `unstakeMoe(amount)`: Unstake MOE tokens
- `getEarnedMoe(address)`: Get earned rewards
- `claimRewards()`: Claim staking rewards
- `exitStaking()`: Exit staking position

### DEX Operations
- `getAmountsOut(amountIn, path)`: Calculate output amounts
- `swapExactTokensForTokens(params)`: Execute token swap
- `getPair(tokenA, tokenB)`: Get liquidity pair address
- `getAllPairsLength()`: Get total number of pairs
- `getPairAtIndex(index)`: Get pair by index

## Error Handling

The plugin includes comprehensive error handling for:
- Invalid addresses
- Insufficient balances
- Failed transactions
- Network issues
- Contract interactions

## Security

- All contract interactions require explicit wallet approval
- Slippage protection for swaps
- Transaction deadline enforcement
- Safe type handling for addresses and amounts

## Dependencies

- `@goat-sdk/core`
- `@goat-sdk/wallet-evm`
- `viem`
- `zod`

## Contributing

Contributions are welcome! Please check our contributing guidelines for details.

## License

MIT License - see LICENSE file for details.

## Links

- [Mode Network](https://mode.network)
- [MerchantMoe Documentation](https://docs.merchantmoe.com)
- [GOAT SDK](https://docs.ohmygoat.dev) 