import readline from "node:readline";

import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

import { http } from "viem";
import { createWalletClient, defineChain } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { PEPE, USDC, erc20 } from "@goat-sdk/plugin-erc20";

import { sendETH } from "@goat-sdk/wallet-evm";
import { viem } from "@goat-sdk/wallet-viem";

require("dotenv").config();

const soneium = defineChain({
    id: 1868,
    name: "Soneium",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: {
        default: {
            http: [process.env.RPC_PROVIDER_URL || "https://rpc.soneium.org/"],
        },
    },
});

// 1. Create a wallet client
const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`);

const transport = http(process.env.RPC_PROVIDER_URL);

const walletClient = createWalletClient({
    account: account,
    transport: transport,
    chain: soneium,
});

(async () => {
    // 2. Get your onchain tools for your wallet
    const tools = await getOnChainTools({
        wallet: viem(walletClient),
        plugins: [
            sendETH(), // Enable ETH transfers
            erc20({ tokens: [USDC, PEPE] }), // Enable ERC20 token operations
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
