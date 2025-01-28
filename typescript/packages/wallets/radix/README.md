# Goat Wallet Radix 🐐 - TypeScript

## Installation

```
npm install @goat-sdk/wallet-radix
```

## Usage

```typescript
import {
    createEd25519KeyPair,
    deriveAccountAddressFromPublicKey,
    createRadixWeb3Client,
} from "radix-web3.js";

const keyPair = createEd25519KeyPair(process.env.RADIX_PRIVATE_KEY);

const accountAddress = await deriveAccountAddressFromPublicKey(
    keyPair.publicKey(),
    1
);

const radixClient = createRadixWeb3Client({
    notaryPublicKey: keyPair.publicKey(),
    notarizer: (hash) => keyPair.signToSignature(hash),
});

const tools = await getOnChainTools({
    wallet: radix({
        client: radixClient,
        accountAddress,
    }),
});
```
