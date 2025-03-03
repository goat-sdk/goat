<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Eleven Labs Adapter for GOAT

Integrate the more than +200 onchain tools of GOAT with [Eleven Labs](https://elevenlabs.io).

## Installation
```
npm install @goat-sdk/adapter-eleven-labs
yarn add @goat-sdk/adapter-eleven-labs
pnpm add @goat-sdk/adapter-eleven-labs
```

## Usage

See a full working example [here](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-framework/eleven-labs).

```ts
import { getOnChainTools } from "@goat-sdk/adapter-eleven-labs";

const tools = await getOnChainTools({
    wallet: // your wallet
    plugins: // your plugins
});

// ...

// Start the conversation with your agent
await conversation.startSession({
    agentId: process.env.NEXT_PUBLIC_ELEVEN_LABS_AGENT_ID ?? "",
    clientTools: tools,
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
