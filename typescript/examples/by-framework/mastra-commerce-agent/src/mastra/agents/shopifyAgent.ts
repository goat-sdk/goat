import "dotenv/config";

import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { tool } from "ai";
import { z } from "zod";

import { CheckoutProduct, createShopifyCheckout, initializeCheckout } from "../../services/checkout.service.js";
import { type Product, formatProductsForDisplay, searchGymsharkProducts } from "../../services/rye.service.js";

// Initialize the checkout service when the module loads
initializeCheckout().catch((error) => {
    console.error("Failed to initialize checkout service:", error);
});

// Define the schema for product search parameters
const searchProductsSchema = z.object({
    query: z.string().describe("Search query for finding products on Gymshark"),
    limit: z.number().optional().describe("Maximum number of products to return"),
});

// Define the schema for checkout parameters
const checkoutProductSchema = z.object({
    productId: z.string().describe("ID of the product to checkout"),
    productTitle: z.string().describe("Title of the product"),
    productPrice: z.string().describe("Price of the product"),
    productUrl: z.string().describe("URL of the product"),
    productVariantId: z.string().optional().describe("Variant ID of the product for Shopify checkout"),
});

// Define the product search function
const searchGymsharkProductsFunc = async (query: string, limit = 3) => {
    console.log(`Searching Gymshark for: ${query}`);

    try {
        const products = await searchGymsharkProducts(query, limit);

        // Check if the results are likely to be relevant
        const isRelevantSearch = query.toLowerCase().includes("men") && query.toLowerCase().includes("short");
        const hasRelevantResults = products.some(
            (p) => p.title.toLowerCase().includes("men") && p.title.toLowerCase().includes("short"),
        );

        // Prepare the response message
        let message = "";
        if (products.length === 0) {
            message = `No products found matching "${query}"`;
        } else if (isRelevantSearch && !hasRelevantResults && products.length > 0) {
            message = `Found ${products.length} products that might be related to "${query}", but none are exact matches. You might want to try different search terms.`;
        } else {
            message = `Found ${products.length} products matching "${query}"`;
        }

        return {
            success: true,
            message,
            formattedResults: formatProductsForDisplay(products),
            products: products.map((product: Product) => ({
                id: product.id,
                title: product.title,
                price: `${product.price.currency} ${product.price.value}`,
                description: product.description,
                imageUrl: product.images && product.images.length > 0 ? product.images[0].url : null,
                url: product.url,
                isExactMatch:
                    isRelevantSearch &&
                    product.title.toLowerCase().includes("men") &&
                    product.title.toLowerCase().includes("short"),
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

When a user wants to purchase a product:
1. Use the checkoutProduct tool to create a checkout for the selected product
2. Inform the user that they can complete their purchase using USDC on Base blockchain
3. Provide them with the checkout URL

User Information:
- Name: Joyce Lee
- Email: crossmintdemo@gmail.com
- Shipping Address: 1 SE 3rd Ave, Miami, FL 33131, US
- Payment Method: USDC on Base blockchain

Be friendly, knowledgeable about fitness apparel, and helpful. When recommending products, explain why you think they'd be a good fit based on the customer's needs.

Always remain focused on helping customers find the right Gymshark products for their fitness journey.`,
    model: openai("gpt-4o-mini"),
    tools: {
        searchGymsharkProducts: tool({
            description: "Search for products on the Gymshark store",
            parameters: searchProductsSchema,
            execute: async ({ query, limit = 3 }: z.infer<typeof searchProductsSchema>) => {
                return await searchGymsharkProductsFunc(query, limit);
            },
        }),
        checkoutProduct: tool({
            description: "Create a checkout for a Gymshark product using Crossmint",
            parameters: checkoutProductSchema,
            execute: async ({
                productId,
                productTitle,
                productPrice,
                productUrl,
                productVariantId,
            }: z.infer<typeof checkoutProductSchema>) => {
                const product: CheckoutProduct = {
                    id: productId,
                    title: productTitle,
                    price: productPrice,
                    url: productUrl,
                    variantId: productVariantId,
                };

                const result = await createShopifyCheckout(product);
                return {
                    success: result.success,
                    message: result.message,
                    checkoutUrl: result.checkoutUrl,
                    orderId: result.orderId,
                };
            },
        }),
    },
});
