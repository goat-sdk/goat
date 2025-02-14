# Goat Wallet Wagmi 🐐 - TypeScript

## Installation
```
npm install @goat-sdk/wallet-wagmi
```

> ⚠️ **NOTE:** You will need to ensure you have correctly installed Wagmi. See [this](https://wagmi.sh/core/installation) guide on how to correctly install.

## Usage

```typescript
import { http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import { createConfig } from "wagmi";

import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { wagmi } from "@goat-sdk/wallet-wagmi";

const wagmiConfig = createConfig({
    chains: [mainnet],
    transports: {
        [mainnet.id]: http(),
    },
});

const tools = await getOnChainTools({
    wallet: wagmi(wagmiConfig),
});
```
