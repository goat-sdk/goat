
<div align="center">
<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</div>

# Using Crossmint Solana Custodial Wallets
## 🚀 Quickstart

This example demonstrates how to use GOAT to **use a [Crossmint Solana Custodial Wallet](https://www.crossmint.com/products/embedded-wallets-as-a-service)**.

You can use this example with any other agent framework and protocols of your choice.

## Setup
1. Clone the repository:
```bash
git clone https://github.com/goat-sdk/goat.git && cd goat
```

2. Run the following commands from the `typescript` directory:
```bash
cd typescript
pnpm install
pnpm build
```

3. Go to the example directory:
```bash
cd examples/by-wallet/crossmint-solana-custodial-wallets
```

4. Copy the `.env.template` and populate with your values:
```bash
cp .env.template .env
```
- `OPENAI_API_KEY`
- `CROSSMINT_STAGING_API_KEY`
- `EMAIL`
- `CUSTODIAL_WALLET_ADDRESS` - Will be populated after creating the custodial wallet

4. Create a custodial wallet attached to an email address.
```
pnpm ts-node create-custodial-wallet.ts
```

5. Copy the custodial wallet address and add it to the `.env` file.
```
CUSTODIAL_WALLET_ADDRESS=<your custodial wallet address>
```

## Usage
1. Run the interactive CLI:
```bash
pnpm ts-node index.ts
```

2. To use the production key, set the `CROSSMINT_API_KEY` environment variable to your production key and change the chain to a mainnet chain.


## Using in production
In production, developers require advanced wallet setups that utilize [smart wallets](https://docs.goat-sdk.com/concepts/smart-wallets), which allow them to:
1. **Increase security** by setting programmable permissions (e.g. limiting fund amounts, restricting contract interactions, and defining required signatures)
2. **Maintain regulatory compliance** by ensuring agent wallets are non-custodial. This means that:
     - Launchpads, wallet providers, or agent platforms never have access to agents' wallets.
     - Agent platforms do not require money transmitter licenses.

### Agent Wallets
[Crossmint](https://docs.crossmint.com/wallets/quickstarts/agent-wallets) offers one of the most advanced solutions for agent developers and launchpads: [Agent Wallets](https://docs.crossmint.com/wallets/quickstarts/agent-wallets).

To integrate Agent Wallets with GOAT, check out the following quickstarts:
1. Agent Wallets Quickstart [[EVM](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-wallet/crossmint-smart-wallets), [Solana](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-wallet/crossmint-smart-wallets)]
2. [Agent Launchpad Starter Kit](https://github.com/Crossmint/agent-launchpad-starter-kit/)


<footer>
<br/>
<br/>
<div>
  <img src="https://github.com/user-attachments/assets/4821833e-52e5-4126-a2a1-59e9fa9bebd7" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">

<div>
</footer>
