# Goat Wallet Solana 🐐 - TypeScript

## Installation
```
npm install @goat-sdk/wallet-solana
```

## Usage
```typescript
import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { solana } from "@goat-sdk/wallet-solana";

import { Connection, Keypair } from "@solana/web3.js";
import * as bip39 from "bip39";

const connection = new Connection(
    "https://api.mainnet-beta.solana.com",
    "confirmed"
);

const mnemonic = process.env.WALLET_MNEMONIC;

const seed = bip39.mnemonicToSeedSync(mnemonic);
const keypair = Keypair.fromSeed(Uint8Array.from(seed).subarray(0, 32));

const tools = await getOnChainTools({
    wallet: solana({
        keypair,
        connection,
    }),
});
```
