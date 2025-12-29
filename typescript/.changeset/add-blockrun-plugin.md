---
"@goat-sdk/plugin-blockrun": minor
---

Add BlockRun plugin - AI Gateway with x402 USDC payments on Base

BlockRun enables GOAT agents to access 31+ AI models (GPT-4, Claude, Gemini) via pay-per-use USDC micropayments. No API keys required - agents pay directly with their wallets.

Features:
- chatCompletion: Send prompts to AI models
- generateImage: Generate images with DALL-E 3
- getModels: List available models with pricing

Payment: USDC on Base network only (chain ID 8453)
Security: Private key never leaves your machine - only used locally for EIP-712 signing
