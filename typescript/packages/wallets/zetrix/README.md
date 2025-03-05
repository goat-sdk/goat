# Goat Wallet Zetrix 🐐 - TypeScript

## Installation

```
npm install @goat-sdk/wallet-zetrix
```

## Usage

```typescript
import ZtxChainSDK from "zetrix-sdk-nodejs";

const sdk = new ZtxChainSDK({
  host: process.env.NODE_URL,
  secure: true
});

const zetrixAccount = process.env.ZETRIX_ACCOUNT;
const zetrixAccountPrivateKey = process.env.ZETRIX_ACCOUNT_PRIVATE_KEY;

const tools = await getOnChainTools({
    wallet: zetrix({
        zetrixSDK: sdk,
        zetrixAccount: zetrixAccount,
        zetrixAccountPrivateKey: zetrixAccountPrivateKey
    }),
});
```
