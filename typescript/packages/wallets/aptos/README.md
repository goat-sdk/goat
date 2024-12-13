# Goat Wallet Aptos 🐐 - TypeScript

## Installation

```
npm install @goat-sdk/wallet-aptos
```

## Usage

```typescript
import {
    Account,
    Aptos,
    AptosConfig,
    Ed25519PrivateKey,
    Network,
} from "@aptos-labs/ts-sdk";

const aptosClient = new Aptos(
    new AptosConfig({
        network: Network.TESTNET,
    })
);

const aptosPrivateKey = process.env.APTOS_PRIVATE_KEY;
const aptosAccount = Account.fromPrivateKey({
    privateKey: new Ed25519PrivateKey(aptosPrivateKey),
});

const tools = await getOnChainTools({
    wallet: aptos({
        aptosClient,
        aptosAccount,
    }),
});
```
