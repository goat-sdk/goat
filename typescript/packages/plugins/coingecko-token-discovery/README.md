<div align="center">
<a href="https://github.com/goat-sdk/goat">
<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# CoinGecko Token Discovery Plugin

A GOAT SDK plugin that uses the CoinGecko API to dynamically discover token information for both EVM and Solana wallets.

## Features

- Dynamically discover token information using CoinGecko API
- Fallback to hardcoded token lists if API fails
- Works with both EVM and Solana wallets
- Retrieves token details including contract addresses, decimals, and names

## Installation

```bash
npm install @goat-sdk/plugin-coingecko-token-discovery
yarn add @goat-sdk/plugin-coingecko-token-discovery
pnpm add @goat-sdk/plugin-coingecko-token-discovery
```

## Usage

```typescript
import { getOnChainTools } from "@goat-sdk/adapter-langchain";
import { coinGeckoTokenDiscovery } from "@goat-sdk/plugin-coingecko-token-discovery";
import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createStructuredChatAgent } from "langchain/agents";
import { pull } from "langchain/hub";
import type { ChatPromptTemplate } from "@langchain/core/prompts";

// Create a wallet client
const walletClient = evmKeyPair({
  privateKey: process.env.WALLET_PRIVATE_KEY,
  chain: "mainnet",
  rpcUrl: process.env.RPC_PROVIDER_URL,
});

// Initialize the CoinGecko plugin
const coinGeckoPlugin = coinGeckoTokenDiscovery({
  apiKey: process.env.COINGECKO_API_KEY,
  // Optionally, set usePro to true to use the CoinGecko Pro API
  // usePro: true, 
});

// Get onchain tools for your wallet with the CoinGecko plugin
const tools = await getOnChainTools({
  wallet: walletClient,
  plugins: [coinGeckoPlugin],
});

// Create a LangChain agent with the tools
const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
});

const prompt = await pull<ChatPromptTemplate>(
  "hwchase17/structured-chat-agent",
);

const agent = await createStructuredChatAgent({
  llm,
  tools,
  prompt,
});

const agentExecutor = new AgentExecutor({
  agent,
  tools,
  returnIntermediateSteps: true,
});

// Use the agent to answer questions about tokens
const response = await agentExecutor.invoke({
  input: "Look up information about USDC",
});

console.log("Final Response:", response.output);

// Display the intermediate steps with tool invocations
if (response.intermediateSteps && response.intermediateSteps.length > 0) {
  console.log("\nIntermediate Steps:");
  for (const step of response.intermediateSteps) {
    if (step.action) {
      console.log(`\nTool: ${step.action.tool}`);
      console.log(`Tool Input: ${JSON.stringify(step.action.toolInput, null, 2)}`);
      console.log(`Tool Output: ${step.observation}`);
    }
  }
}
```

## How It Works

The plugin overrides the default token discovery methods in the wallet clients:

1. For EVM and Solana wallets, it overrides `get_token_info_by_ticker`

When a token lookup is requested, the plugin:
1. Searches for the token on CoinGecko
2. Retrieves detailed token information including contract addresses
3. Returns the token information in the format expected by the wallet
4. Falls back to the wallet's hardcoded token list if the API fails or the token isn't found

This allows agents to work with a much wider range of tokens than just those hardcoded in the wallet implementations.

## API Reference

#### `coinGeckoTokenDiscovery(options)`

Creates a new instance of the CoinGecko Token Discovery plugin.

**Parameters:**
- `options` (object):
  - `apiKey` (string): Your CoinGecko API key
  - `usePro` (boolean, optional): Whether to use the CoinGecko Pro API. Defaults to `false` (uses the demo API).

**Returns:**
- A plugin instance that can be used with GOAT SDK wallets

## Tools

* Get token info by ticker
* Token price lookup
* Token metadata lookup

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>

