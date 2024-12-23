# Mode Governance Example

Example of using the Mode Governance plugin with GOAT SDK and GPT-4.

## Setup

1. Copy `.env.template` to `.env`:
```bash
cp .env.template .env
```

2. Fill in the environment variables in `.env`:
- `OPENAI_API_KEY`: Your OpenAI API key
- `WALLET_PRIVATE_KEY`: Your wallet's private key (with Mode tokens)
- `RPC_PROVIDER_URL`: Mode Network RPC URL (defaults to https://mainnet.mode.network)

3. Install dependencies:
```bash
npm install
```

4. Run the example:
```bash
npm start
```

## Example Prompts

The example includes several prompts demonstrating different governance actions:
- Checking voting power
- Viewing available gauges
- Casting votes
- Checking voting history