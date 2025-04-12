<div align="center">
<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</div>

# OpenSea NFT Explorer with LangChain and Gemini
## 🚀 Quickstart

This example demonstrates how to use GOAT to allow a [LangChain](https://langchain.com/) agent to query NFT data from OpenSea. With Google's Gemini as the LLM, the agent can answer questions about NFT collections, sales data, floor prices, and more.

This example leverages:
- LangChain for agent framework
- Google's Gemini LLM for natural language understanding
- GOAT's OpenSea plugin for NFT data retrieval
- Web3 for blockchain connectivity

## Setup
1. Clone the repository:
```bash
git clone https://github.com/goat-sdk/goat.git
```

2. Go to the example directory:
```bash
cd python/examples/by-use-case/opensea-langchain
```

3. Copy the `.env.template` and populate with your values:
```bash
cp .env.template .env
```

Required environment variables:
- `GEMINI_API_KEY` - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
- `WALLET_PRIVATE_KEY` - Your Ethereum private key (starts with 0x)
- `RPC_PROVIDER_URL` - An Ethereum RPC URL (e.g., Infura, Alchemy, or public endpoints)
- `OPENSEA_API_KEY` - Optional but recommended for higher rate limits

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
- Get collection statistics and floor prices
   - "What are the stats for Bored Ape Yacht Club?"
   - "What's the floor price of Doodles?" 
- View recent NFT sales
   - "Show me recent sales from the Azuki collection"
   - "What NFTs sold recently in the CryptoPunks collection?"
- Retrieve metadata for specific NFTs
   - "What is the metadata for Bored Ape #7495?"
   - "Tell me about CryptoPunk #1234"
- Track market trends
   - "Compare floor prices between Azuki and Doodles"
   - "How has the BAYC collection performed this month?"

## Features
- Real-time NFT data from OpenSea
- Collection statistics (floor price, volume, etc.)
- Recent sales tracking 
- NFT metadata retrieval
- Conversational interface powered by Gemini
- Support for all OpenSea-compatible chains

## How It Works
The example integrates several components:
1. **OpenSea Plugin**: Provides tools to query the OpenSea API for NFT data
2. **LangChain**: Handles agent creation, tool calling, and response formatting
3. **Gemini LLM**: Processes natural language requests and generates responses
4. **Web3 Wallet**: Authenticates API requests (though no transactions are made)

## License
This project is licensed under the terms of the MIT license.

<footer>
<br/>
<br/>
<div>
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">

<div>
</footer> 