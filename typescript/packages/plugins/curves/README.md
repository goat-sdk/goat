# Goat Curves Plugin 🐐 - TypeScript

## Installation
```
npm install @goat-sdk/plugin-curves
```

## Usage

### Basic Setup
```typescript
import { viem } from "@goat-sdk/wallet-viem";
import { curves } from "@goat-sdk/plugin-curves";

const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`);

  // Create a wallet client
const walletClient = createWalletClient({
    account: account,
    transport: http(process.env.RPC_PROVIDER_URL),
    chain: base,
});

const tools = await getOnChainTools({
    wallet: viem(walletClient),
    plugins: [
        curves(),
    ],
});

// Or with custom curves address and abi
const tools2 = await getOnChainTools({
    wallet: viem(walletClient),
    plugins: [
        curves({
          address: YOUR_CURVES_ADDRESS,
          abi: YOUR_CUSTOM_ABI
        }),
    ],
});
```

## Plugin Tools
When using with Goat SDK, the following tools are available:

- `buy_curves_token`: Buy curves tokens
- `get_buy_curves_token`: Get curves token buy price
- `sell_curves_token`: Sell curves tokens
- `get_sell_curves_token`: Get curves token sell price
- `get_curves_erc20`: Get ERC20 token information
- `get_curves_balance`: Get curves token balance
- `withdraw_curves`: Withdraw to ERC20 tokens
- `deposit_curves`: Deposit from ERC20 tokens
- `mint_curves_erc20`: Set name and symbol for your ERC20 token and mint it

Each tool handles parameter validation and provides clear error messages.
