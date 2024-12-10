import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

import { http } from "viem";
import { createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { PEPE, USDC, erc20 } from "@goat-sdk/plugin-erc20";
import { superfluid } from "@goat-sdk/plugin-superfluid";

import { sendETH } from "@goat-sdk/core";
import { viem } from "@goat-sdk/wallet-viem";

require("dotenv").config();

const account = privateKeyToAccount(
    process.env.WALLET_PRIVATE_KEY as `0x${string}`
);

const walletClient = createWalletClient({
    account: account,
    transport: http(process.env.RPC_PROVIDER_URL),
    chain: sepolia,
});

(async () => {
    const tools = await getOnChainTools({
        wallet: viem(walletClient),
<<<<<<< HEAD
        plugins: [sendETH(), erc20({ tokens: [USDC, PEPE] }), superfluid()],
=======
        plugins: [sendETH(), erc20({ tokens: [USDC, PEPE] })],
>>>>>>> 8d194ff (Release packages (#25))
    });

    const result = await generateText({
        model: openai("gpt-4o-mini"),
        tools: tools,
        maxSteps: 5,
<<<<<<< HEAD
<<<<<<< HEAD
        prompt: " make sure you are on OP Sepolia (11155420), create a new flow for the super token fDAIx of the address 0xD6FAF98BeFA647403cc56bDB598690660D5257d2 and the receiver should be the address 0x6caf4a402452f5108890dc50b58646c2a8730123 and the flow rate is 5555 wei/second ",
=======
        prompt: "Get my balance in USDC",
>>>>>>> 8d194ff (Release packages (#25))
=======
        prompt: "Get the balance of the USDC token",
>>>>>>> bf161b7 (Plugin: Crossmint Minting API (#23))
    });

    console.log(result.text);
})();
