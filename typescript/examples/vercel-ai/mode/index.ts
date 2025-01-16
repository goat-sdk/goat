import readline from "node:readline";

import { openai } from "@ai-sdk/openai";
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

let privateKey = process.env.WALLET_PRIVATE_KEY || "";

if (!privateKey) {
    throw new Error("WALLET_PRIVATE_KEY environment variable is required");
}

// Normalize private key format
privateKey = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;

const account = privateKeyToAccount(privateKey as `0x${string}`);

const walletClient = createWalletClient({
    account: account,
    transport: http(process.env.RPC_PROVIDER_URL),
    chain: mode,
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

        console.log("\n-------------------\n");
        console.log("TOOLS CALLED");
        console.log("\n-------------------\n");

        console.log("\n-------------------\n");
        console.log("RESPONSE");
        console.log("\n-------------------\n");
        try {
            const result = await generateText({
                model: openai("gpt-4o-mini"),
                tools: tools,
                maxSteps: 10,
                prompt: prompt,
                onStepFinish: (event) => {
                    console.log(event.toolResults);
                },
            });
            console.log(result.text);
        } catch (error) {
            console.error(error);
        }
        console.log("\n-------------------\n");
    }
})();
