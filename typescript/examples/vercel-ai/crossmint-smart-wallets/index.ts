import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { crossmint } from "@goat-sdk/crossmint";
import { USDC, erc20 } from "@goat-sdk/plugin-erc20";
import { sendETH } from "@goat-sdk/wallet-evm";

require("dotenv").config();

const apiKey = process.env.CROSSMINT_STAGING_API_KEY;
const walletSignerSecretKey = process.env.SIGNER_WALLET_SECRET_KEY;
const alchemyApiKey = process.env.ALCHEMY_API_KEY_BASE_SEPOLIA;
const smartWalletAddress = process.env.SMART_WALLET_ADDRESS;

if (!apiKey || !walletSignerSecretKey || !alchemyApiKey || !smartWalletAddress) {
    throw new Error("Missing environment variables");
}

const { smartwallet, faucet } = crossmint(apiKey);

(async () => {
    const tools = await getOnChainTools({
        wallet: await smartwallet({
            address: smartWalletAddress,
            signer: {
                secretKey: walletSignerSecretKey as `0x${string}`,
            },
            chain: "base-sepolia",
            provider: alchemyApiKey,
        }),
        plugins: [sendETH(), erc20({ tokens: [USDC] }), faucet()],
    });

    const result1 = await generateText({
        model: openai("gpt-4o-mini"),
        tools: tools,
        maxSteps: 5,
        prompt: "Top up my wallet with 10 USDC",
    });

    console.log(result1.text);

    const result2 = await generateText({
        model: openai("gpt-4o-mini"),
        tools: tools,
        maxSteps: 5,
        prompt: "Get my balance in USDC",
    });

    console.log(result2.text);
})();
