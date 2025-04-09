import "dotenv/config";
import { http, WalletClient, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

import { getOnChainTools } from "@goat-sdk/adapter-mastra";
import { crossmintHeadlessCheckout } from "@goat-sdk/plugin-crossmint-headless-checkout";
import { viem } from "@goat-sdk/wallet-viem";

// Interface for user information required for checkout
export interface UserInfo {
    name: string;
    email: string;
    shippingAddress: {
        name: string;
        line1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    paymentMethod: string; // Default: USDC
    blockchain: string; // Default: base (mainnet)
}

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

        // Add 0x prefix to private key if it doesn't have one
        const privateKey = process.env.WALLET_PRIVATE_KEY?.startsWith("0x")
            ? process.env.WALLET_PRIVATE_KEY
            : `0x${process.env.WALLET_PRIVATE_KEY}`;
        const account = privateKeyToAccount(privateKey as `0x${string}`);

        // Ensure we're using Base mainnet
        walletClient = createWalletClient({
            account,
            transport: http(process.env.RPC_PROVIDER_URL || "https://mainnet.base.org"),
            chain: base, // This is Base mainnet
        });

        // Initialize checkout tools with Crossmint plugin
        checkoutTools = await getOnChainTools({
            // Use type assertion to fix compatibility issues
            // biome-ignore lint/suspicious/noExplicitAny: Required for type compatibility
            wallet: viem(walletClient) as any,
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

export async function createShopifyCheckout(product: CheckoutProduct, userInfo: UserInfo) {
    try {
        if (!checkoutTools) {
            const initialized = await initializeCheckout();
            if (!initialized) {
                throw new Error("Checkout service not initialized");
            }
        }

        // Format the product locator according to Crossmint Shopify integration requirements
        // Format: shopify:<full-product-url>:<variant-id>
        const variantId = product.variantId || "";
        // Ensure the URL is a full URL including the domain
        const productUrl = product.url.startsWith("http") ? product.url : `https://www.gymshark.com${product.url}`;
        const productLocator = `shopify:${productUrl}:${variantId}`;

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
                method: userInfo.blockchain, // Use blockchain as the method (e.g., 'base')
                currency: userInfo.paymentMethod, // Currency (e.g., 'USDC')
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
