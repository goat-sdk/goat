import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

import { http } from "viem";
import { createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { abstractTestnet } from "viem/chains";

import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { PEPE, USDC, erc20 } from "@goat-sdk/plugin-erc20";

import { sendETH } from "@goat-sdk/wallet-evm";
import { viem } from "@goat-sdk/wallet-viem";

require("dotenv").config();

const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`);

const walletClient = createWalletClient({
    account: account,
    transport: http(process.env.RPC_PROVIDER_URL),
    chain: abstractTestnet,
});

(async () => {
    const tools = await getOnChainTools({
        wallet: viem(walletClient, {
            paymaster: {
                defaultAddress: process.env.PAYMASTER_ADDRESS as `0x${string}`,
            },
        }),
        plugins: [sendETH(), erc20({ tokens: [USDC, PEPE] })],
    });

    const result = await generateText({
        model: openai("gpt-4o-mini"),
        tools: tools,
        maxSteps: 5,
        prompt: "Send 0.000001 ETH to <address> and return the tx id",
    });

    console.log(result.text);
})();
