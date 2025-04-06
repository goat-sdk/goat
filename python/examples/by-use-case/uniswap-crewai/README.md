<div align="center">
<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</div>

# DeFi Swap Assistant with Uniswap
## 🚀 Quickstart

This example demonstrates how to use GOAT to allow a [CrewAI](https://docs.crewai.com/) agent to interact with Uniswap for token swaps and price information. With Google's Gemini as the LLM, the agent can check token prices, provide swap quotes, and guide users through DeFi operations.

This example leverages:
- CrewAI for agent framework
- Google's Gemini LLM for natural language understanding
- GOAT's Uniswap plugin for DeFi operations
- Web3 wallet for Ethereum connectivity

## Setup
1. Clone the repository:
```bash
git clone https://github.com/goat-sdk/goat.git
```

2. Go to the example directory:
```bash
cd python/examples/by-use-case/uniswap-crewai
```

3. Copy the `.env.template` and populate with your values:
```bash
cp .env.template .env
```

Required environment variables:
- `GEMINI_API_KEY` - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
- `ETHEREUM_RPC` - An Ethereum RPC URL (e.g., Infura or Alchemy)
- `ETHEREUM_PRIVATE_KEY` - Your Ethereum wallet private key
- `UNISWAP_API_KEY` - (Optional) Your Uniswap API key for enhanced access

4. Install dependencies:
```bash
poetry install
```

## Usage
1. Run the interactive CLI:
```bash
poetry run python example.py
```

2. Chat with the agent:
- Get token price information
   - "What is the current price of ETH in DAI?"
   - "How much is 1 UNI worth in USDC?"
- Request swap quotes
   - "Get a quote for swapping 0.1 ETH to USDC"
   - "How much DAI would I get for 10 UNI?"
- Learn about token pairs
   - "What's the liquidity for the ETH/USDC pair?"
   - "Tell me about the ETH/DAI trading pair"

## Token Addresses
For convenience, the example includes common token addresses:
- ETH/WETH: `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`
- DAI: `0x6B175474E89094C44Da98b954EedeAC495271d0F`
- USDC: `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`
- USDT: `0xdAC17F958D2ee523a2206206994597C13D831ec7`
- UNI: `0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984`

## Features
- Token price checking
- Swap quote generation
- Gas fee estimation
- Conversational interface
- Common token address reference
- Detailed trade information

## How It Works
The example integrates several components:
1. **Uniswap Plugin**: Provides tools to access the Uniswap API for price and swap information
2. **CrewAI**: Handles agent creation, task assignment, and response handling
3. **Gemini LLM**: Processes natural language requests and generates detailed responses
4. **Web3 Wallet**: Used for Ethereum connectivity and transaction signing

## License
This project is licensed under the terms of the MIT license.

<footer>
<br/>
<br/>
<div>
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">

<div>
</footer> 