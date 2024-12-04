# Vercel AI Polymarket Example

## Setup

Copy the `.env.template` and populate with your values.

```
cp .env.template .env
```

`POLYMARKET_API_KEY`, `POLYMARKET_SECRET` and `POLYMARKET_PASSPHRASE` will be populated in the next step.

## Usage

1. Create an API key for your wallet using Polymarket's API key creation tool

```
pnpm polymarket:api-key
```

2. Copy the API key response into the `.env` file

3. To use Polymarket you need to approve the exchange contracts to use your tokens (e.USDC or conditional tokens) so it can complete the trade on your behalf. This approval lets the exchanges move the tokens you’re using for buying or selling without needing your manual confirmation every time. It's like giving a trusted broker permission to handle the payment and delivery for a transaction you’ve already agreed to.

To approve the exchange contracts to use your tokens run the `setup-allowance` script.

```
pnpm polymarket:setup-allowance
```

4. Top up USDC.e to your wallet. **Important**, Polymarket uses USDC.e, not USDC. This is Bridged USDC on Polygon which is a different contract than USDC. If you top up USDC, you will get a "not enough funds" error. See contract [here](https://polygonscan.com/address/0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174).

5. Run the script with your prompt!
```
npx ts-node index.ts
```
Some examples:
* Prompt it to list events that have not closed yet
* Purchase a position on an event
* Prompt it to list all your active orders
* Prompt it to cancel all your active orders

## Actions it supports

- `Get events`: Get a list of events filtered by date, liquidity, slug, etc.
- `Get market info`: Get info about a specific market using the market id
- `Create an order`: Create an order for a specific market. Specify the type of order (FOK - Fill or Kill, GTC - Good Till Canceled, GTD - Good Till Date), the market id, the side (buy or sell), the price, the quantity and the expiration date.
- `List all my active orders`: List all your active orders
- `Cancel an order`: Cancel an order using the order id
- `Cancel all my active orders`: Cancel all your active orders

Want support for more actions? [Open an issue](https://github.com/goat-sdk/goat-sdk/issues) and let us know!
