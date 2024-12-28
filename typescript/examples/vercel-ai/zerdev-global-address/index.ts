import readline from "readline";
import { generateText } from "ai";
import { http } from "viem";
import { createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mode, optimism } from "viem/chains";
import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { viem } from "@goat-sdk/wallet-viem";
import { zeroDevGlobalAddress } from '@goat-sdk/plugin-zerodev-global-address';
import { createXai } from "@ai-sdk/xai";
import { erc20, USDC } from "@goat-sdk/plugin-erc20";
import { sendETH } from "@goat-sdk/wallet-evm";

require("dotenv").config();

const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`);

const xai = createXai({
    apiKey: process.env.XAI_API_KEY,
});


const walletClient = createWalletClient({
    account: account,
    transport: http(process.env.OPTIMISM_PROVIDER_URL),
    chain: optimism,
}) as any;

(async () => {
    const tools = await getOnChainTools({
        wallet:  viem(walletClient),
        plugins: [zeroDevGlobalAddress()],
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
                model: xai("grok-beta"),
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