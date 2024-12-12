import { z } from "zod";
import type { Plugin } from "../plugins";
import type { Chain, EVMTransaction, EVMWalletClient } from "../wallets";

export function sendTransaction(): Plugin<EVMWalletClient> {
    return {
        name: "EVM send transaction",
        supportsSmartWallets: () => true,
        supportsChain: (chain: Chain) => chain.type === "evm",
        getTools: async (walletClient: EVMWalletClient) => {
            return [
                {
                    name: "send_transaction",
                    description: "This {{tool}} signs and sends an EVM transaction.",
                    parameters: EVMSendTransactionSchema,
                    method: (parameters: z.infer<typeof EVMSendTransactionSchema>) => {
                        return evmSendTransactionMethod(walletClient, parameters);
                    },
                },
            ];
        },
    };
}

export const EVMSendTransactionSchema = z.object({
    to: z.string().describe("The address to send the transaction to"),
    functionName: z.string().optional().describe("The function name to call"),
    args: z.array(z.unknown()).optional().describe("The arguments to pass to the function"),
    value: z.bigint().optional().describe("The value to send"),
    abi: z.any().optional().describe("The ABI of the contract"),
    options: z
        .object({
            paymaster: z
                .object({
                    address: z.string().describe("The address of the paymaster"),
                    input: z.string().describe("The input for the paymaster"),
                })
                .optional()
                .describe("The paymaster info for the transaction"),
        })
        .optional()
        .describe("The options for the transaction"),
});

export async function evmSendTransactionMethod(
    walletClient: EVMWalletClient,
    transaction: z.infer<typeof EVMSendTransactionSchema>,
): Promise<string> {
    const txHash = await walletClient.sendTransaction(transaction as EVMTransaction);
    return txHash.hash;
}
