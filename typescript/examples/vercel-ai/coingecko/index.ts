import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

import { http } from "viem";
import { createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";

import { coingecko } from "@goat-sdk/plugin-coingecko";
import { viem } from "@goat-sdk/wallet-viem";

require("dotenv").config();

const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`);

const walletClient = createWalletClient({
    account: account,
    transport: http(process.env.RPC_PROVIDER_URL),
    chain: sepolia,
});

(async () => {
    const tools = await getOnChainTools({
        wallet: viem(walletClient),
        plugins: [coingecko({ apiKey: process.env.COINGECKO_API_KEY as string })],
    });

    const result = await generateText({
        model: openai("gpt-4o-mini"),
        tools: tools,
        maxSteps: 5,
        prompt: "What are the trending cryptocurrencies right now and what's the price of Bonk?",
    });

    console.log(result.text);
})();
