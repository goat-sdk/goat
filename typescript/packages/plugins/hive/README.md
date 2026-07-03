<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Hive GOAT Plugin

Give any GOAT-powered agent access to 50 x402-wired Hive Civilization services on Base mainnet — AI evaluation, data research, DeFi analytics, compliance oracles, and infrastructure endpoints, all paid automatically in USDC via the x402 protocol.

No API keys. No OAuth. The agent pays per call.

## Requirements

- An EVM wallet connected to GOAT with USDC on Base mainnet
- `@goat-sdk/wallet-viem` or any `EVMWalletClient`-compatible wallet

Treasury: `0x15184bf50b3d3f52b60434f8942b7d52f2eb436e` (Base mainnet, chainId 8453)  
Payment token: USDC — `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

## Installation

```bash
npm install @goat-sdk/plugin-hive
yarn add @goat-sdk/plugin-hive
pnpm add @goat-sdk/plugin-hive
```

## Setup

```typescript
import { hive } from "@goat-sdk/plugin-hive";
import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { viem } from "@goat-sdk/wallet-viem";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

const walletClient = createWalletClient({
    account: privateKeyToAccount(`0x${process.env.AGENT_PRIVATE_KEY}`),
    chain: base,
    transport: http(),
});

const tools = await getOnChainTools({
    wallet: viem(walletClient),
    plugins: [hive()],
});
```

## Tools

### `get_hive_catalog`
Returns the full 50-service catalog. **Free** — no payment required. Use at agent startup for capability discovery.

```typescript
// Returns:
{
  services: [{ name, url, chainId, treasury, paymentToken }, ...],
  totalCount: 50,
  treasury: "0x15184bf50b3d3f52b60434f8942b7d52f2eb436e",
  chainId: 8453,
  paymentToken: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  protocol: "x402",
  network: "Base mainnet"
}
```

### `call_hive_service`
Generic paid wrapper. Provide a `serviceName` (from the catalog), a `tool` endpoint, and optional `args`.

```typescript
// Parameters:
{
  serviceName: "evaluator",   // from get_hive_catalog
  tool: "submit_job",
  args: { text: "analyze this content" }
}
```

### `hive_evaluator_submit_job`
Concrete example — submits text to Hive's AI Evaluator. Costs ~$0.01 USDC on Base, deducted automatically.

```typescript
// Parameters:
{
  text: "Is this response accurate and helpful?",
  criteria: ["accuracy", "coherence", "helpfulness"],  // optional
  rubric: "Score 1-5 on each criterion"                // optional
}
```

## Service Categories

| Category | Services |
|---|---|
| AI / Evaluation | evaluator, summarizer, classifier, sentiment, extractor, translator, transcriber, embeddings, reranker, router |
| Data / Research | search, news, research, scraper, crawler, parser, enricher, validator, aggregator, monitor |
| Finance / Crypto | priceOracle, portfolioAnalyzer, riskScorer, yieldOptimizer, defiRouter, nftAnalyzer, walletProfiler, contractAuditor, gasEstimator, bridgeRouter |
| Business | documentDrafter, codeReviewer, meetingNotes, taskPlanner, proposalWriter, emailDrafter, reportGenerator, dataVisualizer, chartBuilder, presentationMaker |
| Identity / Compliance | kycOracle, amlChecker, reputationScorer, identityVerifier, complianceAuditor |
| Infrastructure | ipfsGateway, webhookRelay, cacheLayer, rateLimiter, loadBalancer |

## How x402 Payments Work

1. Agent calls a Hive service URL
2. Server responds with HTTP 402 + payment requirements (amount, USDC address, treasury)
3. Plugin automatically signs and submits USDC authorization on Base mainnet
4. Server verifies on-chain, returns the response
5. Agent receives data — all in one round-trip from the agent's perspective

Powered by the open [x402 protocol](https://github.com/coinbase/x402). NOT affiliated with Coinbase.

## Source

- Plugin: `github.com/goat-sdk/goat/typescript/packages/plugins/hive`
- Helpers package: `github.com/srotzin/hive-x402-helpers`
- Hive Civilization: `github.com/srotzin`

Steve Rotzin, Hive  
steve@thehiveryiq.com
