import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

import { http, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { Token, erc721 } from "@goat-sdk/plugin-erc721";

import { sendETH } from "@goat-sdk/wallet-evm";
import { viem } from "@goat-sdk/wallet-viem";

require("dotenv").config();

const NIFTY: Token = {
    chains: {
        "11155111": {
            contractAddress: "0xREPLACE_WITH_YOUR_ADDRESS",
        },
    },
    name: "NIFTY",
    symbol: "NIFTY",
};

const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`);

const walletClient = createWalletClient({
    account: account,
    transport: http(process.env.RPC_PROVIDER_URL),
    chain: sepolia,
});

(async () => {
    const tools = await getOnChainTools({
        wallet: viem(walletClient),
        plugins: [sendETH(), erc721({ tokens: [NIFTY] })],
    });

    const result = await generateText({
        model: openai("gpt-4o-mini"),
        tools: tools,
        maxSteps: 5,
        prompt: "Get the balance of the NIFTY token",
    });

    console.log(result.text);
})();
