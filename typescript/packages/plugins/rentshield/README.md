# GOAT Rent & Rug Shield Plugin (`@goat-sdk/plugin-rentshield`)

Read-only, non-custodial Solana safety and empty-ATA rent preview plugin for GOAT powered by [https://rentandrugshield.com](https://rentandrugshield.com).

## Tools

- `rentshield_check_token_rug`: Runs an 11-layer pre-buy rug and scam audit on any Solana token mint (`pubkey` only).
- `rentshield_scan_wallet_rent`: Previews reclaimable rent-exempt SOL locked in empty SPL and Token-2022 Associated Token Accounts (`0%` fee on first claim).

## Usage

```typescript
import { rentshield } from "@goat-sdk/plugin-rentshield";

const plugin = rentshield();
```
