# Goat Wallet Sui 🐐 - TypeScript

## Installation

```
npm install @goat-sdk/wallet-sui
```

## Usage

```typescript
import type { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import type { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';

const rpcUrl = getFullnodeUrl('devnet');
const client = new SuiClient({ url: rpcUrl });
const suiPrivateKey = process.env.SUI_PRIVATE_KEY;
const {schema, secretKey} = decodeSuiPrivateKey(PRIVKEY)

const suiAccount = Ed25519Keypair.fromSecretKey(secretKey)

const tools = await getOnChainTools({
    wallet: sui({
        client,
        suiAccount,
    }),
});
```
