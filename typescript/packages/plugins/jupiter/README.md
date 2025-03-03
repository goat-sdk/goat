<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Jupiter GOAT Plugin

Swap tokens on [Jupiter](https://jup.ag/).

## Installation

```bash
npm install @goat-sdk/plugin-jupiter
yarn add @goat-sdk/plugin-jupiter
pnpm add @goat-sdk/plugin-jupiter
```


## Usage

```typescript
import { jupiter } from "@goat-sdk/plugin-jupiter";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
        jupiter()
    ]
});
```

## Tools
- Get quote
- Swap

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/4821833e-52e5-4126-a2a1-59e9fa9bebd7" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
