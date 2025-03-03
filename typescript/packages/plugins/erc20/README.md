<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# ERC20 GOAT Plugin

ERC20 plugin for Goat. Allows you to create tools for transferring and getting the balance of ERC20 tokens.

## Installation
```
npm install @goat-sdk/plugin-erc20
yarn add @goat-sdk/plugin-erc20
pnpm add @goat-sdk/plugin-erc20
```

## Usage

```typescript
import { erc20 } from "@goat-sdk/plugin-erc20";


const plugin = erc20({
    tokens: [USDC, PEPE],
});
```

### Adding custom tokens
```typescript
import { erc20 } from "@goat-sdk/plugin-erc20";


const plugin = erc20({
    tokens: [
        USDC,
        {
            decimals: 18,
            symbol: "SHIB",
            name: "Shiba Inu",
            chains: {
                "1": {
                    contractAddress: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
                },
            },
        },
    ],
});
```

## Tools

1. Get token info by symbol
2. Get balance
3. Transfer
4. Approve
5. Get allowance
6. Total supply
7. Revoke approval
8. Convert to base unit
9. Convert from base unit

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/4821833e-52e5-4126-a2a1-59e9fa9bebd7" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
