import readline from "node:readline";

import { createXai } from "@ai-sdk/xai";

import { generateText } from "ai";

import { http } from "viem";
import { createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mode } from "viem/chains";

import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { MODE, USDC, erc20 } from "@goat-sdk/plugin-erc20";
import { kim } from "@goat-sdk/plugin-kim";

import { sendETH } from "@goat-sdk/wallet-evm";
import { viem } from "@goat-sdk/wallet-viem";

require("dotenv").config();

const account = privateKeyToAccount(
    process.env.WALLET_PRIVATE_KEY as `0x${string}`
);

const walletClient = createWalletClient({
    account: account,
    transport: http(process.env.RPC_PROVIDER_URL),
    chain: mode,
});

const xai = createXai({
    apiKey: process.env.GROK_API_KEY,
});

(async () => {
    const tools = await getOnChainTools({
        wallet: viem(walletClient),
        plugins: [sendETH(), erc20({ tokens: [USDC, MODE] }), kim()],
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

        console.log("\n===========================================");
        console.log("🤖 Processing prompt:", prompt);
        console.log("===========================================\n");

        console.log("\n-------------------\n");

        console.log("🛠️  TOOLS CALLED");
        console.log("-------------------");

        try {
            const result = await generateText({
                model: xai("grok-beta"),
                tools: tools,
                maxSteps: 15,
                prompt: prompt,
                onStepFinish: (event) => {
                    console.log("\n👉 Step Result:");
                    console.log(JSON.stringify(event.toolResults, null, 2));
                },
            });

            console.log("\n📊 FINAL RESPONSE");
            console.log("-------------------");
            console.log(result.text);
        } catch (error) {
            console.log("\n❌ ERROR");
            console.log("-------------------");
            console.error(error);
        }
        console.log("\n===========================================\n");
    }
})();
