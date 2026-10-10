# SpendPreflight plugin for GOAT

Maintained by the operator of SpendPreflight. This plugin exposes two read-only screening tools before an agent pays a merchant:

| Tool | Screening fee | Result |
|---|---|---|
| `spendpreflight_check_payee` | $0.01 | OFAC SDN wallet/name screening and domain age/DNS signals |
| `spendpreflight_preflight_payment` | $0.02 | `allow`, `hold` or `block`, reasons and a receipt for an x402 challenge or cart |

The API takes USDC on Base over x402. Callers need no account or API key. The shared free trial is three calls per IP per UTC day. After the quota, a 402 requires an explicitly supplied x402-paying fetch; the plugin never automatically switches from trial to payment.

```ts
import { spendpreflight } from "@goat-sdk/plugin-spendpreflight";

// Add to your GOAT adapter's plugins array. Default mode uses the free trial.
const plugin = spendpreflight();

// For paid screening, inject the paying fetch you already configured with x402.
// const plugin = spendpreflight({ fetch: payingFetch, trial: false });
```

With a GOAT wallet already configured, `plugin.getTools(wallet)` returns both tools. The wallet is unused: no key is read, no wallet method is called, and the merchant payment under review is never signed or settled. An injected paying fetch may settle the separate screening fee only to `https://api.spendpreflight.com`.

Enforce the result in your actual payment path: pay only on `allow`; ask a human on `hold`; stop on `block` or a tool error. Adding tools to a model does not intercept the model's other wallet tools. HTTP errors, exhausted trial, malformed decisions and timeouts throw; no error becomes `allow`.

Inputs and raw responses are not logged by this plugin. See [privacy](https://api.spendpreflight.com/privacy), [terms](https://api.spendpreflight.com/terms), [status](https://api.spendpreflight.com/status) and [OpenAPI](https://api.spendpreflight.com/openapi.json). Screening is informational, not legal advice or a compliance certification.

Tests execute the real GOAT tool interface against mocked screening responses, verify input/response handling and prove wallet signing is unused. They make no real screening payments, merchant calls or LLM calls. Run from `typescript/`: `pnpm --filter @goat-sdk/plugin-spendpreflight test`, `typecheck`, and `build`.

This contribution is prepared for review; the package has not been published by GOAT.
