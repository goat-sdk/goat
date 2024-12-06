# Goat Crossmint 🐐 - TypeScript

A set of tools and wallet clients for interacting with Crossmint APIs.

Wallet Clients:
1. **Smart Wallet**: Wallet client for interacting with Crossmint Smart Wallets
2. **Custodial Wallet**: Wallet client for interacting with Crossmint Custodial Wallets

Plugins:
1. **USDC Faucet**: Tools to top up your wallet with USDC on testnets

## Installation
```
npm install @goat-sdk/wallet-crossmint
```

## Usage

### Smart Wallet
```typescript
import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { crossmint } from "@goat-sdk/crossmint";

const apiKey = process.env.CROSSMINT_STAGING_API_KEY;
const walletSignerSecretKey = process.env.SIGNER_WALLET_SECRET_KEY;
const alchemyApiKey = process.env.ALCHEMY_API_KEY_BASE_SEPOLIA;
const smartWalletAddress = process.env.SMART_WALLET_ADDRESS;

const { smartwallet } = crossmint(apiKey);

const tools = await getOnChainTools({
    wallet: await smartwallet({
        address: smartWalletAddress,
        signer: {
            secretKey: walletSignerSecretKey as `0x${string}`,
        },
        chain: "base-sepolia",
        provider: alchemyApiKey,
    }),
});
```

### Custodial Wallet
```typescript
import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { crossmint } from "@goat-sdk/crossmint";
import { Connection } from "@solana/web3.js";

const apiKey = process.env.CROSSMINT_STAGING_API_KEY;
const email = process.env.EMAIL;

if (!apiKey || !email) {
    throw new Error("Missing environment variables");
}

const { custodial } = crossmint(apiKey);

const tools = await getOnChainTools({
    wallet: await custodial({
        chain: "solana",
        email: email,
        env: "staging",
        connection: new Connection(
            "https://api.devnet.solana.com",
            "confirmed"
        ),
    }),
});
```

### Faucet
```typescript
import { createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { http } from "viem";

import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { viem } from "@goat-sdk/wallet-viem";
import { crossmint } from "@goat-sdk/crossmint";

const account = privateKeyToAccount(
    process.env.WALLET_PRIVATE_KEY as `0x${string}`
);

const walletClient = createWalletClient({
    account: account,
    transport: http(process.env.ALCHEMY_API_KEY),
    chain: sepolia,
});

const apiKey = process.env.CROSSMINT_STAGING_API_KEY;

const { faucet } = crossmint(apiKey);

const tools = await getOnChainTools({
    wallet: viem(walletClient),
    plugins: [faucet()],
});
```
