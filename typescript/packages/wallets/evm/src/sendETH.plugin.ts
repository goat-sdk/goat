import { Chain, PluginBase, createTool } from "@goat-sdk/core";
import { parseEther } from "viem";
import * as allEVMChains from "viem/chains";
import { z } from "zod";
import { EVMWalletClient } from "./EVMWalletClient";

export class SendETHPlugin extends PluginBase<EVMWalletClient> {
    constructor() {
        super("sendETH", []);
    }

    supportsChain = (chain: Chain) => chain.type === "evm";

    getTools(walletClient: EVMWalletClient) {
        const sendTool = createTool(
            {
                name: `send_${getChainToken(walletClient.getChain().id).symbol}`,
                description: `Send ${getChainToken(walletClient.getChain().id).symbol} to an address.`,
                parameters: sendETHParametersSchema,
            },
            (parameters: z.infer<typeof sendETHParametersSchema>) => sendETHMethod(walletClient, parameters),
        );
        return [sendTool];
    }
}

export const sendETH = () => new SendETHPlugin();

const sendETHParametersSchema = z.object({
    to: z.string().describe("The address to send ETH to"),
    amount: z.string().describe("The amount of ETH to send"),
});

async function sendETHMethod(
    walletClient: EVMWalletClient,
    parameters: z.infer<typeof sendETHParametersSchema>,
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
