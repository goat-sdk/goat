import { Chain, PluginBase, createTool } from "@goat-sdk/core";
import { parseEther } from "viem";
import * as allEVMChains from "viem/chains";
import { z } from "zod";
import { BTTCWalletClient } from "./BTTCWalletClient";

export class SendBTTPlugin extends PluginBase<BTTCWalletClient> {
    constructor() {
        super("sendBTT", []);
    }

    supportsChain = (chain: Chain) => chain.type === "bittorrent";

    getTools(walletClient: BTTCWalletClient) {
        const sendTool = createTool(
            {
                name: `send_${getChainToken(walletClient.getChain().id).symbol}`,
                description: `Send ${getChainToken(walletClient.getChain().id).symbol} to an address.`,
                parameters: sendBTTParametersSchema,
            },
            (parameters: z.infer<typeof sendBTTParametersSchema>) => sendBTTMethod(walletClient, parameters),
        );
        return [sendTool];
    }
}

export const sendETH = () => new SendBTTPlugin();

const sendBTTParametersSchema = z.object({
    to: z.string().describe("The address to send BTT to"),
    amount: z.string().describe("The amount of BTT to send"),
});

async function sendBTTMethod(
    walletClient: BTTCWalletClient,
    parameters: z.infer<typeof sendBTTParametersSchema>,
): Promise<string> {
    try {
        const amount = parseEther(parameters.amount);
        const tx = await walletClient.sendTransaction({
            to: parameters.to,
            value: amount,
        });

        return tx.hash;
    } catch (error) {
        throw new Error(`Failed to send ${getChainToken(walletClient.getChain().id)}: ${error}`);
    }
}

function getChainToken(chainId: number) {
    // Get all viem chains
    const allChains = Object.values(allEVMChains);
    // Find matching chain by ID
    const viemChain = allChains.find((c) => c.id === chainId);

    if (!viemChain) {
        throw new Error(`Unsupported EVM chain ID: ${chainId}`);
    }

    return {
        symbol: viemChain.nativeCurrency.symbol,
        name: viemChain.nativeCurrency.name,
        decimals: viemChain.nativeCurrency.decimals,
    };
}
