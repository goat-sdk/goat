import {
    ExecutableGameFunctionResponse,
    ExecutableGameFunctionStatus,
    GameAgent,
    GameFunction,
    GameWorker,
} from "@virtuals-protocol/game";

import { http } from "viem";
import { createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mode } from "viem/chains";

import { openai } from "@ai-sdk/openai";
import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { MODE, PEPE, USDC, erc20 } from "@goat-sdk/plugin-erc20";
import { kim } from "@goat-sdk/plugin-kim";
import { sendETH } from "@goat-sdk/wallet-evm";
import { viem } from "@goat-sdk/wallet-viem";
import { generateText } from "ai";

require("dotenv").config();

const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`);

const walletClient = createWalletClient({
    account: account,
    transport: http(process.env.RPC_PROVIDER_URL),
    chain: mode,
});

(async () => {
    const tools = await getOnChainTools({
        wallet: viem(walletClient),
        plugins: [sendETH(), erc20({ tokens: [USDC, MODE] }), kim()],
    });

    const swap = new GameFunction({
        name: "Swap tokens",
        description: "Allows you to swap tokens",
        args: [
            {
                name: "from",
                description: "The token to swap from",
            },
            {
                name: "to",
                description: "The token to swap to",
            },
            {
                name: "amount",
                description: "The amount of tokens to swap",
            },
        ],
        executable: async (args) => {
            try {
                const result = await generateText({
                    model: openai("gpt-4o-mini"),
                    tools: tools,
                    maxSteps: 10,
                    prompt: `Swap tokens using Kim protocol in a single hop: ${JSON.stringify(args)}`,
                    onStepFinish: (event) => {
                        console.log(event.toolResults);
                    },
                });
                return new ExecutableGameFunctionResponse(ExecutableGameFunctionStatus.Done, result.text);
            } catch (e) {
                return new ExecutableGameFunctionResponse(
                    ExecutableGameFunctionStatus.Failed,
                    `Failed to execute tool: ${e}`,
                );
            }
        },
    });

    const onChainWorker = new GameWorker({
        id: "onchain_worker",
        name: "Onchain worker",
        description: "Worker that executes onchain actions",
        functions: [swap],
    });

    const agent = new GameAgent(process.env.VIRTUALS_GAME_API_KEY as string, {
        name: "Onchain agent",
        goal: "Swap 0.01 USDC to MODE",
        description: "An agent that executes onchain actions",
        workers: [onChainWorker],
    });

    await agent.init();

    await agent.run(10, {
        verbose: true,
    });
})();
