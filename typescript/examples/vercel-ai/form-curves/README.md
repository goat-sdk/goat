# Vercel AI with Form Curves Example

This example demonstrates how to use GOAT with Vercel AI SDK and viem for Curves contract operations (on Form chain).
It provides a natural language interface through a CLI for Curves tokens trading (buy/sell) withdrawal and deposit (to and from associated ERC20 token) and price querying.

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
- `OPENAI_API_KEY`: Your OpenAI API key for the AI model
- `WALLET_PRIVATE_KEY`: Your wallet's private key (with 0x prefix)

### Default Environment Variables:
- `RPC_PROVIDER_URL`: Defaults to the Form Testnet chain but can be switched to any EVM compatible chain given there is a Curves contract deployed to interact with
- `CURVES_CONTRACT_ADDRESS`: Defaults to the Form Testnet deployed Curves contract but can be switched to any Curves ABI compatible contract address

## Usage

1. Run the interactive CLI:
```bash
npx ts-node index.ts
```

2. Example interactions:
```
# Buy Ooperations
- How much does 0x123...789 cost?
- Buy one 0x123...789

# Sell Operations
- How much is 0x123...789 is sold for?
- Sell one 0x123...789

# ERC20 Operations
- Mint my ERC20 token
- Set ERC20 token name to 'Great On-chain Agent Toolkil' and symbol to 'GOAT'
- Withdraw 3 curves
- Deposit 2 curves
```

3. Understanding responses:
   - Transaction confirmations
   - Balance updates
   - Error messages
   - Operation status
