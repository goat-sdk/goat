import readline from "node:readline";

import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

import { http, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";

import { enso } from "@goat-sdk/plugin-enso";
import { USDC, WETH, erc20 } from "@goat-sdk/plugin-erc20";
import { viem } from "@goat-sdk/wallet-viem";

require("dotenv").config();

const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`);

const walletClient = createWalletClient({
    account: account,
    transport: http(),
    chain: base,
});
(async () => {
    const tools = await getOnChainTools({
        wallet: viem(walletClient),
        plugins: [
            enso({
                apiKey: process.env.ENSO_API_KEY as string,
            }),
            erc20({ tokens: [USDC, WETH] }),
        ],
    });
    //const result = await generateText({
    //    model: openai("gpt-4o-mini"),
    //    tools: tools,
    //    maxSteps: 5,
    //    prompt: "Route 0.5 0x833589fcd6edb6e08f4c7c32d4f71b54bda02913 (USDC) to 0x4200000000000000000000000000000000000006 (WETH)",
    //});

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
            // Prompt example:
            // "Route 0.5 0x833589fcd6edb6e08f4c7c32d4f71b54bda02913 (USDC) to 0x4200000000000000000000000000000000000006 (WETH)"
            const result = await generateText({
                model: openai("gpt-4o-mini"),
                tools: tools,
                maxSteps: 10, // Maximum number of tool invocations per request
                prompt: prompt,
                onStepFinish: (event) => {
                    console.log("\n-------------------\n");
                    console.log("TOOLS CALLED");
                    console.log("\n-------------------\n");
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
