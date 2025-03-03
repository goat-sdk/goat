<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Solana Wallet for GOAT

## Installation
```
npm install @goat-sdk/wallet-solana
yarn add @goat-sdk/wallet-solana
pnpm add @goat-sdk/wallet-solana
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

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/4821833e-52e5-4126-a2a1-59e9fa9bebd7" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
