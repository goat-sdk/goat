<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Goat SPL Token GOAT Plugin

Transfer and get the balance of SPL tokens.

## Installation
```
npm install @goat-sdk/plugin-spl-token
yarn add @goat-sdk/plugin-spl-token
pnpm add @goat-sdk/plugin-spl-token
```

## Usage

```typescript
import { splToken, USDC, GOAT } from "@goat-sdk/plugin-spl-token";

const plugin = splToken({
    connection,
    network: "mainnet",
    tokens: [USDC, GOAT],
});
```

### Adding custom tokens
```typescript
import { splToken } from "@goat-sdk/plugin-spl-token";


const plugin = splToken({
    tokens: [
        USDC,
        {
            decimals: 9,
            symbol: "POPCAT",
            name: "Popcat",
            mintAddresses: {
                "mainnet": "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr",
            },
        },
    ],
});
```

## Tools
- Get token info by symbol
- Transfer SPL token
- Get the balance of SPL token

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
