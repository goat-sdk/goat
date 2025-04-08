import { z } from "zod";
import { formatProductsForDisplay, searchGymsharkProducts } from "../services/rye.service.js";

const searchProductsParameters = z.object({
    query: z.string().describe("Search query for finding products on Gymshark"),
    limit: z.number().optional().describe("Maximum number of products to return"),
});

export const searchProductsTool = {
    name: "searchGymsharkProducts",
    description: "Search for products on the Gymshark store",
    parameters: searchProductsParameters,
    execute: async ({ query, limit = 5 }: z.infer<typeof searchProductsParameters>) => {
        console.log(`Searching Gymshark for: ${query}`);

        try {
            const products = await searchGymsharkProducts(query, limit);

            return {
                success: true,
                message: `Found ${products.length} products matching "${query}"`,
                formattedResults: formatProductsForDisplay(products),
                products: products.map((product) => ({
                    id: product.id,
                    title: product.title,
                    price: `${product.price.currency} ${product.price.value}`,
                    description: product.description,
                    imageUrl: product.images && product.images.length > 0 ? product.images[0].url : null,
                    url: product.url,
                })),
            };
        } catch (error) {
            return {
                success: false,
                message: `Error searching products: ${error instanceof Error ? error.message : String(error)}`,
                formattedResults: "Failed to search for products. Please try again later.",
                products: [],
            };
        }
    },
};
