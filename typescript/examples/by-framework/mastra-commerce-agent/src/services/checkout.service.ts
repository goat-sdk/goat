import "dotenv/config";
import { http, WalletClient, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

import { getOnChainTools } from "@goat-sdk/adapter-mastra";
import { crossmintHeadlessCheckout } from "@goat-sdk/plugin-crossmint-headless-checkout";
import { viem } from "@goat-sdk/wallet-viem";

// User information from memory
const DEFAULT_USER_INFO = {
    name: "Joyce Lee",
    email: "crossmintdemo@gmail.com",
    shippingAddress: {
        name: "Joyce Lee",
        line1: "1 SE 3rd Ave",
        city: "Miami",
        state: "FL",
        postalCode: "33131",
        country: "US",
    },
    paymentMethod: "USDC",
    blockchain: "base", // Using Base as requested
};

// Initialize wallet client
let walletClient: WalletClient;

// Using a more specific type for the checkout tools
// biome-ignore lint/suspicious/noExplicitAny: Complex SDK type system
let checkoutTools: Record<string, any>;

export async function initializeCheckout() {
    try {
        if (!process.env.WALLET_PRIVATE_KEY) {
            console.error("Wallet private key not found in environment variables");
            return false;
        }

        const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`);

        walletClient = createWalletClient({
            account,
            transport: http(process.env.RPC_PROVIDER_URL || "https://mainnet.base.org"),
            chain: base,
        });

        // Initialize checkout tools with Crossmint plugin
        checkoutTools = await getOnChainTools({
            wallet: viem(walletClient),
            plugins: [
                // Using type assertion to resolve compatibility issues with the plugin
                crossmintHeadlessCheckout({
                    apiKey: process.env.CROSSMINT_API_KEY as string,
                    // biome-ignore lint/suspicious/noExplicitAny: Required for plugin compatibility
                }) as any,
            ],
        });

        console.log("Checkout service initialized successfully");
        return true;
    } catch (error) {
        console.error("Failed to initialize checkout service:", error);
        return false;
    }
}

export interface CheckoutProduct {
    id: string;
    title: string;
    price: string;
    url: string;
    variantId?: string; // Add variant ID for Shopify products
}

export async function createShopifyCheckout(product: CheckoutProduct, userInfo = DEFAULT_USER_INFO) {
    try {
        if (!checkoutTools) {
            const initialized = await initializeCheckout();
            if (!initialized) {
                throw new Error("Checkout service not initialized");
            }
        }

        // Format the product locator according to Crossmint Shopify integration requirements
        // Format: shopify:<product-url>:<variant-id>
        const variantId = product.variantId || "";
        const productLocator = `shopify:${product.url}:${variantId}`;

        console.log(`Creating checkout with product locator: ${productLocator}`);

        // Create order with Crossmint
        const result = await checkoutTools.buy_token.execute({
            lineItems: [
                {
                    productLocator: productLocator,
                },
            ],
            recipient: {
                email: userInfo.email,
                physicalAddress: userInfo.shippingAddress,
            },
            payment: {
                method: userInfo.blockchain, // Using Base blockchain
                currency: userInfo.paymentMethod, // Using USDC
            },
        });

        return {
            success: true,
            orderId: result.orderId,
            checkoutUrl: result.checkoutUrl,
            message: `Successfully created checkout for ${product.title}. Use the checkout URL to complete your purchase.`,
        };
    } catch (error) {
        console.error("Error creating checkout:", error);
        return {
            success: false,
            message: `Failed to create checkout: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}
