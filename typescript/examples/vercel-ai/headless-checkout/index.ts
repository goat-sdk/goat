import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

import { http } from "viem";
import { createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";

import { crossmintHeadlessCheckout } from "@goat-sdk/plugin-crossmint-headless-checkout";
import { viem } from "@goat-sdk/wallet-viem";
import { z } from "zod";

require("dotenv").config();

const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`);

const walletClient = createWalletClient({
    account: account,
    transport: http(process.env.RPC_PROVIDER_URL),
    chain: baseSepolia,
});

const MY_CROSSMINT_COLLECTION_ID = process.env.CROSSMINT_COLLECTION_ID as string;

// HEY! Fill me out based on the expected call data for the collection/contract you are using!
const myCallDataSchema = z.object({
    productId: z.string(),
    to: z.string(),
    quantity: z.string(),
    totalPrice: z.string(),
});

(async () => {
    const tools = await getOnChainTools({
        wallet: viem(walletClient),
        plugins: [
            crossmintHeadlessCheckout(
                {
                    apiKey: process.env.CROSSMINT_SERVER_API_KEY as string,
                },
                myCallDataSchema,
            ),
        ],
    });

    const result = await generateText({
        model: openai("gpt-4o"),
        tools: tools,
        maxSteps: 5,
        prompt: `Buy productId 'GOAT_COAL'from crossmint collection 'crossmint:${MY_CROSSMINT_COLLECTION_ID}', the total price should be 1 usdc`,
    });

    console.log(result.text);
})();
