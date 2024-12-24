import { createCrossmint, Crossmint, CrossmintApiClient } from "@crossmint/common-sdk-base";
import { Chain, createTool, PluginBase, WalletClientBase } from "@goat-sdk/core";
import { z } from "zod";

import { EVMWalletClient } from "@goat-sdk/wallet-evm";

import packageJson from "../package.json";
import { Order } from "@crossmint/client-sdk-base";
import { parseTransaction } from "viem";

export class CrossmintHeadlessCheckoutPlugin extends PluginBase {
    private readonly crossmintApiClient: CrossmintApiClient;

    constructor(
        private readonly crossmint: Crossmint,
        private readonly callDataSchema: z.ZodSchema,
    ) {
        super("crossmint-headless-checkout", []);

        const validatedCrossmint = createCrossmint(crossmint, {
            usageOrigin: "server",
        });
        this.crossmintApiClient = new CrossmintApiClient(validatedCrossmint, {
            internalConfig: {
                sdkMetadata: {
                    name: "@goat-sdk/plugin-crossmint-headless-checkout",
                    version: packageJson.version,
                },
            },
        });
    }

    supportsChain(chain: Chain): boolean {
        return chain.type === "evm" || chain.type === "solana";
    }

    getTools(walletClient: EVMWalletClient) {
        const parametersSchema = z.object({
            recipient: z.union([
                z.object({
                    walletAddress: z.string(),
                }),
                z.object({
                    email: z.string().email(),
                }),
            ]),
            payment: z.object({
                method: z.enum([
                    "ethereum",
                    "ethereum-sepolia",
                    "base",
                    "base-sepolia",
                    "polygon",
                    "polygon-amoy",
                    "solana",
                ]), // TOOD: This is not the full list of methods
                currency: z.enum(["usdc"]), // TODO: This is not the full list of currencies
                payerAddress: z.string(), // TODO: This required for now, as this will create and buy the order in 1 tool
                receiptEmail: z.string().optional(),
            }),
            lineItems: z.array(
                z.object({
                    // TODO: Add tokenLocator support
                    collectionLocator: z.string(),
                    callData: this.callDataSchema,
                }),
            ),
        });
        return [
            createTool(
                {
                    name: "create_and_pay_order",
                    description: "Create and pay for a Crossmint Headless Checkout order",
                    parameters: parametersSchema,
                },
                async (params) => {
                    const url = this.crossmintApiClient.buildUrl("/api/2022-06-09/orders");
                    const res = await this.crossmintApiClient.post(url, {
                        body: JSON.stringify(params),
                    });

                    const { order } = (await res.json()) as { order: Order; orderClientSecret: string };

                    const serializedTransaction =
                        order.payment.preparation != null && "serializedTransaction" in order.payment.preparation
                            ? order.payment.preparation.serializedTransaction
                            : undefined;
                    if (!serializedTransaction) {
                        throw new Error("No serialized transaction found");
                    }

                    const transaction = parseTransaction(serializedTransaction as `0x${string}`);

                    throw new Error("I cant send this transaction :(");
                },
            ),
        ];
    }
}
