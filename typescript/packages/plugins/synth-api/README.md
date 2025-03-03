<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Synth API GOAT Plugin

Interact with the [Synth API](https://synth.mode.network/) from [Mode Network](https://mode.network/).

## Installation
```
npm install @goat-sdk/plugin-synth-api
yarn add @goat-sdk/plugin-synth-api
pnpm add @goat-sdk/plugin-synth-api
```

## Usage
```typescript
import { synthApi } from "@goat-sdk/plugin-synth-api";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
        synthApi(),
    ],
});
```

## Tools
- Get prediction of future possible bitcoin price

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/4821833e-52e5-4126-a2a1-59e9fa9bebd7" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
