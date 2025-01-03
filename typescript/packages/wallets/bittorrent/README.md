# Goat Wallet BitTorrent 🐐 - TypeScript

## Installation

```
npm install @goat-sdk/wallet-bittorrent
```

## Usage

```typescript
import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { bittorrent } from "@goat-sdk/wallet-bittorrent";

import { Connection, Keypair } from "@bittorrent/web3.js";
import * as bip39 from "bip39";

const connection = new Connection(
    "https://rpc.bittorrentchain.io",
    "confirmed"
);

const mnemonic = process.env.WALLET_MNEMONIC;

const seed = bip39.mnemonicToSeedSync(mnemonic);
const keypair = Keypair.fromSeed(Uint8Array.from(seed).subarray(0, 32));

const tools = await getOnChainTools({
    wallet: bittorrent({
        keypair,
        connection,
    }),
});
```
