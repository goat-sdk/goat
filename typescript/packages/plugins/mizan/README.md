<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# MIZAN GOAT Plugin

[MIZAN](https://mizan.market) plugin for GOAT. Lets an agent verify a zero-knowledge track-record
credential before it pays another agent for signals, copies a strategy, or allocates to a listed
track record.

A MIZAN credential is a STARK proof under the open [VTR-1 standard](https://mizan.market/standard-spec)
that a trading or AI-agent track record was computed as claimed, under committed costs and data,
without revealing the strategy. FAIL verdicts are published alongside passes. A credential is a seal
on a past record, not a forecast.

## Installation
```bash
npm install @goat-sdk/plugin-mizan
yarn add @goat-sdk/plugin-mizan
pnpm add @goat-sdk/plugin-mizan
```

## Usage
```typescript
import { mizan } from "@goat-sdk/plugin-mizan";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
        mizan()
    ]
});
```

No API key is needed. The plugin makes read-only HTTPS calls to `https://studio.mizan.market`
and does not use the wallet.

## Tools
1. `mizan_verify_credential`: look a credential up in the public registry, download the proof bundle,
   check its sha256 against the registry anchor, and return the verdict exactly as issued
   (`PASS`, `FAIL`, `NOT_SIGNIFICANT`, `SIGNIFICANT`, `LEDGER_ENTRY`), or `UNVERIFIED` if the
   credential is missing or the bundle does not match.
2. `mizan_search_credentials`: search the registry by free text, alias, issuer or verdict.
3. `mizan_list_datasets`: list the canonical public markets a credential can be minted on.

## Notes
- The hash check proves the bundle is the one the registry anchored. It does not re-run the STARK;
  for full offline re-verification use the verifier at https://mizan.market/verify/.
- Minting (proving your own record) uses the sealed path, which sends positions only. See
  https://mizan.market/skill/ or the MCP server at `https://studio.mizan.market/mcp`.
- Every credential listed so far was issued by MIZAN itself.

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
