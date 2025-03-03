import readline from "node:readline";

import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

import { Connection, Keypair } from "@solana/web3.js";

import base58 from "bs58";

import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { crossmint } from "@goat-sdk/crossmint";
import { solana } from "@goat-sdk/wallet-solana";
require("dotenv").config();

// 1. Create a wallet client
const connection = new Connection(process.env.SOLANA_RPC_URL as string);
const keypair = Keypair.fromSecretKey(base58.decode(process.env.SOLANA_PRIVATE_KEY as string));

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Use staging key for development, production key for mainnet
const apiKey = process.env.CROSSMINT_API_KEY;

if (!apiKey) {
    throw new Error("Missing Crossmint API key");
}

// Initialize Crossmint plugins for wallet creation and NFT minting
const { wallets, mint } = crossmint(apiKey);

(async () => {
    // 2. Get your onchain tools for your wallet
    const tools = await getOnChainTools({
        wallet: solana({
            keypair,
            connection,
        }),
        plugins: [
            wallets(), // Allows you to create a wallet for a Twitter user
            mint(), // Allows you to mint an NFT to a specific wallet
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
