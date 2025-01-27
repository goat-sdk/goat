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

import { ToolBase, getTools } from "@goat-sdk/core";
import { PEPE, USDC, erc20 } from "@goat-sdk/plugin-erc20";
import { sendETH } from "@goat-sdk/wallet-evm";
import { viem } from "@goat-sdk/wallet-viem";
import type { JSONSchemaType } from "ajv";
import { zodToJsonSchema } from "zod-to-json-schema";

require("dotenv").config();

const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`);

const walletClient = createWalletClient({
    account: account,
    transport: http(process.env.RPC_PROVIDER_URL),
    chain: mode,
});

(async () => {
    const tools: ToolBase[] = await getTools({
        wallet: viem(walletClient),
        plugins: [
            sendETH(), // Enable ETH transfers
            erc20({ tokens: [USDC, PEPE] }), // Enable ERC20 token operations
        ],
    });

    // TODO(alfonso-paella) Should we document the schema conversion process?
    // What are the requirements for tool parameters schema?
    const workerFunctions = tools.map((tool) => {
        // biome-ignore lint/suspicious/noExplicitAny: Fix types later
        const schema = zodToJsonSchema(tool.parameters as any, {
            target: "jsonSchema7",
        }) as JSONSchemaType<typeof tool.parameters>;

        const properties = Object.keys(schema.properties);

        // TODO(alfonso-paella) Should we document the argument mapping process?
        // How should descriptions be formatted for optimal agent understanding?
        const args = properties.map((property) => ({
            name: property,
            description: schema.properties[property].description ?? "",
        }));

        return new GameFunction({
            name: tool.name,
            description: tool.description,
            args: args,
            executable: async (args) => {
                try {
                    const result = await tool.execute(args);
                    return new ExecutableGameFunctionResponse(
                        ExecutableGameFunctionStatus.Done,
                        JSON.stringify(result),
                    );
                } catch (e) {
                    return new ExecutableGameFunctionResponse(
                        ExecutableGameFunctionStatus.Failed,
                        `Failed to execute tool: ${e}`,
                    );
                }
            },
        });
    });

    const onChainWorker = new GameWorker({
        id: "onchain_worker",
        name: "Onchain worker",
        description: "Worker that executes onchain actions",
        functions: [...workerFunctions],
    });

    // TODO(alfonso-paella) Should we document the GameAgent configuration options?
    // What are the recommended settings for different goals?
    const agent = new GameAgent(process.env.VIRTUALS_GAME_API_KEY as string, {
        name: "Onchain agent",
        goal: "Swap 0.01 USDC to MODE",
        description: "An agent that executes onchain actions",
        workers: [onChainWorker],
    });

    // TODO(alfonso-paella) Should we document the initialization process?
    // What happens during agent.init() and what should users expect?
    await agent.init();

    // TODO(alfonso-paella) Should we document the maxSteps parameter?
    // What's the recommended value for different types of operations?
    await agent.run(10, {
        verbose: true, // Enable detailed execution logging
    });
})();
