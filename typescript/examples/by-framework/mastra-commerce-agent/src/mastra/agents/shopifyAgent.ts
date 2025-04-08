import "dotenv/config";

import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { tool } from "ai";
import { z } from "zod";

import { formatProductsForDisplay, searchGymsharkProducts as searchProducts } from "../../services/rye.service.js";

// Define the schema for product search parameters
const searchProductsSchema = z.object({
    query: z.string().describe("Search query for finding products on Gymshark"),
    limit: z.number().optional().describe("Maximum number of products to return"),
});

// Define the product search function
const searchGymsharkProducts = async (query: string, limit = 5) => {
    console.log(`Searching Gymshark for: ${query}`);

    try {
        const products = await searchProducts(query, limit);

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
        console.error("Error searching Gymshark products:", error);

        return {
            success: false,
            message: `Error searching products: ${error instanceof Error ? error.message : String(error)}`,
            formattedResults: "Failed to search for products. Please try again later.",
            products: [],
        };
    }
};

// Create the Gymshark customer service agent
export const shopifyAgent = new Agent({
    name: "Gymshark Customer Service Agent",
    instructions: `You are a helpful customer service agent for Gymshark (https://www.gymshark.com/), a fitness apparel and accessories brand.

Your primary tasks are:
1. Welcome users and ask what they're looking for today
2. Understand their fitness apparel needs (type of clothing, size, color preferences, etc.)
3. Use the searchGymsharkProducts tool to find relevant items from the Gymshark store
4. Make personalized recommendations based on their requirements
5. Answer questions about products, shipping, and returns
6. Assist with checkout if they want to make a purchase

Be friendly, knowledgeable about fitness apparel, and helpful. When recommending products, explain why you think they'd be a good fit based on the customer's needs.

Always remain focused on helping customers find the right Gymshark products for their fitness journey.`,
    model: openai("gpt-4o-mini"),
    tools: {
        searchGymsharkProducts: tool({
            description: "Search for products on the Gymshark store",
            parameters: searchProductsSchema,
            execute: async ({ query, limit = 5 }: z.infer<typeof searchProductsSchema>) => {
                return await searchGymsharkProducts(query, limit);
            },
        }),
    },
});
