import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { http } from "viem";
import { createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mode } from "./mode-chain";
import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { modeGovernance } from "@goat-sdk/plugin-mode-governance";
import { viem } from "@goat-sdk/wallet-viem";

require("dotenv").config();

// Create wallet client for Mode Network
const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`);
const walletClient = createWalletClient({
    account: account,
    transport: http(process.env.RPC_PROVIDER_URL),
    chain: mode, // Mode Network configuration
});

(async () => {
    // Initialize GOAT tools with Mode Governance plugin
    const tools = await getOnChainTools({
        wallet: viem(walletClient),
        plugins: [
            modeGovernance(),
        ],
    });

    // Example prompts to test different governance functionalities
    const prompts = [
        "What is my current voting power in the Mode DAO?",
        "Show me all the available gauges I can vote on",
        "Vote 70% of my voting power to 0x123... and 30% to 0x456...",
        "When was my last vote cast?",
    ];

    // Execute each prompt
    for (const prompt of prompts) {
        console.log("\nPrompt:", prompt);
        const result = await generateText({
            model: openai("gpt-4"),
            tools: tools,
            maxSteps: 5,
            prompt: prompt,
        });
        console.log("Response:", result.text);
    }
})();