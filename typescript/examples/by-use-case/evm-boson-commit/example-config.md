# Environment configuration

Copy the variables below into a `.env` file in this directory. Never commit `.env` to version control.

```bash
# =============================================================================
# Required — read-only usage
# =============================================================================

# Boson MCP server endpoint
# Staging (testnets — Polygon Amoy, Base Sepolia, Sepolia, OP Sepolia, Arbitrum Sepolia):
BOSON_MCP_URL=https://mcp-staging.bosonprotocol.io/mcp
# Production (mainnets — Ethereum, Optimism, Base):
# BOSON_MCP_URL=https://mcp.bosonprotocol.io/mcp

# AI model key
ANTHROPIC_API_KEY=sk-ant-...

# =============================================================================
# Required — write operations (commit, redeem, dispute, etc.)
# =============================================================================

# EVM wallet private key — TESTNET ONLY. Never use a production key.
# Generate a fresh key:
#   node -e "const {generatePrivateKey}=require('viem/accounts'); console.log(generatePrivateKey())"
# Fund it at: https://faucet.polygon.technology (select Amoy network)
WALLET_PRIVATE_KEY=0x...

# =============================================================================
# Optional overrides
# =============================================================================

# MCP request timeout in milliseconds (default: 30000)
# BOSON_TIMEOUT_MS=30000

# Default configId (discovered automatically via boson_get_config_ids if not set)
# Testnet:  testing-80002-0
# Mainnet:  production-137-0
# BOSON_CONFIG_ID=testing-80002-0
```

## Read-only vs write

The example supports both read-only and write modes depending on which env vars are set.

| Mode | Required vars |
|------|--------------|
| Read-only (browse offers, exchanges, disputes) | `BOSON_MCP_URL`, `ANTHROPIC_API_KEY` |
| Write (commit, redeem, raise dispute, etc.) | + `WALLET_PRIVATE_KEY` |

For write operations, the wallet must have:
- Testnet MATIC for gas (obtainable free from the Amoy faucet)
- The payment token required by the offer (check `boson_get_supported_tokens`)
