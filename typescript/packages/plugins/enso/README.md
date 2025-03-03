<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Enso GOAT Plugin

Get access to 180+ protocols through [Enso](https://enso.fi/) for onchain actions, such as swap, deposit, lend, borrow etc.

## Installation

```bash
npm install @goat-sdk/plugin-enso
yarn add @goat-sdk/plugin-enso
pnpm add @goat-sdk/plugin-enso
```

## Usage

```typescript
import { enso } from '@goat-sdk/plugin-enso';

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
       enso({
            apiKey: process.env.ENSO_API_KEY
       })
    ]
});
```

## Tools

- Find the most optimal route between 2 tokens and execute it

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/4821833e-52e5-4126-a2a1-59e9fa9bebd7" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
