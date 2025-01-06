import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

import { http } from "viem";
import { createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygon } from "viem/chains";

import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { lens } from "@goat-sdk/plugin-lens";
import { viem } from "@goat-sdk/wallet-viem";

require("dotenv").config();

const account = privateKeyToAccount(
    process.env.WALLET_PRIVATE_KEY as `0x${string}`
);

const walletClient = createWalletClient({
    account: account,
    transport: http(process.env.ALCHEMY_API_KEY),
    chain: polygon,
});

(async () => {
    const tools = await getOnChainTools({
        wallet: viem(walletClient),
        plugins: [lens()],
    });

    const result = await generateText({
        model: openai("gpt-4o"),
        tools: tools,
        maxSteps: 5,
        prompt: "Get the creator of post https://hey.xyz/posts/0x033026-0x0580",
    });

    console.log(result.text);
})();
