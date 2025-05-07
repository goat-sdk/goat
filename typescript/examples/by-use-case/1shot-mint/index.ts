import readline from "node:readline";

import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

import { http } from "viem";
import { createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { oneshot } from "@goat-sdk/plugin-1shot";

import { viem } from "@goat-sdk/wallet-viem";
import { mode } from "viem/chains";

require("dotenv").config();

// Use staging key for development, production key for mainnet
const apiKey = process.env.ONESHOT_API_KEY;
const apiSecret = process.env.ONESHOT_API_SECRET;
const businessId = process.env.ONESHOT_BUSINESS_ID;

if (!apiKey) {
    throw new Error("Missing 1Shot API key");
}

if (!apiSecret) {
    throw new Error("Missing 1Shot API secret");
}

if (!businessId) {
    throw new Error("Missing 1Shot business ID");
}

// This is a dummy account, we don't need it for anything
const account = privateKeyToAccount(
    "0xDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF" as `0x${string}`,
);

const walletClient = createWalletClient({
    account: account,
    transport: http(process.env.RPC_PROVIDER_URL),
    chain: mode,
});

(async () => {
    // 2. Get your onchain tools for your wallet
    const tools = await getOnChainTools({
        wallet: viem(walletClient),
        plugins: [
            oneshot(apiKey, apiSecret, businessId), // Full access to everything in 1ShotAPI
        ],
    });

    // 3. Create a readline interface to interact with the agent
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

        console.log("\n-------------------\n");
        console.log("TOOLS CALLED");
        console.log("\n-------------------\n");
        try {
            const result = await generateText({
                model: openai("gpt-4o-mini"),
                tools: tools,
                maxSteps: 10, // Maximum number of tool invocations per request
                prompt: prompt,
                onStepFinish: (event) => {
                    console.log(event.toolResults);
                },
            });

            console.log("\n-------------------\n");
            console.log("RESPONSE");
            console.log("\n-------------------\n");
            console.log(result.text);
        } catch (error) {
            console.error(error);
        }
        console.log("\n-------------------\n");
    }
})();
