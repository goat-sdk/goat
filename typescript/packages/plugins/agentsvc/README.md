<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# agentsvc GOAT Plugin

Safety checks for trading and social agents from [agentsvc.io](https://agentsvc.io), paid per call in USDC over [x402](https://x402.org) from the agent's own wallet. No API key, no account.

| Tool | What it does | Price |
|---|---|---|
| `agentsvc_token_precheck` | ALLOW, CAUTION or BLOCK for 1 to 5 tokens right before a swap, cached 10 minutes | 0.004 USDC |
| `agentsvc_token_verdict` | Grade A to F with reasons and key facts for one token | 0.009 USDC |
| `agentsvc_scam_message_check` | Scam and phishing check for a message, every link checked | 0.003 USDC |
| `agentsvc_prompt_injection_check` | Prompt injection check for untrusted text | 0.004 USDC |

Token checks cover Base, Ethereum, BSC, Arbitrum, Polygon, Avalanche, Optimism and Solana tokens and come from on-chain data: a real buy and sell simulation (honeypot, taxes), owner powers (mint, pause, blacklist, proxy), liquidity and token age. The wallet pays on Base, Polygon or Arbitrum. A failed call is not charged.

## Installation
```bash
npm install @goat-sdk/plugin-agentsvc
yarn add @goat-sdk/plugin-agentsvc
pnpm add @goat-sdk/plugin-agentsvc
```

## Usage
```typescript
import { agentsvc } from "@goat-sdk/plugin-agentsvc";

const tools = await getOnChainTools({
    wallet: viem(walletClient), // a wallet on Base, Polygon or Arbitrum holding a little USDC
    plugins: [
        agentsvc({ maxPaymentUsdc: 0.05 }), // optional limit per call
    ],
});
```

## Tools
1. Token pre-trade check
2. Token verdict
3. Scam message check
4. Prompt injection check

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/4821833e-52e5-4126-a2a1-59e9fa9bebd7" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
