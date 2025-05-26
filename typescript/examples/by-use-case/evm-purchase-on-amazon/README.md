
<div align="center">
<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</div>

# Purchase any item on Amazon using EVM
## 🚀 Quickstart

This example demonstrates how to use GOAT to **purchase any item on Amazon US** using EVM and Crossmint's headless checkout API. This example uses [Base](https://base.org) but you can implement it with any other EVM network by changing the chain and RPC URL.

You can use this example with any other agent framework, chain, and wallet of your choice.

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
cd examples/by-use-case/evm-purchase-on-amazon
```

4. Copy the `.env.template` and populate with your values:
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
pnpm ts-node index.ts
```

2. Chat with the agent:
- Purchase <amazon-link>

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

## Demo Results

| Feature | Prompt | Screenshot | Result |
|------|------------|----------------|-------------------|
| List available tools | "What tools you've access to?" | ![Available tools screenshot](https://private-user-images.githubusercontent.com/77531443/447552171-1a6c5b33-f494-4071-ac5d-5c04827e7a15.jpg?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDgyNjE1MzMsIm5iZiI6MTc0ODI2MTIzMywicGF0aCI6Ii83NzUzMTQ0My80NDc1NTIxNzEtMWE2YzViMzMtZjQ5NC00MDcxLWFjNWQtNWMwNDgyN2U3YTE1LmpwZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTA1MjYlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwNTI2VDEyMDcxM1omWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPWUzOTJjOTVkYTI0YzU3MWJmN2E1YjU0MjllZjgwNGU3YTUzYjZkODc5MTczNmZlZjAzZjllMmNlZTc0ZGRmYjcmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.io2jq9G6TNKb5JAdNlkEFrOTrvJftnU-pgoF5csWKLM) | Shows tools that are available to our AI SDK agent. |
| Buy Products from Amazon | Can you buy me https://www.amazon.com/dp/B07SPZ2HGT from Amazon? | ![Buy Products from Amazon screenshot](https://private-user-images.githubusercontent.com/77531443/447551387-36c0e9b8-31b3-414c-b96f-f3e7c606da32.jpg?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDgyNjE3OTUsIm5iZiI6MTc0ODI2MTQ5NSwicGF0aCI6Ii83NzUzMTQ0My80NDc1NTEzODctMzZjMGU5YjgtMzFiMy00MTRjLWI5NmYtZjNlN2M2MDZkYTMyLmpwZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTA1MjYlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwNTI2VDEyMTEzNVomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTQ2YzJhZjc3NmEyOTg4OWQyN2Y4MDJjYjg5ZDNjMzgxYmFiNDY2NTk4NDU5YWQ5MWFiNzVhMTUwN2EwOTNhYmUmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.Rz3aSy0q7TMFfrhQdHWLy91RLUbiv5KKhZ0_sd0jlZQ) | The agent will ask for additional information before it can proccess the order. |
| Order sucessfully processed by the agent. | Give it all the information requested: **(Note for name provide first and last name, Currency should be USDC, chain should be EVM, and method should be base-sepolia.)** | ![Order successfully processed screenshot](https://private-user-images.githubusercontent.com/77531443/447552497-30425219-a9b2-4e4d-a735-c5deb16e3274.jpg?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDgyNjIxMDQsIm5iZiI6MTc0ODI2MTgwNCwicGF0aCI6Ii83NzUzMTQ0My80NDc1NTI0OTctMzA0MjUyMTktYTliMi00ZTRkLWE3MzUtYzVkZWIxNmUzMjc0LmpwZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTA1MjYlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwNTI2VDEyMTY0NFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTAxYWMwMmVjY2U4Y2Q0YTVhZmU2YTUyYjA0ODQxNDZmMzQ4ZDIwMWI5NjU4ZGEyM2UwMGEwYmYzZDA1YzhhMmUmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.b2FHxXt7Ci-E7pvsO-0VNG6yRCoJ9anybiCYVOOcuzU) | Creates the order ID and displays order placed! |


<footer>
<br/>
<br/>
<div>
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">

<div>
</footer>
