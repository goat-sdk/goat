//BitTorrent implementation example
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

import { http } from "viem";
import { createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { bitTorrent } from "viem/chains";

import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { erc20 } from "@goat-sdk/plugin-erc20";

import { sendETH } from "@goat-sdk/wallet-evm";
import { viem } from "@goat-sdk/wallet-viem";
import { Token } from "@goat-sdk/plugin-erc20";

require("dotenv").config();

const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`);



export const USDT_t: Token = {
    decimals: 6,
    symbol: "USDT_t",
    name: "Tether USD_TRON",
    chains: {
        "199": {
            contractAddress: "0xdb28719f7f938507dbfe4f0eae55668903d34a15",
        },
    },
};

export const BTT: Token = {
    decimals: 18,
    symbol: "BTT",
    name: "BTTC BTT Token",
    chains: {
        "199": {
            contractAddress: "0x0000000000000000000000000000000000001010",
        },
    },
};


const walletClient = createWalletClient({
    account: account,
    transport: http(process.env.RPC_PROVIDER_URL),
    chain: bitTorrent,
});

(async () => {
    const tools = await getOnChainTools({
        wallet: viem(walletClient),
        plugins: [sendETH(), erc20({ tokens: [USDT_t, BTT] })],
    });

    const result = await generateText({
        model: openai("gpt-4o-mini"),
        tools: tools,
        maxSteps: 5,
        prompt: "Get my BTT balance and then, please send 100 BTT to 0x863846EcCd6a31eAa0722eDD7708788278fec149 address, afterwards get my balance of BTT token again please",
    });


    console.log(result.text);
})();
