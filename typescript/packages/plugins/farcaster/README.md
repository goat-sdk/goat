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

## Available Actions

### Get Cast
Fetch a cast by its URL or hash identifier.

```typescript
const result = await tools.get_cast({
    identifier: "0x123...", 
    type: "hash"
});
```

### Publish Cast
Create a new cast or reply to an existing one.

```typescript
const result = await tools.publish_cast({
    signer_uuid: "your-signer-uuid",
    text: "Hello Farcaster!",
    channel_id: "neynar" // optional
});
```

### Search Casts
Search for casts with various filters.

```typescript
const results = await tools.search_casts({
    query: "purpleexplorer",
    author_fid: 197049, // optional
    limit: 20 // optional
});
```

### Get Conversation
Fetch a conversation thread including replies.

```typescript
const conversation = await tools.get_conversation({
    identifier: "0x98c42f01",
    reply_depth: 2,
    limit: 20
});
```

### Delete Cast
Delete a cast you've published.

```typescript
const result = await tools.delete_cast({
    signer_uuid: "your-signer-uuid",
    hash: "0x98c42f01"
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

### Response Types

All methods return properly typed responses matching the Farcaster API structure. See the [type definitions](./src/types.ts) for complete details.

## Goat

<div align="center">
Go out and eat some grass.

[Docs](https://ohmygoat.dev) | [Examples](https://github.com/goat-sdk/goat/tree/main/typescript/examples) | [Discord](https://discord.gg/goat-sdk)</div>

## Goat 🐐
Goat 🐐 (Great Onchain Agent Toolkit) is an open-source library enabling AI agents to interact with blockchain protocols and smart contracts via their own wallets.