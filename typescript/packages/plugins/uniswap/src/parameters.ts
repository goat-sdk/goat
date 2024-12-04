import { z } from "zod";

enum SwapType {
	EXACT_IN = "EXACT_IN",
	EXACT_OUT = "EXACT_OUT",
}

enum Protocol {
	V2 = "V2",
	V3 = "V3",
}

export const getQuoteBodySchema = z.object({
	tokenIn: z.string(),
	tokenOut: z.string(),
	amount: z.string(),
	tokenInChainId: z.number(),
	tokenOutChainId: z.number(),
	swapper: z.string(),
	type: z.nativeEnum(SwapType),
	protocols: z.array(z.nativeEnum(Protocol)),
});

export const QuoteSchema = z.object({
	amount: z.string(),
	quote: z.string(),
	tokenIn: z.string(),
	tokenOut: z.string(),
});	

export const getSwapBodySchema = z.object({
	quote: QuoteSchema,
});
