/**
 * Hive services communicate via HTTP + x402 payment protocol — not direct
 * on-chain contract calls. This file is intentionally minimal; no ABI is
 * required for the plugin's operation.
 *
 * Treasury: 0x15184bf50b3d3f52b60434f8942b7d52f2eb436e (Base mainnet)
 * USDC:     0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913 (Base mainnet)
 */

export const HIVE_TREASURY = "0x15184bf50b3d3f52b60434f8942b7d52f2eb436e" as const;
export const HIVE_CHAIN_ID = 8453 as const;
export const HIVE_USDC    = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;
