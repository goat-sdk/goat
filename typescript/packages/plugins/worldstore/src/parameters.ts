import { z } from "zod";


export const searchProductsParametersSchema = z.object({
	query: z.string().describe("The search query to find products by"),
	limit: z.number().optional().default(3).describe("The number of products to return. Defaults to 3."),
});


export const buyProductParametersSchema = z.object({
	productId: z.string().describe("The ID of the product to buy"),
	quantity: z.number().describe("The quantity of the product to buy"),
});
