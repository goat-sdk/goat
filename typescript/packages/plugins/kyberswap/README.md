# @goat-sdk/plugin-kyberswap

KyberSwap DEX Aggregator plugin for the [GOAT SDK](https://github.com/goat-sdk/goat).

Enables AI agents to swap tokens and add liquidity across 15+ EVM chains using KyberSwap's aggregator — which routes across 100+ liquidity sources to find the best rate.

## Supported chains

Ethereum, Arbitrum, Base, Polygon, BSC, Optimism, Avalanche, Linea, Mantle, Sonic, Berachain, Ronin, Unichain, HyperEVM, Monad.

## Tools

| Tool | Description |
|---|---|
| `kyberswap_get_quote` | Get swap quote — best rate, route, and gas estimate |
| `kyberswap_swap` | Execute a token swap |
| `kyberswap_zap_in` | Add liquidity to a CL pool in one transaction |

## Usage

```typescript
import { kyberswap } from "@goat-sdk/plugin-kyberswap";
import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";

const tools = await getOnChainTools({
  wallet: walletClient,
  plugins: [kyberswap()],
});
```

## ERC-20 approvals

KyberSwap's router address varies by chain. Before swapping an ERC-20 token:

1. Call `kyberswap_get_quote` — the response includes `routerAddress`
2. Approve `tokenIn` to `routerAddress` for at least `amountIn`
3. Call `kyberswap_swap`

For `kyberswap_zap_in`, approve `tokenIn` to the `approvalTarget` field in the zap route response.

## Environment variables (optional)

Override default public RPC endpoints per chain:

```
RPC_URL_ETHEREUM=https://...
RPC_URL_ARBITRUM=https://...
RPC_URL_BASE=https://...
```

## License

MIT
