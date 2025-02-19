import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { USDC, WETH, erc20 } from "@goat-sdk/plugin-erc20";
import { sendETH } from "@goat-sdk/wallet-evm";
import { wagmi } from "@goat-sdk/wallet-wagmi";
import type { CoreTool } from "ai";
import type { Config } from "wagmi";

/**
 * @property {boolean} client - True if the tools are being initialized client-side, false indicates they are being
 * initialized server-side.
 * @property {Config} wagmiConfig - The Wagmi configuration.
 */
export interface Options {
    client: boolean;
    wagmiConfig: Config;
}

/**
 * Convenience function that initializes the GOAT tools. If the tools have been specified to be used server-side, the
 * `execute` function is removed to instruct the Vercel AI SDK to defer the tool invocation to the client, in the
 * `onToolCall` callback.
 * @param {Options} options - a Wagmi config and whether the tolls are being initialized client-side.
 * @returns {Promise<Record<string, CoreTool>>} A promise that resolves to the initialized GOAT tools.
 * @see {@link https://sdk.vercel.ai/docs/ai-sdk-ui/chatbot-tool-usage}
 */
export default async function getTools({ client, wagmiConfig }: Options): Promise<Record<string, CoreTool>> {
    const tools = await getOnChainTools({
        wallet: wagmi(wagmiConfig),
        plugins: [
            erc20({
                tokens: [USDC, WETH],
            }),
            sendETH(),
        ],
    });

    // if this is being used on the server side, we need to remove the execute function for each tool that is to be
    // invoked on the client side, so that they are passed onto the useChat#onToolCall
    if (!client) {
        Object.keys(tools).map((name) => {
            tools[name].execute = undefined; // you can filter only the client side tools that should be removed
        });
    }

    return tools;
}
