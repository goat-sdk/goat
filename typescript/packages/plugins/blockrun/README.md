# BlockRun Plugin for GOAT SDK

Access 31+ AI models (GPT-4, Claude, Gemini, and more) with pay-per-use USDC micropayments via the x402 protocol.

## Features

- **No API Keys Required**: Agents pay directly with USDC, no need to manage OpenAI/Anthropic API keys
- **31+ AI Models**: Access GPT-4, Claude 3.5, Gemini 2.0, and more through a single endpoint
- **Pay-Per-Use**: Only pay for what you use via x402 USDC micropayments on Base
- **OpenAI Compatible**: Drop-in replacement for OpenAI API

## Installation

```bash
npm install @goat-sdk/plugin-blockrun
# or
yarn add @goat-sdk/plugin-blockrun
# or
pnpm add @goat-sdk/plugin-blockrun
```

## Usage

```typescript
import { blockrun } from "@goat-sdk/plugin-blockrun";
import { getOnChainTools } from "@goat-sdk/adapter-langchain";

const tools = await getOnChainTools({
    wallet: myWallet,
    plugins: [blockrun()],
});
```

## Available Tools

### chatCompletion

Send a prompt to an AI model and get a response.

**Parameters:**
- `model` (string): The AI model to use (e.g., "openai/gpt-4o", "anthropic/claude-3-5-sonnet")
- `prompt` (string): The prompt or message to send
- `systemPrompt` (string, optional): System prompt to set AI behavior
- `maxTokens` (number, optional): Maximum tokens to generate (default: 1024)
- `temperature` (number, optional): Response randomness 0-2 (default: 0.7)

### generateImage

Generate an image using AI models like DALL-E 3.

**Parameters:**
- `model` (string): The image model to use (e.g., "openai/dall-e-3")
- `prompt` (string): Description of the image to generate
- `size` (string): Image size - "1024x1024", "1792x1024", or "1024x1792"
- `n` (number, optional): Number of images to generate (default: 1)

### getModels

Get the list of available AI models with pricing information.

**Parameters:**
- `category` (string): Filter by "all", "chat", "image", or "embedding"

## Supported Models

| Provider | Models |
|----------|--------|
| OpenAI | GPT-4o, GPT-4o-mini, GPT-4-turbo, o1, o1-mini, DALL-E 3 |
| Anthropic | Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus |
| Google | Gemini 2.0 Flash, Gemini 1.5 Pro, Gemini 1.5 Flash |
| And more... | 31+ models total |

## Pricing

BlockRun charges the same rates as official APIs with 0% markup during beta. Payments are made in USDC on Base network via the x402 protocol.

## Links

- [BlockRun Website](https://blockrun.ai)
- [BlockRun Documentation](https://blockrun.ai/docs)
- [x402 Protocol](https://x402.org)
