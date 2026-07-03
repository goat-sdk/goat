import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class GetPriceParameters extends createToolParameters(
  z.object({
    poolId: z
      .string()
      .describe(
        "Pool public key (base58). Example: EoLGqHKvtK9NcxjjnvSxTYYuFMYDeWTFFyKYj1DcJyPB"
      ),
  })
) {}

export class GetPoolInfoParameters extends createToolParameters(
  z.object({
    poolId: z
      .string()
      .describe(
        "Pool public key (base58). Example: EoLGqHKvtK9NcxjjnvSxTYYuFMYDeWTFFyKYj1DcJyPB"
      ),
  })
) {}

export class GetQuoteParameters extends createToolParameters(
  z.object({
    inputMint: z
      .string()
      .describe(
        "Input token mint address (base58). " +
          "CIPHER: Ciphern9cCXtms66s8Mm6wCFC27b2JProRQLYmiLMH3N, " +
          "USDC: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v, " +
          "SOL: So11111111111111111111111111111111111111112"
      ),
    outputMint: z.string().describe("Output token mint address (base58)."),
    amount: z
      .number()
      .positive()
      .describe(
        "Amount of input token in human-readable units (e.g. 1.5 for 1.5 USDC). " +
          "The plugin converts to on-chain decimals automatically."
      ),
  })
) {}

export class SwapParameters extends createToolParameters(
  z.object({
    poolId: z
      .string()
      .describe(
        "Pool public key (base58) to route through. " +
          "Use get_orbit_pool_info or get_orbit_quote to find the right pool first."
      ),
    inputMint: z.string().describe("Input token mint address (base58)."),
    outputMint: z.string().describe("Output token mint address (base58)."),
    amount: z
      .number()
      .positive()
      .describe("Amount of input token in human-readable units."),
    slippageBps: z
      .number()
      .int()
      .min(1)
      .max(5000)
      .default(100)
      .describe(
        "Maximum slippage in basis points (1 bps = 0.01%). Default: 100 (1%). Range: 1-5000."
      ),
  })
) {}

export class AddLiquidityParameters extends createToolParameters(
  z.object({
    poolId: z.string().describe("Pool public key (base58) to add liquidity to."),
    amountX: z
      .number()
      .min(0)
      .describe(
        "Amount of token X (base token) in human-readable units. Use 0 to deposit only token Y."
      ),
    amountY: z
      .number()
      .min(0)
      .describe(
        "Amount of token Y (quote token) in human-readable units. Use 0 to deposit only token X."
      ),
    lowerBinId: z
      .number()
      .int()
      .describe(
        "Lower bin ID for the position range. Negative numbers are valid (bins below active price)."
      ),
    upperBinId: z
      .number()
      .int()
      .describe("Upper bin ID for the position range. Must be >= lowerBinId. Max range: 64 bins."),
    strategy: z
      .enum(["uniform", "balanced", "concentrated", "skew_bid", "skew_ask", "bid_ask"])
      .default("uniform")
      .describe(
        "Liquidity distribution strategy: uniform=equal across bins, " +
          "concentrated=bell curve, bid_ask=edges, skew_bid/skew_ask=asymmetric. Default: uniform."
      ),
  })
) {}

export class RemoveLiquidityParameters extends createToolParameters(
  z.object({
    poolId: z.string().describe("Pool public key (base58) that the position belongs to."),
    positionId: z
      .string()
      .describe(
        "Position public key (base58) to close and withdraw liquidity from."
      ),
    bpsToRemove: z
      .number()
      .int()
      .min(1)
      .max(10000)
      .default(10000)
      .describe(
        "Fraction of liquidity to remove in basis points. 10000 = 100% (full withdrawal). Default: 10000."
      ),
  })
) {}
