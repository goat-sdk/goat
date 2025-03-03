<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Aptos Wallet for GOAT

## Installation
```
npm install @goat-sdk/wallet-aptos
yarn add @goat-sdk/wallet-aptos
pnpm add @goat-sdk/wallet-aptos
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

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/4821833e-52e5-4126-a2a1-59e9fa9bebd7" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
<div>
</footer>
