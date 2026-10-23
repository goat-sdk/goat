<div>
<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</div>

# SwapChan GOAT Plugin

Best-price same-chain and cross-chain swaps through [SwapChan](https://swapchan.com). SwapChan compares Jupiter, 0x, CoW, LI.FI, Relay, KyberSwap, Velora, Across, deBridge and THORChain, and ranks routes by net output after gas and fees. It uses the public API at `https://api.swapchan.com` and needs no API key.

## Installation
```bash
npm install @goat-sdk/plugin-swapchan
yarn add @goat-sdk/plugin-swapchan
pnpm add @goat-sdk/plugin-swapchan
```

## Usage
```typescript
import { swapchan } from "@goat-sdk/plugin-swapchan";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
        swapchan({
            partnerId: process.env.SWAPCHAN_PARTNER_ID, // optional: earns you 5 bp, see https://swapchan.com/partners
        }),
    ],
});
```

## Tools
* `swapchan_get_quote`: ranked routes for a swap or bridge from the wallet's chain to any supported chain.
* `swapchan_swap`: executes the best plain-transaction route from the connected EVM wallet. It sends the approval first if needed.

Source chains: Ethereum, Optimism, BNB Chain, Polygon, Base, Arbitrum, Avalanche, Linea, Scroll. Destinations also include Solana (`792703809`), Bitcoin (`8253038`) and Tron (`728126428`), which need `toAddress`.

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/4821833e-52e5-4126-a2a1-59e9fa9bebd7" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
