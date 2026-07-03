# Orbit Finance GOAT Plugin

Interact with [Orbit Finance](https://cipherlabsx.com) DLMM pools on Solana from any AI agent.

## Installation

```bash
npm install @goat-sdk/plugin-orbit
# Write tools (swap / liquidity) also require:
npm install orbit-dlmm
```

## Usage

```typescript
import { orbit } from "@goat-sdk/plugin-orbit";
import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { solana } from "@goat-sdk/wallet-solana";
import { Connection, Keypair } from "@solana/web3.js";

const tools = await getOnChainTools({
    wallet: solana({
        connection: new Connection("https://rpc.helius.xyz/?api-key=YOUR_KEY"),
        keypair: Keypair.fromSecretKey(yourPrivateKey),
    }),
    plugins: [orbit({ rpcUrl: "https://rpc.helius.xyz/?api-key=YOUR_KEY" })],
});
```

## Tools

| Tool | Type | Description |
|------|------|-------------|
| `get_orbit_price` | read | USD price + active bin ID for a pool |
| `get_orbit_pool_info` | read | TVL, 24h volume, reserves, fee tier, bin step |
| `get_orbit_quote` | read | Swap quote: expected output, price impact, min at 1% slippage |
| `orbit_swap` | write | Execute a swap through a DLMM pool |
| `orbit_add_liquidity` | write | Open a liquidity position across a bin range (up to 64 bins) |
| `orbit_remove_liquidity` | write | Withdraw liquidity from an existing position |

Read tools call the Orbit REST API with no on-chain dependency.
Write tools dynamically import `orbit-dlmm` at runtime; if not installed they throw a clear error.

## Constants

| Item | Value |
|------|-------|
| Program ID | `Fn3fA3fjsmpULNL7E9U79jKTe1KHxPtQeWdURCbJXCnM` |
| API base | `https://orbit-dex.api.cipherlabsx.com/api/v1` |
| CIPHER mint | `Ciphern9cCXtms66s8Mm6wCFC27b2JProRQLYmiLMH3N` |
| CIPHER/USDC pool | `EoLGqHKvtK9NcxjjnvSxTYYuFMYDeWTFFyKYj1DcJyPB` |
