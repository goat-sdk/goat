import "dotenv/config";
import { shopifyAgent } from "./mastra/agents/shopifyAgent.js";
import { searchGymsharkProducts } from "./services/rye.service.js";

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
