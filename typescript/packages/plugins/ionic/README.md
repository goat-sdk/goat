<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Ionic GOAT Plugin

[Ionic](https://ionic.money/) plugin for GOAT. Allows you to create tools for interacting with the Ionic protocol.

## Installation

```bash
npm install @goat-sdk/plugin-ionic
yarn add @goat-sdk/plugin-ionic
pnpm add @goat-sdk/plugin-ionic
```


## Usage

```typescript
import { ionic } from "@goat-sdk/plugin-ionic";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
        ionic()
    ]
});
```

## Tools

- Borrow and supply assets
- Loop assets
- Swap collateral

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/4821833e-52e5-4126-a2a1-59e9fa9bebd7" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
