# Goat Farcaster Plugin 🐐 - TypeScript

Farcaster plugin for Goat. Allows you to create tools for interacting with the Farcaster social protocol through the Neynar API.

## Installation
```bash
npm install @goat-sdk/plugin-farcaster
```

## Setup
    
```typescript
import { farcaster } from "@goat-sdk/plugin-farcaster";

const plugin = farcaster({ 
    apiKey: process.env.NEYNAR_API_KEY 
});
```


## Features

- Full Farcaster protocol support through Neynar API
- Cast creation and interaction
- Thread and conversation management
- Search functionality
- Authentication via Signer UUID
- Proper error handling
- TypeScript support with complete type definitions

## API Reference

### Plugin Configuration

| Parameter | Type | Description |
|-----------|------|-------------|
| apiKey | string | Your Neynar API key |
| baseUrl | string | (Optional) Custom API base URL |

## Goat

<div align="center">
Go out and eat some grass.

[Docs](https://ohmygoat.dev) | [Examples](https://github.com/goat-sdk/goat/tree/main/typescript/examples) | [Discord](https://discord.gg/goat-sdk)</div>

## Goat 🐐
Goat 🐐 (Great Onchain Agent Toolkit) is an open-source library enabling AI agents to interact with blockchain protocols and smart contracts via their own wallets.