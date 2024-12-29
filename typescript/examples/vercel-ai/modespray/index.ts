import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

import { http, createWalletClient } from "viem";

import { privateKeyToAccount } from "viem/accounts";
import { mode, modeTestnet } from "viem/chains";

import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";

import { viem } from "@goat-sdk/wallet-viem";

import { modespray } from "@goat-sdk/plugin-modespray";

require("dotenv").config();

const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`);

const walletClient = createWalletClient({
    account: account,
    transport: http(process.env.RPC_PROVIDER_URL),
    chain: modeTestnet,
});

(async () => {
    const tools = await getOnChainTools({
        wallet: viem(walletClient),
        plugins: [modespray()],
    });

    const prompt = "Spray 0.0001 ETH of my balance to 0x8b8e92779251F3b9B46c4D16CE6B4097430D761e";
    console.log("\n===========================================");
    console.log("🤖 Processing prompt:", prompt);
    console.log("===========================================\n");

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
        });
        console.log("\n📊 FINAL RESPONSE");
        console.log("-------------------");
        console.log(result.text);
    } catch (error) {
        console.log("\n❌ ERROR");
        console.log("-------------------");
        console.error(error);
    }
    console.log("\n-------------------\n");
})();
