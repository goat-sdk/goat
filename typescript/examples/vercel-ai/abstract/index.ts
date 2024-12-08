import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

import { http } from "viem";
import { createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { abstractTestnet } from "viem/chains";

import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { PEPE, USDC, erc20 } from "@goat-sdk/plugin-erc20";

import { sendETH } from "@goat-sdk/core";
import { viem } from "@goat-sdk/wallet-viem";

require("dotenv").config();

const account = privateKeyToAccount(
    process.env.WALLET_PRIVATE_KEY as `0x${string}`
);

const walletClient = createWalletClient({
    account: account,
    transport: http(process.env.RPC_PROVIDER_URL),
    chain: abstractTestnet,
});

(async () => {
    const tools = await getOnChainTools({
        wallet: viem(walletClient, {
            defaultPaymaster: process.env.PAYMASTER_ADDRESS as `0x${string}`,
        }),
        plugins: [sendETH(), erc20({ tokens: [USDC, PEPE] })],
    });

    const result = await generateText({
        model: openai("gpt-4o-mini"),
        tools: tools,
        maxSteps: 5,
        prompt: "Send 1 USDC to 0x016c0803FFC6880a9a871ba104709cDBf341A90a",
    });

    console.log(result.text);
})();
