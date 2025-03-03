<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Zilliqa GOAT plugin

Provides various useful actions for interacting with the Zilliqa blockchain and services running on top of it.

## Installation

```
npm install @goat-sdk/plugin-zilliqa
yarn add @goat-sdk/plugin-zilliqa
pnpm add @goat-sdk/plugin-zilliqa
```

## Usage

```typescript
import { zilliqa } from "@goat-sdk/plugin-zilliqa";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [zilliqa()],
});
```

## Tools

- Convert an EVM address to a Zilliqa address
- Convert a Zilliqa address to an EVM address
- Transfer ZIL from an EVM address to a Zilliqa address
- Transfer ZIL from a Zilliqa address to an EVM address
- Get the balance of a Zilliqa address

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/4821833e-52e5-4126-a2a1-59e9fa9bebd7" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
