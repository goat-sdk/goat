import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

import { http, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";

import { allora } from "@goat-sdk/plugin-allora";
import { coingecko } from "@goat-sdk/plugin-coingecko";
import { viem } from "@goat-sdk/wallet-viem";

require("dotenv").config();

const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`);

const walletClient = createWalletClient({
    account: account,
    transport: http(),
    chain: sepolia,
});
(async () => {
    const tools = await getOnChainTools({
        wallet: viem(walletClient),
        plugins: [
            allora({
                apiKey: process.env.ALLORA_API_KEY,
            }),
            coingecko({
                apiKey: process.env.COINGECKO_API_KEY as string,
            }),
        ],
    });

    const result = await generateText({
        model: openai("gpt-4o-mini"),
        tools: tools,
        maxSteps: 5,
        prompt: "Can you fetch the current price of ETH and the predicted price in 8 hours and make a recommendation as to whether I should buy or sell?",
    });

    console.log(result.text);
})();
