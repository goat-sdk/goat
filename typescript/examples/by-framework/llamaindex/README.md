<div align="center">
<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</div>

# LlamaIndex Agent
## 🚀 Quickstart

This example demonstrates how to use GOAT to allow a [LlamaIndex](https://www.llamaindex.ai/) agent to **send and receive ETH and ERC-20 tokens** on EVM networks. This example uses [Base Sepolia](https://base.org) but you can implement it with any other EVM network by changing the chain and RPC URL.

You can use this example with any other agent framework, chain, and wallet of your choice.

## Setup
1. Clone the repository:
```bash
git clone https://github.com/goat-sdk/goat.git && cd goat
```

2. Run the following commands from the `typescript` directory:
```bash
cd typescript
pnpm install
pnpm build
```

3. Go to the example directory:
```bash
cd examples/by-framework/llamaindex
```

4. Copy the `.env.template` and populate with your values:
```bash
cp .env.template .env
```
- `GEMINI_API_KEY` - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
  (This is required - the application uses Gemini exclusively)
- `WALLET_PRIVATE_KEY` - Your wallet's private key
- `RPC_PROVIDER_URL` - RPC endpoint for Base Sepolia or another EVM chain

5. Make sure you DON'T have any OPENAI_API_KEY in your environment variables, as this might
   cause LlamaIndex to default to using OpenAI instead of Gemini.

5. Add some test funds to your wallet by going to any [Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia).

## Usage
1. Run the interactive CLI:
```bash
pnpm start
```

2. Chat with the agent:
- Check your balance for ETH and ERC-20 tokens
- Send ETH to another address
- Transfer ERC-20 tokens like USDC and PEPE
- Check your balance again to see the tokens you just sent

## How It Works

This example connects LlamaIndex with GOAT's on-chain tools through the following components:

1. **GOAT SDK** - Provides blockchain connectivity and wallet management
2. **LlamaIndex Adapter** - Bridges GOAT's tools with LlamaIndex's agent framework
3. **Viem Wallet** - Handles Ethereum transactions and signing
4. **ERC-20 Plugin** - Enables interactions with tokens like USDC and PEPE
5. **Gemini LLM** - Powers the assistant with Google's AI model

The integration flow is:
1. Create a wallet client using Viem
2. Register GOAT on-chain tools with the LlamaIndex adapter
3. Set up a LlamaIndex query engine with the tools
4. Process user input and execute on-chain actions

## Using in production
In production, developers require advanced wallet setups that utilize [smart wallets](https://docs.goat-sdk.com/concepts/smart-wallets), which allow them to:
1. **Increase security** by setting programmable permissions (e.g. limiting fund amounts, restricting contract interactions, and defining required signatures)
2. **Maintain regulatory compliance** by ensuring agent wallets are non-custodial. This means that:
     - Launchpads, wallet providers, or agent platforms never have access to agents' wallets.
     - Agent platforms do not require money transmitter licenses.

### Agent Wallets
[Crossmint](https://docs.crossmint.com/wallets/quickstarts/agent-wallets) offers one of the most advanced solutions for agent developers and launchpads: [Agent Wallets](https://docs.crossmint.com/wallets/quickstarts/agent-wallets).

To integrate Agent Wallets with GOAT, check out the following quickstarts:
1. Agent Wallets Quickstart [[EVM](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-wallet/crossmint-smart-wallets), [Solana](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-wallet/crossmint-smart-wallets)]
2. [Agent Launchpad Starter Kit](https://github.com/Crossmint/agent-launchpad-starter-kit/)

<footer>
<br/>
<br/>
<div>
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
<div>
</footer> 