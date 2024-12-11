# Langchain with Lit Example

## Setup

Copy the `.env.template` and populate with your values.

```
cp .env.template .env
```

### Prerequisites

- From the `.env` file, the `WALLET_PRIVATE_KEY` must have Lit test tokens in order to mint a PKP and capacity credit
  - You can get test tokens from the [Lit Testnet Faucet](https://chronicle-yellowstone-faucet.getlit.dev/)
- From the `.env` file, the `SOLANA_PRIVATE_KEY` must have SOL on the Solana Devnet in order to fund the wrapped key
  - You can get SOL from the [Solana Devnet Faucet](https://faucet.solana.com/?cluster=devnet)
- From the `.env` file, the `ETH_PRIVATE_KEY` must have ETH on the Sepolia testnet in order to fund the wrapped key
  - You can get ETH from the [Sepolia Faucet](https://sepoliafaucet.com/)

## Usage

Run the EVM example:

```
npx ts-node src/evm.ts
```

Run the Solana example:

```
npx ts-node src/sol.ts
```
