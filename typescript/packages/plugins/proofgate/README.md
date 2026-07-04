<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# ProofGate GOAT Plugin

Transaction guardrails for AI agents. Validate and block unsafe DeFi transactions before they execute. Protect against infinite approvals, contract exploits, and policy violations with on-chain cryptographic proofs.

## Features

- **19 EVM Chains** - Ethereum, Base, Arbitrum, Optimism, Polygon, and more
- **Auto-blocking** - Optionally block unsafe transactions automatically
- **On-chain Proofs** - Every validation recorded on Base mainnet
- **Custom Guardrails** - Define your own validation policies
- **DeFi-Focused** - Built specifically for AI agent DeFi operations

## Requirements

- ProofGate API key (get one at [proofgate.xyz/dashboard](https://www.proofgate.xyz/dashboard))

## Installation

```bash
npm install @goat-sdk/plugin-proofgate
yarn add @goat-sdk/plugin-proofgate
pnpm add @goat-sdk/plugin-proofgate
```

## Basic Setup

```typescript
import { proofgate } from "@goat-sdk/plugin-proofgate";

const tools = await getOnChainTools({
    wallet: viem(walletClient),
    plugins: [
        proofgate({
            apiKey: process.env.PROOFGATE_API_KEY,
            autoBlock: true, // Block unsafe transactions (default)
        }),
    ],
});
```

## With Other DeFi Plugins

```typescript
import { proofgate } from "@goat-sdk/plugin-proofgate";
import { uniswap } from "@goat-sdk/plugin-uniswap";
import { erc20 } from "@goat-sdk/plugin-erc20";

const tools = await getOnChainTools({
    wallet: viem(walletClient),
    plugins: [
        proofgate({ apiKey: process.env.PROOFGATE_API_KEY }),
        uniswap({ ... }),
        erc20(),
    ],
});

// Now all DeFi transactions are validated before execution
```

## Tools

### 1. Validate Transaction
Detailed validation with full response including checks, severity, and evidence.

```typescript
// Tool: proofgate_validate_transaction
const result = await tools.proofgate_validate_transaction({
    chainId: 8453, // Base
    from: "0x...",
    to: "0x...",
    data: "0x...",
    value: "0",
});
// Returns: { safe, result, reason, validationId, checks, evidenceUri }
```

### 2. Quick Safety Check
Simple boolean check for pass/fail decisions.

```typescript
// Tool: proofgate_is_safe
const { safe, reason } = await tools.proofgate_is_safe({
    chainId: 8453,
    from: "0x...",
    to: "0x...",
    data: "0x...",
    value: "0",
});
// Returns: { safe: boolean, reason: string }
```

### 3. Get Evidence
Retrieve on-chain proof for a previous validation.

```typescript
// Tool: proofgate_get_evidence
const evidence = await tools.proofgate_get_evidence({
    validationId: "val_xxx_xxx",
});
```

## Supported Chains

| Chain | ID | Type |
|-------|------|------|
| Ethereum | 1 | Mainnet |
| Base | 8453 | Mainnet |
| Arbitrum | 42161 | Mainnet |
| Optimism | 10 | Mainnet |
| Polygon | 137 | Mainnet |
| BNB Chain | 56 | Mainnet |
| Avalanche | 43114 | Mainnet |
| zkSync Era | 324 | Mainnet |
| Linea | 59144 | Mainnet |
| Scroll | 534352 | Mainnet |
| Fantom | 250 | Mainnet |
| Gnosis | 100 | Mainnet |
| Celo | 42220 | Mainnet |
| Mantle | 5000 | Mainnet |
| Polygon zkEVM | 1101 | Mainnet |
| Base Sepolia | 84532 | Testnet |
| Sepolia | 11155111 | Testnet |
| Polygon Amoy | 80002 | Testnet |
| BSC Testnet | 97 | Testnet |

## What Gets Validated

- **Infinite Approvals** - Blocked by default (dangerous pattern)
- **Contract Whitelists** - Only interact with trusted protocols
- **Value Limits** - Max transaction amounts per tx or daily
- **Balance Checks** - Ensure sufficient funds before tx
- **Custom Policies** - Define your own guardrail rules

## Links

- **Website:** [proofgate.xyz](https://www.proofgate.xyz)
- **Documentation:** [proofgate.xyz/docs](https://www.proofgate.xyz/docs)
- **Dashboard:** [proofgate.xyz/dashboard](https://www.proofgate.xyz/dashboard)
- **Guardrails:** [proofgate.xyz/guardrails](https://www.proofgate.xyz/guardrails)

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
