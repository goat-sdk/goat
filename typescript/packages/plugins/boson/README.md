<div align="center">
<a href="https://github.com/goat-sdk/goat">
<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Boson Protocol GOAT Plugin

Enable AI agents to buy and sell physical goods using [Boson Protocol](https://www.bosonprotocol.io/) — a trust-minimized commerce protocol.

This package is a thin re-export of the goat-sdk plugin shipped by [`@bosonprotocol/agentic-commerce`](https://www.npmjs.com/package/@bosonprotocol/agentic-commerce). Tools cover the commerce lifecycle (offers, exchanges, disputes, sellers, funds, metadata, and agent registration) and route signing through the GOAT wallet abstraction — no private keys are passed to the MCP server.

## Installation

```bash
npm install @goat-sdk/plugin-boson
yarn add @goat-sdk/plugin-boson
pnpm add @goat-sdk/plugin-boson
```

## Requirements

- Node.js `>=20.12.2 <23`
- GOAT SDK `@goat-sdk/core` (workspace peer)
- An EVM wallet client (`@goat-sdk/wallet-viem` or equivalent)
- A network whose chain id is in `@bosonprotocol/common`'s `supportedChainIds` (Ethereum, Polygon, Base, Optimism, Arbitrum, plus the matching testnets)

## Configuration

```typescript
import { bosonProtocolPlugin } from "@goat-sdk/plugin-boson";

const plugin = bosonProtocolPlugin({
    // Required: Boson MCP server endpoint
    url: "https://mcp.bosonprotocol.io/mcp",
});
```

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `url` | `string` | Yes | Boson MCP server endpoint URL |

### Endpoints & live deployments

Pick the endpoint that matches the chain your wallet is on:

| Endpoint | URL | Chains |
|----------|-----|--------|
| Production | `https://mcp.bosonprotocol.io/mcp` | Ethereum mainnet (1), Optimism (10), Polygon (137), Arbitrum (42161), Base (8453) |
| Staging | `https://mcp-staging.bosonprotocol.io/mcp` | Polygon Amoy (80002), Base Sepolia (84532), Sepolia (11155111), Optimism Sepolia (11155420), Arbitrum Sepolia (421614) |

## Quick start

### Read-only (no wallet funding required)

```typescript
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygonAmoy } from "viem/chains";
import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { viem } from "@goat-sdk/wallet-viem";
import { bosonProtocolPlugin } from "@goat-sdk/plugin-boson";

const walletClient = createWalletClient({
    account: privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`),
    transport: http(),
    chain: polygonAmoy,
});

const tools = await getOnChainTools({
    wallet: viem(walletClient),
    plugins: [
        bosonProtocolPlugin({
            url: process.env.BOSON_MCP_URL as string,
        }),
    ],
});

// First call: discover available deployments
// tools["get_config_ids"].execute({})
// => ["staging-80002-0", "production-137-0"]

// Then query offers
// tools["get_offers"].execute({ configId: "staging-80002-0", first: 10 })
```

### Write operation (commit to an offer)

```typescript
const result = await tools["commit_to_offer"].execute({
    offerId: "42",
    buyer: account.address,
    signerAddress: account.address,
    configId: "staging-80002-0",
});
// result.success === true => result.message.hash is the on-chain transaction hash
```

## Write operations

Write tools call the Boson MCP server to obtain an unsigned transaction payload, then sign and broadcast using the GOAT wallet client. The MCP server never sees private keys.

Results are shaped:

```typescript
type WriteResult =
    | { success: true; message: { hash: string } }
    | { success: false; error: string };
