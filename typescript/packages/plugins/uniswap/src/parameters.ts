import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

enum SwapType {
    EXACT_IN = "EXACT_IN",
    EXACT_OUT = "EXACT_OUT",
}

enum Protocol {
    V2 = "V2",
    V3 = "V3",
}

enum Routing {
    CLASSIC = "CLASSIC",
}

export const QuoteSchema = z.object({
    chainId: z.number(),
    swapper: z.string(),
    input: z.any(),
    output: z.any(),
    slippage: z.any(),
    tradeType: z.nativeEnum(SwapType),
    route: z.any(),
    gasFee: z.string(),
    gasFeeUSD: z.string(),
    gasFeeQuote: z.string(),
    gasUseEstimate: z.string(),
    routeString: z.string(),
    blockNumber: z.string(),
    quoteId: z.string(),
    gasPrice: z.string(),
    maxFeePerGas: z.string(),
    maxPriorityFeePerGas: z.string(),
    txFailureReasons: z.array(z.string()),
    priceImpact: z.number(),
});

export const PermitDataSchema = z.object({
    domain: z.string(),
    types: z.record(z.string(), z.any()),
    primaryType: z.string(),
    message: z.record(z.string(), z.any()),
});

export const QuoteResponseSchema = z.object({
    routing: z.nativeEnum(Routing),
    permitData: PermitDataSchema.optional(),
    quote: QuoteSchema,
});

export const TransactionSchema = z.object({
    from: z.string(),
    to: z.string(),
    amount: z.string(),
    token: z.string(),
});

export const SwapResponseSchema = z.object({
    transaction: TransactionSchema,
    gasFee: z.string(),
});

export const TxHashSchema = z.string();

export class CheckApprovalBodySchema extends createToolParameters(
    z.object({
        token: z.string(),
        amount: z.string(),
        walletAddress: z.string(),
    }),
) {}

export class GetQuoteBodySchema extends createToolParameters(
    z.object({
        tokenIn: z.string(),
        tokenOut: z.string(),
        tokenInChainId: z.number(),
        tokenOutChainId: z.number(),
        amount: z.string(),
        swapper: z.string(),
        type: z.nativeEnum(SwapType),
        protocols: z.array(z.nativeEnum(Protocol)),
    }),
) {}

export class GetSwapBodySchema extends createToolParameters(
    z.object({
        quote: QuoteResponseSchema,
        permitData: z.any().optional(),
        signature: z.string().optional(),
        simulateTransaction: z.boolean().optional(),
    }),
) {}
