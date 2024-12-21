import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

import { http } from "viem";
import { createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mode } from "./mode-chain";

import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { modeStaking } from "@goat-sdk/plugin-mode-staking";
import { viem } from "@goat-sdk/wallet-viem";

require("dotenv").config();

const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`);

const walletClient = createWalletClient({
    account: account,
    transport: http(process.env.RPC_PROVIDER_URL),
    chain: mode, // Using Mode Network configuration
});

(async () => {
    const tools = await getOnChainTools({
        wallet: viem(walletClient),
        plugins: [
            modeStaking(),
        ],
    });

    // Example tasks that demonstrate different staking operations
    const tasks = [
        "Show me all my current staking positions in the Mode DAO.",
        "I want to stake 1000 MODE tokens for the maximum duration of 52 weeks.",
        "What's the cooldown period for my staking position #1?",
        "Can you increase my stake in position #1 by adding 500 more MODE tokens?",
        "I'd like to extend the lock time of position #1 by 26 more weeks.",
    ];

    // Execute each task
    for (const task of tasks) {
        console.log("\nTask:", task);
        try {
            const result = await generateText({
                model: openai("gpt-4"),
                tools: tools,
                maxSteps: 5,
                prompt: task,
            });
            console.log("Result:", result.text);
        } catch (error) {
            console.error("Error executing task:", error);
        }
    }
})();