```

Use a testnet first. Configure `configId: "staging-80002-0"` and fund a wallet on [Polygon Amoy](https://faucet.polygon.technology/) before moving to production.

## Tool reference

Call `get_config_ids` first on every session to discover valid `configId` values.

### Offers

| Tool | R/W | Description |
|------|-----|-------------|
| `get_offers` | R | Query available product offers |
| `get_all_products_with_not_voided_variants` | R | Query product catalogue (non-voided variants only) |
| `validate_metadata` | R | Validate offer metadata schema before creating an offer |
| `render_contractual_agreement` | R | Render a buyer-seller agreement from a template |
| `create_offer` | W | Create a new product offer |
| `create_offer_with_condition` | W | Create an offer with a token-gating condition |
| `void_offer` | W | Void an offer, preventing new commits |
| `void_non_listed_offer` | W | Void a non-listed offer |
| `void_non_listed_offer_batch` | W | Void multiple non-listed offers in one transaction |
| `sign_full_offer` | W | Sign a full offer |
| `create_offer_and_commit` | W | Create an offer and immediately commit to it |

### Exchanges

| Tool | R/W | Description |
|------|-----|-------------|
| `get_exchanges` | R | Query exchange records |
| `approve_exchange_token` | W | Approve ERC20 token spend before committing |
| `commit_to_offer` | W | Purchase an offer (issues a voucher) |
| `commit_to_buyer_offer` | W | Commit to a buyer-specific offer |
| `revoke_voucher` | W | Revoke a voucher (seller action — cannot fulfil) |
| `cancel_voucher` | W | Cancel a voucher (buyer action — no longer wants item) |
| `redeem_voucher` | W | Redeem a voucher to claim the item |
| `complete_exchange` | W | Complete an exchange, releasing funds |

### Disputes

| Tool | R/W | Description |
|------|-----|-------------|
| `get_disputes` | R | Query dispute records |
| `get_dispute_by_id` | R | Fetch a single dispute by ID |
| `get_dispute_resolvers` | R | List available dispute resolvers |
| `raise_dispute` | W | Raise a dispute on an exchange |
| `retract_dispute` | W | Retract a previously raised dispute |
| `escalate_dispute` | W | Escalate to the designated resolver |
| `resolve_dispute` | W | Resolve a dispute by mutual agreement |
| `create_dispute_resolution_proposal` | W | Propose a resolution for the counterparty to accept |
| `decide_dispute` | W | Decide a dispute (resolver action) |
| `refuse_escalated_dispute` | W | Refuse to handle an escalated dispute (resolver) |
| `expire_escalated_dispute` | W | Expire an unresolved escalated dispute |
| `extend_dispute_timeout` | W | Extend the dispute window (seller action) |
| `expire_dispute` | W | Expire a dispute that was not escalated in time |
| `expire_dispute_batch` | W | Expire multiple disputes in one transaction |

### Sellers

| Tool | R/W | Description |
|------|-----|-------------|
| `get_sellers` | R | Query seller records |
| `get_sellers_by_address` | R | Look up sellers by wallet address |
| `create_seller` | W | Register a new seller account |
| `update_seller` | W | Update an existing seller account |
| `create_buyer` | W | Register a buyer account |

### Funds

| Tool | R/W | Description |
|------|-----|-------------|
| `get_funds` | R | Query treasury fund balances |
| `get_supported_tokens` | R | List accepted payment tokens |
| `deposit_funds` | W | Deposit funds into a seller's escrow account |
| `withdraw_funds` | W | Withdraw available funds from escrow |

### Metadata storage

| Tool | R/W | Description |
|------|-----|-------------|
| `store_product_v1_metadata` | W | Store product V1 metadata |
| `store_bundle_metadata` | W | Store bundle metadata |
| `store_base_metadata` | W | Store base metadata |
| `store_bundle_item_product_v1_metadata` | W | Store bundle item product V1 metadata |
| `store_bundle_item_nft_metadata` | W | Store bundle item NFT metadata |

### Agent registration

| Tool | R/W | Description |
|------|-----|-------------|
| `get_registered_agents` | R | List registered AI agents |
| `register_agent` | W | Register an AI agent to earn facilitation fees |

### Protocol / config

| Tool | R/W | Description |
|------|-----|-------------|
| `get_config_ids` | R | List available deployments — call this first |
| `send_meta_transaction` | W | Submit a gasless meta-transaction |
| `send_native_meta_transaction` | W | Submit a native meta-transaction |
| `send_forwarded_meta_transaction` | W | Submit a forwarded meta-transaction |

EIP-712 signing is handled by the EVM wallet plugin (`sign_typed_data_evm` on `@goat-sdk/wallet-evm`), not by this plugin.

## Testing

```bash
pnpm --filter @goat-sdk/plugin-boson test
```

For end-to-end coverage against a real MCP server and chain, see the upstream [`@bosonprotocol/agentic-commerce`](https://www.npmjs.com/package/@bosonprotocol/agentic-commerce) repository.

## Security

- **Never use a production wallet for testing.** Use a dedicated testnet key.
- The MCP server returns unsigned transaction payloads. Private keys are handled exclusively by the GOAT wallet client on the caller's machine.

## Compatibility

| Dependency | Version |
|------------|---------|
| `@bosonprotocol/agentic-commerce` | `^1.2.4` |
| `@goat-sdk/core` | `workspace:*` |
| `@goat-sdk/wallet-evm` | `workspace:*` |
| `viem` | `2.23.4` |
| `zod` | `3.23.8` |

Supported chain ids come from `@bosonprotocol/common`'s `supportedChainIds`. As of the pinned version this includes Ethereum (1), Optimism (10), Polygon (137), Arbitrum (42161), Base (8453), and the corresponding testnets (Sepolia 11155111, Optimism Sepolia 11155420, Polygon Amoy 80002, Arbitrum Sepolia 421614, Base Sepolia 84532).

## Boson Protocol resources

| Resource | URL |
|----------|-----|
| Agent integration guide | [docs.bosonprotocol.io/using-the-protocol/agent-integration](https://docs.bosonprotocol.io/using-the-protocol/agent-integration) |
| dACP tool reference | [docs.bosonprotocol.io/using-the-protocol/dacp-tools](https://docs.bosonprotocol.io/using-the-protocol/dacp-tools) |
| Agent Builder (reference implementations) | [github.com/bosonprotocol/agent-builder](https://github.com/bosonprotocol/agent-builder) |
| Protocol documentation | [docs.bosonprotocol.io](https://docs.bosonprotocol.io) |

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
