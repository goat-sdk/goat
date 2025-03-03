<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Hyperlane GOAT Plugin

[Hyperlane](https://hyperlane.xyz/) plugin for Goat. Allows you to create tools for interacting with the Hyperlane protocol.

## Installation

```bash
npm install @goat-sdk/plugin-hyperlane
yarn add @goat-sdk/plugin-hyperlane
pnpm add @goat-sdk/plugin-hyperlane
```

## Usage

```typescript
import { hyperlane } from "@goat-sdk/plugin-hyperlane";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
        hyperlane()
    ]
});
``` 

## Tools
- Make a new Hyperlane wrap
- Send message
- Read message
- Get mailbox
- Get deployed contracts
- Configure ISM
- Manage validators
- Monitor security
- Announce validator
- Configure relayer
- Manage gas payment
- Monitor relayer
- Deploy chain
- Get Hyperlane tokens

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/4821833e-52e5-4126-a2a1-59e9fa9bebd7" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
