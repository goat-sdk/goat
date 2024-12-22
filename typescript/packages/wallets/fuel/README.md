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
const fuelWallet = Wallet.fromPrivateKey(
    process.env.FUEL_PRIVATE_KEY,
    provider
);

const tools = await getOnChainTools({
    wallet: fuel({
        fuelWallet,
    }),
});
```
