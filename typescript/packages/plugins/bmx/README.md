<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# BMX GOAT Plugin

Get token information from [BMX](https://www.bmx.trade/)

## Installation
```bash
npm install @goat-sdk/plugin-bmx
yarn add @goat-sdk/plugin-bmx
pnpm add @goat-sdk/plugin-bmx
```

## Usage

```typescript
import { bmx } from "@goat-sdk/plugin-bmx";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
       bmx()
    ]
});
```

## Tools
- Open positions
- Closed positions
- Get position details

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/4821833e-52e5-4126-a2a1-59e9fa9bebd7" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
