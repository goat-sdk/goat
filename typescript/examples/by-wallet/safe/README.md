<div align="center">
<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</div>

# Using Safe wallets
## 🚀 Quickstart

This example demonstrates how to use GOAT with **[Safe wallets](https://safe.global/)**.

You can use this example with any other agent framework, protocols, and chains of your choice.

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
cd examples/by-wallet/safe
```

4. Copy the `.env.template` and create your own `.env` file:
```bash
cp .env.template .env
```

5. Open the new `.env` file and fill in your values as shown below:

```
OPENAI_API_KEY=your-openai-api-key
WALLET_PRIVATE_KEY=your-wallet-private-key
RPC_PROVIDER_URL=https://your-provider-url
```

**Where to get these values:**
- **OPENAI_API_KEY:** [Get from OpenAI](https://platform.openai.com/signup)
- **WALLET_PRIVATE_KEY:** Export from [MetaMask](https://metamask.io/) or your preferred wallet provider.  
  **Important:** Keep this private and never share it. Store it securely and only use it in safe environments.
- **RPC_PROVIDER_URL:** Get a free Ethereum node endpoint from  
  [Alchemy](https://www.alchemy.com/), [Infura](https://infura.io/), or [QuickNode](https://www.quicknode.com/).  
  Sign up, create a project, and copy your HTTP RPC URL for the desired network (mainnet or testnet).

> **Never share your private keys or API keys publicly. Store them securely.**

## Usage

1. Run the interactive CLI:
```bash
pnpm ts-node index.ts
```

<footer>
<br/>
<br/>
<div>
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">

<div>
</footer>
