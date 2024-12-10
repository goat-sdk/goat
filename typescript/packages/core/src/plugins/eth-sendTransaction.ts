import { z } from "zod";
import type { EVMWalletClient } from "../wallets";
import type { Plugin } from "./plugins";

export function eth_sendTransaction(): Plugin<EVMWalletClient> {
    return {
        name: "eth_sendTransaction",
        supportsSmartWallets: () => true,
        supportsChain: (chain) => chain.type === "evm",
        getTools: async () => {
            return [
                {
                    name: "eth_sendTransaction",
                    description: "This {{tool}} signs and sends an EVM transaction.",
                    parameters: EthSendTransactionSchema,
                    method: async (
                        walletClient: EVMWalletClient,
                        parameters: z.infer<typeof EthSendTransactionSchema>,
                    ) => {
                        return eth_sendTransactionMethod(parameters, walletClient);
                    },
                },
            ];
        },
    };
}

export const EthSendTransactionSchema = z.object({
    from: z.string(),
    to: z.string(),
    amount: z.string(),
    token: z.string(),
});

export async function eth_sendTransactionMethod(
    transaction: z.infer<typeof EthSendTransactionSchema>,
    walletClient: EVMWalletClient,
): Promise<string> {
    const txHash = await walletClient.sendTransaction(transaction);
    return txHash.hash;
}
