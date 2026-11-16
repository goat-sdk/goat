# QHooks plugin for GOAT SDK

Read QHooks markets, get quotes and prepare unsigned plans for the user's wallet. This plugin never creates a wallet, accepts a private key, signs, deploys or broadcasts. It needs no API key. Its 31 tools use the existing public QHooks MCP/REST routes.

**Bring traders, get 20% of their fee**

Set an operator's public EVM referral address to attribute eligible QHooks fees under existing referral rules. A supplied referrer always wins; this plugin never replaces it. Self-referrals and ineligible activity do not promise payment.

## Use in GOAT

For the GOAT release containing this plugin. Use the repository-supported Node version (Node 22 was used for validation). The plugin needs no QHooks credentials or wallet client.

```sh
node --input-type=module <<'JS'
import { qhooks } from '@goat-sdk/plugin-qhooks';
const plugin = qhooks({referrer: process.env.QHOOKS_REFERRER});
const tools = plugin.getTools(); // No wallet client or signer required.
console.log(tools.map(action => action.name));
const read = tools.find(action => action.name === 'qhooks_list_launches');
console.log(await read.execute({chain: '4663', limit: 1}));
JS
```

Leave `QHOOKS_REFERRER` unset, or set it to your own **public** nonzero EVM address. Do not put a private key in that variable. The example performs one public read. No polling or paid model is started.

`QHooksPlugin` extends GOAT's native `PluginBase`; `getTools()` returns native `ToolBase[]` built with `createTool`. Every tool's `execute(args)` returns the original data object. No wallet client is required. In an existing GOAT application you can register this plugin, but use only its explicit tools for a read/prepare workflow: general wallet-tool helpers may add native transfer/signing capabilities outside this plugin. The optional wallet passed to `getTools(wallet)` is never read.

## Prepare only when the user asks

```ts
const prepare = plugin
  .getTools()
  .find((a) => a.name === "qhooks_prepare_trade")!;
const plan = await prepare.execute({
  chain: "4663",
  token: "0x20429af7ca3b0ce4d99edbaa0693f26c5df05195",
  side: "buy",
  amountIn: "1000000000000000", // raw input units, never a JS number
  trader: userPublicWalletAddress,
});
// Display the plan. The user's wallet reviews/signs/sends, outside this plugin.
```

