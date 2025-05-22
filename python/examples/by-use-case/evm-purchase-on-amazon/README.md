<div align="center">
<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</div>

# Purchase any item on Amazon using EVM (Python)
## 🚀 Quickstart

This example demonstrates how to use GOAT with Python to **purchase any item on Amazon US** using EVM and Crossmint's headless checkout API. This example uses the Sepolia testnet but you can implement it with any other EVM network by changing the chain ID and RPC URL.

This implementation uses the OpenAI Assistants API for the agent, mirroring the structure of the TypeScript example.

## Setup
1. Clone the repository:
```bash
git clone https://github.com/goat-sdk/goat.git && cd goat
```

2. Install the required dependencies:
```bash
cd python
pip install -e .
```

3. Install the wallet and plugin packages:
```bash
pip install -e src/wallets/evm
pip install -e src/plugins/crossmint-headless-checkout
```

4. Install the example dependencies:
```bash
cd examples/evm-purchase-on-amazon
pip install -r requirements.txt
```

5. Copy the `.env.template` and populate with your values:
```bash
cp .env.template .env
```
- `OPENAI_API_KEY`
- `WALLET_PRIVATE_KEY`
- `RPC_PROVIDER_URL`
- `CROSSMINT_API_KEY`

## Usage
1. Run the interactive CLI:
```bash
python main.py
```

2. Chat with the agent:
- Purchase <amazon-link>

## Implementation Details

This example uses:
- OpenAI Assistants API for agent functionality
- GOAT SDK for blockchain interaction
- Crossmint Headless Checkout plugin for purchasing items on Amazon with crypto
- EVM wallet for handling transactions on the Sepolia testnet

The main components are:
1. Wallet setup using EVMWalletClient
2. OpenAI Assistant configured with GOAT tools
3. Interactive CLI for user interaction
4. Tool execution handling to process purchases

## Using in production
In production, developers require advanced wallet setups that utilize [smart wallets](https://docs.goat-sdk.com/concepts/smart-wallets), which allow them to:
1. **Increase security** by setting programmable permissions (e.g. limiting fund amounts, restricting contract interactions, and defining required signatures)
2. **Maintain regulatory compliance** by ensuring agent wallets are non-custodial. This means that:
     - Launchpads, wallet providers, or agent platforms never have access to agents' wallets.
     - Agent platforms do not require money transmitter licenses.

### Agent Wallets
[Crossmint](https://docs.crossmint.com/wallets/quickstarts/agent-wallets) offers one of the most advanced solutions for agent developers and launchpads: [Agent Wallets](https://docs.crossmint.com/wallets/quickstarts/agent-wallets).

<footer>
<br/>
<br/>
<div>
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">

<div>
</footer> 