# Goat Wallet Fuel 🐐 - TypeScript

## Installation

```
npm install @goat-sdk/wallet-fuel
```

## Usage

```typescript
import { Provider, Wallet } from "fuels";
import { fuel } from "@goat-sdk/wallet-fuel";
import { getOnChainTools } from "@goat-sdk/core";

const provider = await Provider.create(
    "https://mainnet.fuel.network/v1/graphql"
);

const tools = await getOnChainTools({
    wallet: fuel({
        privateKey: process.env.FUEL_WALLET_PRIVATE_KEY,
        provider,
    }),
});
```
