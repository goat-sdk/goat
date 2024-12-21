# Goat Mode Staking Plugin 🐐

Mode staking plugin for Goat. Allows agents to stake MODE tokens, manage staking positions, and track cooldown/warmup periods.

## Installation
```bash
npm install @goat-sdk/plugin-mode-staking
```

## Usage

```typescript
import { modeStaking } from "@goat-sdk/plugin-mode-staking";
import { getOnChainTools } from '@goat-sdk/adapter-vercel-ai';

const tools = getOnChainTools({
    wallet: viem(wallet),
    plugins: [
        modeStaking(),
    ],
});
```

## Features

### Staking Operations
- Stake MODE tokens with customizable lock duration
- Unstake tokens from existing positions
- Increase staked amount for existing positions
- Extend lock duration for existing positions

### Position Management
- View all staking positions for a wallet
- Check position details including:
  - Staked amount
  - Lock end time
  - Current voting power

### Timelock Information
- Check cooldown period status and remaining time
- Check warmup period status and remaining time

## Contract Addresses

- MODE Token: `0xDfc7C877a950e49D2610114102175A06C2e3167a`
- Voting Escrow: `0xff8AB822b8A853b01F9a9E9465321d6Fe77c9D2F`
- veNFT Lock: `0x06ab1Dc3c330E9CeA4fDF0C7C6F6Fb6442A4273C`
- Exit Queue: `0x915e50A7C53e05F72122bC883309a812A90bA163`
- Clock: `0x66CC481755f8a9d415e75d29C17B0E3eF2Af70bD`

## Example Prompts

```
"Stake 1000 MODE tokens for 52 weeks"
"Check all my current staking positions"
"Increase my stake in position #123 by 500 MODE"
"Extend lock time for position #123 by 26 weeks"
"Check cooldown period for position #123"
"Check warmup period for position #123"
"Unstake my tokens from position #123"
```

## Important Notes

### Lock Duration
- Maximum lock duration is 52 weeks
- Longer lock duration results in higher voting power
- Lock duration cannot be reduced, only extended

### Cooldown and Warmup
- Positions have cooldown periods when unstaking
- New positions have warmup periods before gaining full voting power
- These periods cannot be bypassed

### Voting Power
- Voting power depends on amount staked and lock duration
- Higher amounts and longer locks = more voting power
- Voting power decays linearly as lock expiration approaches

## Goat

<div align="center">
Go out and eat some grass.

[Docs](https://ohmygoat.dev) | [Examples](https://github.com/goat-sdk/goat/tree/main/typescript/examples) | [Discord](https://discord.gg/goat-sdk)
</div>

## Contributing
Please follow the standard Goat contribution guidelines. Submit issues and PRs on the main Goat repository.