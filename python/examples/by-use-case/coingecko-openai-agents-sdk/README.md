<div align="center">
<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</div>

# Crypto Market Analyst with CoinGecko
## 🚀 Quickstart

This example demonstrates how to use GOAT to enable an [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/) agent to fetch and analyze cryptocurrency market data through the CoinGecko API. The agent can provide real-time price information, market data, historical trends, and comparative analysis.

This example leverages:
- OpenAI Agents SDK for agent framework
- OpenAI's GPT models for natural language understanding
- GOAT's CoinGecko plugin for cryptocurrency market data
- Web3 wallet for SDK connectivity requirements

## Setup
1. Clone the repository:
```bash
git clone https://github.com/goat-sdk/goat.git
```

2. Go to the example directory:
```bash
cd python/examples/by-use-case/coingecko-openai-agents-sdk
```

3. Copy the `.env.template` and populate with your values:
```bash
cp .env.template .env
```

Required environment variables:
- `OPENAI_API_KEY` - Get from [OpenAI Platform](https://platform.openai.com/api-keys)
- `COINGECKO_API_KEY` - (Optional) Can be empty for free tier with rate limits
- `RPC_PROVIDER_URL` - Any Ethereum RPC URL (required by SDK but not used for functionality)
- `WALLET_PRIVATE_KEY` - Any Ethereum private key (required by SDK but not used for functionality)

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
- Get current cryptocurrency prices
   - "What's the current price of Bitcoin?"
   - "How much is Ethereum worth today?"
- View market data
   - "Show me market data for Solana"
   - "What's the market cap of Cardano?"
- Get historical price information
   - "What's the price history of Polkadot for the last 30 days?"
   - "Show me Bitcoin's price trend this month"
- Compare cryptocurrencies
   - "Compare the prices of Bitcoin and Ethereum"
   - "Which has better performance, Solana or Avalanche?"

## Features
- Real-time cryptocurrency price information
- Detailed market data (volume, market cap, supply)
- Historical price trends and analysis
- Multi-currency comparison
- Conversational interface powered by OpenAI
- Free tier access with CoinGecko's API

## How It Works
The example integrates several components:
1. **CoinGecko Plugin**: Provides tools to query the CoinGecko API for cryptocurrency data
2. **OpenAI Agents SDK**: Handles agent creation, tool integration, and response handling
3. **OpenAI GPT Models**: Process natural language requests and generate detailed responses
4. **Web3 Wallet**: Required by the SDK architecture but not used for CoinGecko functionality

## License
This project is licensed under the terms of the MIT license.

<footer>
<br/>
<br/>
<div>
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">

<div>
</footer> 