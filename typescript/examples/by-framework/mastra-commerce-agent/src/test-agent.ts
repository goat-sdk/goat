import "dotenv/config";
import { shopifyAgent } from "./mastra/agents/shopifyAgent.js";
import { searchGymsharkProducts } from "./services/rye.service.js";
import { createShopifyCheckout, CheckoutProduct, UserInfo } from "./services/checkout.service.js";

async function testAgent() {
    console.log("Testing Gymshark Agent...");

    try {
        // First, test the direct API call to make sure our fixes work
        console.log("\n--- Testing Direct API Call ---");
        try {
            const products = await searchGymsharkProducts("women's leggings", 3);
            console.log(`Found ${products.length} products`);
            if (products.length > 0) {
                // Print limited product info to avoid token limits
                console.log("First product title:", products[0].title);
                console.log("Price:", products[0].price.currency, products[0].price.value);
                
                // Test checkout with the first product
                console.log("\n--- Testing Checkout Functionality ---");
                const testProduct: CheckoutProduct = {
                    id: products[0].id,
                    title: products[0].title,
                    price: products[0].price.value.toString(),
                    url: products[0].url,
                    variantId: products[0].variantId
                };
                
                // Test user info from memory
                const testUserInfo: UserInfo = {
                    name: "Joyce Lee",
                    email: "crossmintdemo@gmail.com",
                    shippingAddress: {
                        name: "Joyce Lee",
                        line1: "1 SE 3rd Ave",
                        city: "Miami",
                        state: "FL",
                        postalCode: "33131",
                        country: "US"
                    },
                    paymentMethod: "usdc", // Must be lowercase
                    blockchain: "base" // This is one of the supported blockchains from the error message
                };
                
                try {
                    const checkoutResult = await createShopifyCheckout(testProduct, testUserInfo);
                    console.log("Checkout result:", JSON.stringify(checkoutResult, null, 2));
                } catch (checkoutError) {
                    console.error("Checkout test failed:", checkoutError);
                }
            }
        } catch (error) {
            console.error("API call failed:", error);
        }

        // Now test the agent with a query that should trigger the search tool
        console.log("\n--- Testing Agent with Search Query ---");
        const testQuery = "Show me some women's leggings from Gymshark";
        console.log(`Test query: "${testQuery}"`);

        const result = await shopifyAgent.generate(testQuery, {
            onStepFinish: (stepResult) => {
                if (stepResult.toolCalls && stepResult.toolCalls.length > 0) {
                    console.log("\nTool called:", JSON.stringify(stepResult.toolCalls, null, 2));
                }
            },
        });

        console.log("\n--- Agent Response ---\n");
        console.log(result.text);
        console.log("\n--- End of Response ---\n");
    } catch (error) {
        console.error("Error testing agent:", error);
    }
}

// Run the test
testAgent();
