# Vercel AI Uniswap Example

## Setup

Create an `.env` file by copying the `.env.template` and populating with your values.

```
cp .env.template .env
```

`UNISWAP_API_KEY` and `UNISWAP_BASE_URL` will be populated in the next step.

## Usage

1. Create an API key for Uniswap's Trading API by visiting [this page](https://hub.uniswap.org/) and following the instructions. Also obtain the url from the API key creation page.

2. Run the script with your prompt!

```
npx ts-node index.ts
```

Some examples:

* Prompt it to swap 1 ETH for USDC

## Actions it supports

- `Get Quote`: Get a quote for a swap
- `Get Swap Transaction`: Get the transaction details for a swap
- `Send Transaction`: Send a transaction
- `Check Approval`: Check if the wallet has enough approval for a token and returns the transaction to approve the token. The approval must takes place before the swap transaction.

Want support for more actions? [Open an issue](https://github.com/goat-sdk/goat-sdk/issues) and let us know!
