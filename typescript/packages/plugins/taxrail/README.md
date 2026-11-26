# @goat-sdk/plugin-taxrail

Pre-execution crypto & DeFi tax optimization plugin for GOAT AI agents across **US** (IRS 1099-DA, Form 8949, SpecID/HIFO, Tax-Loss Harvesting, Aave v3 borrow-vs-sell) and **Brazil** (Lei 14.754, R$35k rule, Lucro Real).

## Installation

```bash
npm install @goat-sdk/plugin-taxrail
```

## Usage

```typescript
import { taxrail } from "@goat-sdk/plugin-taxrail";

const plugins = [
    taxrail({
        referrerWallet: "0xYourIntegratorBaseWallet", // Optional: earn 20% affiliate revshare
    }),
];
```
