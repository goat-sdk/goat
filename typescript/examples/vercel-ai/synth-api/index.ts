import readline from "node:readline";

import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

import { http } from "viem";
import { createWalletClient } from "viem";
import { mode } from "viem/chains";

import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { coingecko } from "@goat-sdk/plugin-coingecko";
import { synthapi } from "@goat-sdk/plugin-synth-api";

import { viem } from "@goat-sdk/wallet-viem";

require("dotenv").config();

const synthAPIKey = process.env.SYNTH_API_KEY || "";

if (!synthAPIKey) {
    throw new Error("SYNTH_API_KEY environment variable is required");
}

const coinCategoriesAPIKey = process.env.COINGECKO_API_KEY || "";

if (!coinCategoriesAPIKey) {
    throw new Error("COINGECKO_API_KEY environment variable is required");
}

const walletClient = createWalletClient({
    transport: http(process.env.RPC_PROVIDER_URL),
    chain: mode,
});

(async () => {
    const tools = await getOnChainTools({
        wallet: viem(walletClient),
        plugins: [synthapi({ apiKey: synthAPIKey }), coingecko({ apiKey: coinCategoriesAPIKey, isPro: true })],
    });

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    while (true) {
        const prompt = await new Promise<string>((resolve) => {
            rl.question('Enter your prompt (or "exit" to quit): ', resolve);
        });

        if (prompt === "exit") {
            rl.close();
            break;
        }

        try {
            const result = await generateText({
                model: openai("gpt-4o-mini"),
                tools: tools,
                maxSteps: 10,
                prompt: prompt,
                onStepFinish: (event) => {
                    if (event.toolResults?.length) {
                        console.log("TOOLS CALLED");
                        console.log(event.toolResults);
                    }
                },
            });
            console.log("RESPONSE: ", result.text);
            console.log(
                "steps tool:",
                result.steps.flatMap((step) => step.toolCalls),
            );
        } catch (error) {
            console.error(error);
        }
        console.log("\n-------------------\n");
    }
})();
