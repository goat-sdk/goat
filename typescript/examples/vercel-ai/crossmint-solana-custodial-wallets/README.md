# Vercel AI with Crossmint Solana Custodial Wallets Example

## Setup

Copy the `.env.template` and populate with your values.

```
cp .env.template .env
```

## Usage

1. Create a custodial wallet attached to an email address.

```
npx ts-node create-custodial-wallet.ts
```

3. Get the custodial wallet address and add it to the `.env` file.
```
CUSTODIAL_WALLET_ADDRESS=<your custodial wallet address>
```

4. Run the example.
```
npx ts-node index.ts
```
