# Goat TEE Plugin 🐐 - TypeScript

Tee plugin for Goat. Allows you to create tools for interacting with the Tee API.

## Installation
```
npm install @goat-sdk/plugin-tee
```

## Setup
    
```typescript
import { tee } from "@goat-sdk/plugin-tee";

const plugin = tee({ 
    teeMode: process.env.TEE_MODE,
    teeSecretSalt: process.env.TEE_SECRET_SALT
});
```
