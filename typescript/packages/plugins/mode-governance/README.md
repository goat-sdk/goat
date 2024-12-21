# Goat Mode Governance Plugin 🐐

Mode governance plugin for Goat. Allows agents to participate in Mode DAO governance by voting on gauges and managing voting power.

## Installation
```bash
npm install @goat-sdk/plugin-mode-governance
```

## Usage

```typescript
import { modeGovernance } from "@goat-sdk/plugin-mode-governance";
import { getOnChainTools } from '@goat-sdk/adapter-vercel-ai';

const tools = getOnChainTools({
    wallet: viem(wallet),
    plugins: [
        modeGovernance(),
    ],
});
```

## Features

- Get list of all available gauges for voting
- Check current voting power
- Vote on multiple gauges with percentage weights
- View current votes for specific gauges
- Track used voting weight
- Get last vote timestamp

## Example Prompts

```
"Check my current voting power in the Mode DAO"
"Show me all available gauges I can vote on"
"Vote 60% on gauge A and 40% on gauge B"
"When was my last vote cast?"
```

## Contract Addresses

- Gauge Voter: `0x71439Ae82068E19ea90e4F506c74936aE170Cf58`
- Voting Escrow: `0xff8AB822b8A853b01F9a9E9465321d6Fe77c9D2F`

## Goat

<div align="center">
Go out and eat some grass.

[Docs](https://ohmygoat.dev) | [Examples](https://github.com/goat-sdk/goat/tree/main/typescript/examples) | [Discord](https://discord.gg/goat-sdk)
</div>