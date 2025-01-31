# Goat Wallet Viem 🐐 - TypeScript

## Installation
```
npm install @goat-sdk/wallet-safe
```

## Usage
```typescript
import { createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { http } from "viem";

import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { SafeWalletClient } from "./src";

const pk = process.env.WALLET_PRIVATE_KEY as `0x${string}`

const tools = await getOnChainTools({
    wallet: new SafeWalletClient(pk, sepolia),
});
```
