import "dotenv/config";
import { getOnChainTools } from "@goat-sdk/adapter-mastra";
import { crossmintHeadlessCheckout } from "@goat-sdk/plugin-crossmint-headless-checkout";
import { viem } from "@goat-sdk/wallet-viem";
// Import only what we need for a basic test
import { http, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

// Import product search function directly to avoid potential import issues
import { searchGymsharkProducts } from "./services/rye.service.js";

// Import the UserInfo interface
import { UserInfo } from "./services/checkout.service.js";

// Sample user info for testing - this would normally come from user input
// In a real agent scenario, the agent would collect this information from the user
const TEST_USER_INFO: UserInfo = {
    name: process.env.USER_NAME || "Test User",
    email: process.env.USER_EMAIL || "test@example.com",
    shippingAddress: {
        name: process.env.SHIPPING_NAME || "Test User",
        line1: process.env.SHIPPING_LINE1 || "123 Test St",
        city: process.env.SHIPPING_CITY || "Test City",
        state: process.env.SHIPPING_STATE || "TS",
        postalCode: process.env.SHIPPING_POSTAL_CODE || "12345",
        country: process.env.SHIPPING_COUNTRY || "US",
    },
    paymentMethod: process.env.PAYMENT_METHOD || "USDC",
    blockchain: process.env.BLOCKCHAIN || "base", // Base mainnet
};

/**
 * Test script for the Crossmint checkout integration
 * This script searches for a product and then attempts to create a checkout for it
 */
async function testCheckout() {
    try {
        console.log("Initializing checkout service...");

        // Initialize wallet client directly in this test script
        if (!process.env.WALLET_PRIVATE_KEY) {
            console.error("Wallet private key not found in environment variables");
            return;
        }

        const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`);

        const walletClient = createWalletClient({
            account,
            transport: http(process.env.RPC_PROVIDER_URL || "https://mainnet.base.org"),
            chain: base,
        });

        // Initialize checkout tools
        // Define a type that allows array-like operations on the tools object
        type CheckoutToolsArray = {
            // biome-ignore lint/suspicious/noExplicitAny: Required for SDK compatibility
            [key: string]: any;
            // biome-ignore lint/suspicious/noExplicitAny: Required for SDK compatibility
            find: (predicate: (value: any) => boolean) => any;
        };

        const checkoutTools = await getOnChainTools({
            // Use type assertion to fix compatibility issues
            // biome-ignore lint/suspicious/noExplicitAny: Required for type compatibility
            wallet: viem(walletClient) as any,
            plugins: [
                // Using type assertion to resolve compatibility issues
                crossmintHeadlessCheckout({
                    apiKey: process.env.CROSSMINT_API_KEY as string,
                    // biome-ignore lint/suspicious/noExplicitAny: Required for plugin compatibility
                }) as any,
            ],
        });

        console.log("Searching for products...");
        // Search for men's workout shorts
        const products = await searchGymsharkProducts("men's workout shorts", 1);

        if (products.length === 0) {
            console.log("No products found to test checkout with.");
            return;
        }

        const product = products[0];
        console.log(`Found product: ${product.title}`);
        console.log(`Product URL: ${product.url}`);
        console.log(`Product ID: ${product.id}`);
        console.log(`Variant ID: ${product.variantId || "No variant ID available"}`);

        // Create a checkout directly using the checkout tools
        console.log("Creating checkout...");

        // Format the product locator according to Crossmint Shopify integration requirements
        const variantId = product.variantId || "";
        const productLocator = `shopify:${product.url}:${variantId}`;

        console.log(`Creating checkout with product locator: ${productLocator}`);

        // Create order with Crossmint directly
        // Find the buy_token tool in the tools returned by getOnChainTools
        const buyTokenTool = (checkoutTools as unknown as CheckoutToolsArray).find(
            // biome-ignore lint/suspicious/noExplicitAny: Complex SDK type system
            (tool: any) => tool.name === "buy_token",
        );

        if (!buyTokenTool) {
            console.error("buy_token tool not found in checkout tools");
            return;
        }

        // biome-ignore lint/suspicious/noExplicitAny: Complex SDK type system
        const result = await (buyTokenTool as any).execute({
            lineItems: [
                {
                    productLocator: productLocator,
                },
            ],
            recipient: {
                email: TEST_USER_INFO.email,
                physicalAddress: TEST_USER_INFO.shippingAddress,
            },
            payment: {
                method: TEST_USER_INFO.blockchain,
                currency: TEST_USER_INFO.paymentMethod,
            },
        });

        console.log("Checkout result:", JSON.stringify(result, null, 2));

        if (result.success) {
            console.log(`✅ Successfully created checkout for ${product.title}`);
            console.log(`Checkout URL: ${result.checkoutUrl}`);
            console.log(`Order ID: ${result.orderId}`);
        } else {
            console.log(`❌ Failed to create checkout: ${result.message || "Unknown error"}`);
        }
    } catch (error) {
        console.error("Error in test checkout:", error);
    }
}

// Run the test
testCheckout().catch(console.error);
