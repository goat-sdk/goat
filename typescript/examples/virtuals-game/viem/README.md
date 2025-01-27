# GAME with viem Example

This example demonstrates how to integrate GOAT with the Virtuals Protocol GAME framework using viem for Ethereum operations. It shows how to create a GameAgent that can execute on-chain actions through custom GameFunctions, specifically focusing on token swaps and transfers on the Mode network.

## Overview
The example showcases:
- Integration with Virtuals Protocol GAME framework
- Custom GameFunction creation from GOAT tools
- Mode network integration
- ERC20 token operations (USDC, PEPE)
- ETH transfer capabilities
- Automated agent execution

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Copy the `.env.template` and populate with your values:
```bash
cp .env.template .env
```

### Required Environment Variables:
- `OPENAI_API_KEY`: Your OpenAI API key
- `WALLET_PRIVATE_KEY`: Your wallet's private key (with 0x prefix)
- `RPC_PROVIDER_URL`: Mode network RPC URL
- `VIRTUALS_GAME_API_KEY`: Your Virtuals Protocol GAME API key

## Usage

1. Run the example:
```bash
npx ts-node index.ts
```

2. The script will:
   - Initialize GOAT tools for ETH and ERC20 operations
   - Convert tools to GameFunctions
   - Create a GameWorker with the functions
   - Initialize a GameAgent with the worker
   - Execute the agent's goal (swap 0.01 USDC to MODE)

3. Monitor Progress:
   - Watch verbose output for step-by-step execution
   - Check transaction status and results
   - Review any error messages
