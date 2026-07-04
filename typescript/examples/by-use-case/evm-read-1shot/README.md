
<div align="center">
<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</div>

# Mint an NFT on EVM
## 🚀 Quickstart

This example demonstrates how to use GOAT to **Read from EVM** using [1Shot](https://1shotapi.com/).

1Shot is your 1Stop for Web3 + AI. It allows your AI agent to discover contracts, create new tools from the contracts, and utilize the contracts, without you having to know anything at all about blockchain programming, abstractions, wallets or crypto. With our advanced escrow wallet tech, all your working tokens are held and usable by 1Shot without having to provide and secure a local wallet, inceasing the speed of your bot 

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
cd examples/by-use-case/evm-read-1shot
```

4. Copy the `.env.template` and populate with your values:
```bash
cp .env.template .env
```
- `OPENAI_API_KEY`
- `ONESHOT_API_KEY`
- `ONESHOT_API_SECRET`
- `ONESHOT_BUSINESS_ID` - The particular business you want to work with.


## Usage
1. Run the interactive CLI:
```bash
pnpm ts-node index.ts
```

2. Chat with the agent:
- Look up contracts you have defined in 1Shot
- Read values from your contracts

## Using in production
There's no need to change anything to use 1Shot in your production system! 1Shot handles the security of your funds and manages transaction lifecycles. Your AI client app does not need any additional security measures beyond keeping your API key and secret safe- no additional crypto security overhead required.


<footer>
<br/>
<br/>
<div>
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">

<div>
</footer>
