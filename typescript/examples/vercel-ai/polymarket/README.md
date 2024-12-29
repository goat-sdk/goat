# Vercel AI Polymarket Example

## Prerequisites

Before starting, you'll need:
1. An OpenAI API key (get one from [OpenAI's platform](https://platform.openai.com))
2. A wallet with:
   - Some MATIC for gas fees (0.1 MATIC should be enough)
   - USDC.e tokens for trading (not regular USDC)
3. A Polygon RPC URL (get one from [Alchemy](https://www.alchemy.com) or [Infura](https://www.infura.io))

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Copy the `.env.template` and populate with your values:
```bash
cp .env.template .env
```

3. Edit your `.env` file with the following values:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `WALLET_PRIVATE_KEY`: Your wallet's private key (with 0x prefix)
   - `RPC_PROVIDER_URL`: Your Polygon RPC URL

   The following values will be populated in the next step:
   - `POLYMARKET_API_KEY`
   - `POLYMARKET_SECRET`
   - `POLYMARKET_PASSPHRASE`

4. Create an API key for your wallet using Polymarket's API key creation tool:
```bash
pnpm polymarket:api-key
```

5. Copy the API key response values into your `.env` file:
   - `POLYMARKET_API_KEY`
   - `POLYMARKET_SECRET`
   - `POLYMARKET_PASSPHRASE`

6. Set up token allowances for trading. This approval lets the exchanges move tokens on your behalf:
```bash
pnpm polymarket:setup-allowance
```

7. Make sure your wallet has:
   - Some MATIC for gas fees (0.1 MATIC should be enough)
   - USDC.e tokens for trading. **Important**: Polymarket uses USDC.e (Bridged USDC on Polygon), not regular USDC. See contract [here](https://polygonscan.com/address/0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174).

   You can get MATIC and USDC.e through:
   - A centralized exchange that supports direct withdrawal to Polygon
   - Bridge assets from Ethereum using the [Polygon Bridge](https://wallet.polygon.technology/bridge)
   - Buy directly on a DEX on Polygon

## Usage

Run the interactive script:
```bash
pnpm ts-node index.ts
```

The script will start an interactive session where you can type your prompts. Some example prompts:
* "List events that have not closed yet"
* "Purchase a position on an event"
* "List all my active orders"
* "Cancel all my active orders"

## Available Actions

- `Get events`: Get a list of events filtered by date, liquidity, slug, etc.
- `Get market info`: Get info about a specific market using the market id
- `Create an order`: Create an order for a specific market. Specify the type of order (FOK - Fill or Kill, GTC - Good Till Canceled, GTD - Good Till Date), the market id, the side (buy or sell), the price, the quantity and the expiration date.
- `List all my active orders`: List all your active orders
- `Cancel an order`: Cancel an order using the order id
- `Cancel all my active orders`: Cancel all your active orders

Want support for more actions? [Open an issue](https://github.com/goat-sdk/goat-sdk/issues) and let us know!
