<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Radix Wallet for GOAT

## Installation

```
npm install @goat-sdk/wallet-radix
yarn add @goat-sdk/wallet-radix
pnpm add @goat-sdk/wallet-radix
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

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/4821833e-52e5-4126-a2a1-59e9fa9bebd7" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
