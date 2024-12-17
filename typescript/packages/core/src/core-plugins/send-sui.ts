import { parseUnits } from "viem";
import { z } from "zod";
import type { Plugin } from "../plugins";
import type { SuiWalletClient } from "../wallets";
import { Transaction } from "@mysten/sui/transactions";

export function sendSUI(): Plugin<SuiWalletClient> {
    return {
        name: "send_sui",
        supportsSmartWallets: () => true,
        supportsChain: (chain) => chain.type === "sui",
        getTools: async (walletClient: SuiWalletClient) => {
            return [
                {
                    name: "send_sui",
                    description: "This {{tool}} sends SUI to an address.",
                    parameters: sendSUIParametersSchema,
                    method: (parameters: z.infer<typeof sendSUIParametersSchema>) =>
                        sendSUIMethod(walletClient, parameters),
                },
            ];
        },
    };
}

const sendSUIParametersSchema = z.object({
    to: z.string().describe("The address to send SUI to"),
    amount: z.string().describe("The amount of SUI to send"),
});

async function sendSUIMethod(
    walletClient: SuiWalletClient,
    parameters: z.infer<typeof sendSUIParametersSchema>,
): Promise<string> {
    try {
        const { to, amount } = parameters;
        const octas = parseUnits(amount, 9);
        const tx = new Transaction();
        const [coin] = tx.splitCoins(tx.gas, [octas]);

        // transfer the split coin to a specific address
        tx.transferObjects([coin], to);
        const result = await walletClient.sendTransaction({
            transaction: tx,
        });
        return result.hash;
    } catch (error) {
        throw new Error(`Failed to send SUI: ${error}`);
    }
}
