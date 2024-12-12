import { parseEther } from "viem";
import { z } from "zod";
import type { Plugin } from "../plugins";
import type { Chain, EVMWalletClient } from "../wallets";
import { getChainToken } from "../wallets";

export function sendETH(): Plugin<EVMWalletClient> {
    return {
        name: "send_eth",
        supportsSmartWallets: () => true,
        supportsChain: (chain: Chain) => chain.type === "evm",
        getTools: async (walletClient: EVMWalletClient) => {
            return [
                {
                    name: "send_{{token}}"
                        .replace("{{token}}", getChainToken(walletClient.getChain()).symbol)
                        .toLowerCase(),
                    description: "This {{tool}} sends {{token}} to an address.".replace(
                        "{{token}}",
                        getChainToken(walletClient.getChain()).symbol,
                    ),
                    parameters: sendETHParametersSchema,
                    method: (parameters: z.infer<typeof sendETHParametersSchema>) =>
                        sendETHMethod(walletClient, parameters),
                },
            ];
        },
    };
}

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
        throw new Error(`Failed to send ETH: ${error}`);
    }
}