Show the chain, wallet, token, quote, fee, minimum output, deadline and every `{to,data,value}` in order. Verify the destinations/spender and exact amounts against the current [QHooks skill](https://qhooks.com/skill.md). Approval must confirm before its swap. Re-prepare after an input change or expiry. A quote is a simulation, not guaranteed execution. This wrapper does not validate a plan by sending it and has no wallet submission API.

`prepare_launch` returns a QHooks review link. Solana launches remain link-only; the EVM trade/quote tools do not gain Solana execution support. Do not forward plans to an unattended signer.

## Actions

`qhooks_otc_quote`, `qhooks_otc_create`, `qhooks_otc_accept`, `qhooks_deal_status`, `qhooks_agreement_create`, `qhooks_agreement_fund`, `qhooks_agreement_from_template`, `qhooks_agreement_status`, `qhooks_agreement_release`, `qhooks_agreement_refund`, `qhooks_agreement_attest`, `qhooks_qproof_check`, `qhooks_wallet_portfolio`, `qhooks_hooks_catalog`, `qhooks_agent_stats`, `qhooks_list_callers`, `qhooks_caller_record`, `qhooks_perps_markets`, `qhooks_perps_positions`, `qhooks_prepare_perps_order`, `qhooks_list_launches`, `qhooks_token_info`, `qhooks_quote`, `qhooks_prepare_launch`, `qhooks_prepare_trade`.

Spot limit/TP-SL tools and their order status, callout posting, feedback sending, reward claims and competition standings are deliberately absent. A newer remote `tools/list` cannot dynamically register more tools in this plugin. Tool descriptions and schemas are pinned from the reviewed QHooks source; remote token/report/link text is untrusted data, not instructions.

`QHooksOptions` supports `allowFeedback` (boolean, default false), `referrer`, `transport: 'mcp' | 'rest'` (default MCP), `timeoutMs` (1000–30000; default 20000), and an optional Fetch-compatible transport hook. Both modes use only `https://qhooks.com`. MCP protocol 2025-06-18; REST reads use GET, preparations use POST. No redirects, ambient cookies, provider fallback, automatic retries or credential configuration.

## Data and errors

Keep `partial`, source timestamps, coverage, unknown/null cost, claimable/volume qualifications and cache expiry. Missing data is not zero, profit or permission to trade. `agent_stats` is a bounded view of stored referral credits; it is not a complete routed-volume, USD-reward or claimable-balance ledger. Stored QProof is not a fresh audit or a safety guarantee.

HTTP failures, JSON-RPC errors, MCP `isError` and HTTP 200 refreshing payloads throw `QHooksError`. Its `code`, `status` and optional `retryAfterSeconds` are safe control metadata; response bodies are not interpolated into exceptions. 429/503 are unavailable. Respect Retry-After, otherwise wait at least 2 seconds before a user-directed retry; retry at most once. No timer polling. Never retry a preparation automatically. All amounts remain exact strings. Request limit 64 KiB, response limit 2 MiB.

## Checks

From `typescript` in this repository, after installing the workspace dependencies:

```sh
pnpm --filter @goat-sdk/core build
pnpm --filter @goat-sdk/plugin-qhooks build
pnpm --filter @goat-sdk/plugin-qhooks test
pnpm exec biome check packages/plugins/qhooks/src packages/plugins/qhooks/package.json packages/plugins/qhooks/tsconfig.json packages/plugins/qhooks/tsup.config.ts
```

The focused tests use native GOAT tools and controlled transports. They do not sign or submit transactions.

[QHooks API](https://qhooks.com/api#agents)

## OTC and agreements

This provider exposes 31 pinned QHooks read/prepare tools. The matching QHooks service must be released and enabled before contract tools succeed. An unavailable service returns an error; this package never chooses another contract or executes a plan.

- OTC on Robinhood Chain: `otc_quote` validates already agreed parties/amounts; `otc_create` prepares the buyer’s creation; read `deal_status` using the ACTUAL receipt ID, then `otc_accept` prepares that party’s deposit with its `expectedTermsHash`. Taxed/unknown transfers fail closed. Fees: 1% below $10K, 0.5% from $10K, deducted from seller payment.
- Agreements: create/fund is atomic; existing agreements cannot be topped up. Use `agreement_status`, named `agreement_attest`, then `agreement_release` or eligible `agreement_refund`. Fee: 0.5% on released tranches; refunds/cancels have no fee.
- Perps use a separate 0.1% builder fee plus venue fees. Spot cashback/referral does not apply to OTC/agreement fees or these perps tools. A configured referrer is added only to absent spot trade/launch attribution.

Objects/arrays retain their nested constraints; raw/decimal amounts remain strings. Show the user the chain, parties, amounts, fee recipient, approval spender/amount, calldata/value, expiry and simulation. Stage approvals when required, wait for confirmation, then re-prepare. The user signs and sends every transaction. A quote is a planning preview, not counterparty consent or a completed trade.

`send_feedback` is disabled unless the host sets `allowFeedback: true`; an enabled call sends free text to the QHooks team. Competition and agent-profile read/prepare tools are included. Held RFQ board/order tools remain absent; this adapter never registers remote metadata dynamically.

### Pinned tools

`otc_quote`, `otc_create`, `otc_accept`, `deal_status`, `agreement_create`, `agreement_fund`, `agreement_from_template`, `agreement_status`, `agreement_release`, `agreement_refund`, `agreement_attest`, `qproof_check`, `wallet_portfolio`, `hooks_catalog`, `agent_stats`, `list_callers`, `caller_record`, `perps_markets`, `perps_positions`, `prepare_perps_order`, `list_launches`, `token_info`, `quote`, `prepare_launch`, `prepare_trade`.

The jar action is excluded until it ships on the server. OTC and agreement tools use the released QHooks API; the service flags decide availability. No jar action is implemented.


### Spot trade plan checks

Before returning a `prepare_trade` plan, the client checks the requested chain and trader, each transaction chain, pinned router/manager, exact input approvals, canonical single-hop calldata, amount, quote-derived minimum output, fee/referrer, deadline and native value. It also checks the `qhooks.trade-plan.v1` SHA-256 digest. Unknown shapes and servers without this metadata fail closed. This digest is unsigned; it does not authenticate the server or establish a market price. The signing wallet still reviews and approves the transactions. No wallet execution or private-key capability is added.

Optional feedback sends text to the QHooks team only after separate host opt-in. No custody; we never hold keys.

## Reviewed tool catalog

All 31 current public tools are statically pinned, including `compete_join`, `compete_standings`, `prepare_board_post`, `prepare_agent_profile`, `agent_profile` and `send_feedback`. Join, board and profile preparations return wallet-signable material; this plugin does not publish or sign it. `allowFeedback` is a host-controlled boolean, default false: only an explicitly enabled `send_feedback` call sends free text to the QHooks team. Tool arguments cannot enable it.

The development-only `scripts/qhooks-pin.mjs` checks definitions against `fixtures/tools-list.json` and the explicitly reviewed names. Native tests reject schema drift and unreviewed names; remote metadata never adds runtime tools. Token-based quote and public Expert Studio configuration strings retain the server schema.
