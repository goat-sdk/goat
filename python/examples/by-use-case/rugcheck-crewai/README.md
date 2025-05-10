<div align="center">
<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</div>

# Crypto Security Analyst with RugCheck
## 🚀 Quickstart

This example demonstrates how to use GOAT to allow a [CrewAI](https://docs.crewai.com/) agent to analyze token security using the RugCheck API. With Google's Gemini as the LLM, the agent can identify potentially risky tokens, provide security assessments, and track token trends.

This example leverages:
- CrewAI for agent framework
- Google's Gemini LLM for natural language understanding
- GOAT's RugCheck plugin for token security analysis
- Solana wallet for blockchain connectivity

## Setup
1. Clone the repository:
```bash
git clone https://github.com/goat-sdk/goat.git
```

2. Go to the example directory:
```bash
cd python/examples/by-use-case/rugcheck-crewai
```

3. Copy the `.env.template` and populate with your values:
```bash
cp .env.template .env
```

Required environment variables:
- `GEMINI_API_KEY` - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
- `SOLANA_RPC_ENDPOINT` - A Solana RPC URL (e.g., `https://api.devnet.solana.com`)
- `SOLANA_WALLET_SEED` - Your Solana wallet private key in base58 format
- `ETHERSCAN_API_KEY` - Used as JWT token for RugCheck API access

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
- Get information about trending tokens
   - "What are the trending tokens in the last 24 hours?"
   - "Show me the most popular tokens" 
- View newly detected tokens
   - "What tokens were recently detected?"
   - "Show me new tokens on the market"
- Generate token security reports
   - "Generate a report for WIF token (CnLTN3CmJnpRe2dyKXKbJZiNxri6JQHYuvc2EkecJQP5)"
   - "Analyze the security of this token address: [token address]"
- Check most voted tokens
   - "What tokens have the most votes recently?"
   - "Show me the highest voted tokens"

## Features
- Token security analysis
- Recently detected token monitoring
- Trending token identification
- Token report generation
- Most voted token tracking
- Conversational interface powered by Gemini

## How It Works
The example integrates several components:
1. **RugCheck Plugin**: Provides tools to query the RugCheck API for token security data
2. **CrewAI**: Handles agent creation, task assignment, and response handling
3. **Gemini LLM**: Processes natural language requests and generates detailed responses
4. **Solana Wallet**: Used for blockchain connectivity and authentication

## License
This project is licensed under the terms of the MIT license.

<footer>
<br/>
<br/>
<div>
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">

<div>
</footer> 