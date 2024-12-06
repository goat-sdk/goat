import { parseEther } from "viem";
import { z } from "zod";
import type { EVMWalletClient } from "../wallets";
import type { Plugin } from "./plugins";

export function sendETH(): Plugin<EVMWalletClient> {
    return {
        name: "send_eth",
        supportsSmartWallets: () => true,
        supportsChain: (chain) => chain.type === "evm",
        getTools: async () => {
            return [
                {
                    name: "send_eth",
                    description: "This {{tool}} sends ETH to an address on an EVM chain.",
                    parameters: sendETHParametersSchema,
                    method: sendETHMethod,
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
