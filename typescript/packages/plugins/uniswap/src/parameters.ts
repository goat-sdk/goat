import { z } from "zod";

enum SwapType {
	EXACT_IN = "EXACT_IN",
	EXACT_OUT = "EXACT_OUT",
}

export const getQuoteBodySchema = z.object({
	tokenIn: z.string(),
	tokenOut: z.string(),
	amount: z.string(),
	tokenInChainId: z.number(),
	tokenOutChainId: z.number(),
	swapper: z.string(),
	type: z.nativeEnum(SwapType),
});
