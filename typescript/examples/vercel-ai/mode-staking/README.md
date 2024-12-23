# Mode Staking Example

Example of using the Mode Staking plugin with GOAT SDK and GPT-4 to manage Mode DAO staking positions.

## Setup

1. Copy `.env.template` to `.env`:
```bash
cp .env.template .env
```

2. Fill in the environment variables in `.env`:
- `OPENAI_API_KEY`: Your OpenAI API key
- `WALLET_PRIVATE_KEY`: Your wallet's private key (with MODE tokens)
- `RPC_PROVIDER_URL`: Mode Network RPC URL (defaults to https://mainnet.mode.network)

3. Install dependencies:
```bash
npm install
```

4. Run the example:
```bash
npm start
```

## Example Tasks

The example demonstrates several staking operations:
1. Viewing current staking positions
2. Staking MODE tokens with maximum duration
3. Checking cooldown periods
4. Increasing stake amounts
5. Extending lock durations

## Important Notes

- Make sure your wallet has sufficient MODE tokens
- The Mode Network must be operational
- The wallet must have enough ETH for gas fees