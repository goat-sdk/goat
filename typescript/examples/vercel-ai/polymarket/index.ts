import * as readline from "node:readline/promises";
import { openai } from "@ai-sdk/openai";
import { CoreMessage, streamText } from "ai";

import { http } from "viem";
import { createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygon } from "viem/chains";

import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { polymarket } from "@goat-sdk/plugin-polymarket";
import { viem } from "@goat-sdk/wallet-viem";

require("dotenv").config();

const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`);

const walletClient = createWalletClient({
    account: account,
    transport: http(process.env.RPC_PROVIDER_URL),
    chain: polygon,
});

const terminal = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const messages: CoreMessage[] = [];

async function main() {
    const tools = await getOnChainTools({
        wallet: viem(walletClient),
        plugins: [
            polymarket({
                credentials: {
                    key: process.env.POLYMARKET_API_KEY as string,
                    secret: process.env.POLYMARKET_SECRET as string,
                    passphrase: process.env.POLYMARKET_PASSPHRASE as string,
                },
            }),
        ],
    });

    while (true) {
        const userInput = await terminal.question("\nYou: ");
        messages.push({ role: "user", content: userInput });

        try {
            const result = streamText({
                model: openai("gpt-4o-mini"),
                messages,
                tools: tools,
                maxSteps: 5,
            });

            let fullResponse = "";
            process.stdout.write("\nAssistant: ");
            for await (const delta of result.textStream) {
                fullResponse += delta;
                process.stdout.write(delta);
            }
            process.stdout.write("\n");

            messages.push({ role: "assistant", content: fullResponse });
        } catch (error) {
            console.error("Error:", error);
            messages.push({ role: "assistant", content: JSON.stringify(error) });
        }
    }
}

main().catch(console.error);
