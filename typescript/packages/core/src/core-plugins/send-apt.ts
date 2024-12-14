import { parseUnits } from "viem";
import { z } from "zod";
import type { Plugin } from "../plugins";
import type { AptosWalletClient } from "../wallets";

export function sendAPT(): Plugin<AptosWalletClient> {
    return {
        name: "send_apt",
        supportsSmartWallets: () => true,
        supportsChain: (chain) => chain.type === "aptos",
        getTools: async (walletClient: AptosWalletClient) => {
            return [
                {
                    name: "send_apt",
                    description: "This {{tool}} sends APT to an address.",
                    parameters: sendAPTParametersSchema,
                    method: (parameters: z.infer<typeof sendAPTParametersSchema>) =>
                        sendAPTMethod(walletClient, parameters),
                },
            ];
        },
    };
}

const sendAPTParametersSchema = z.object({
    to: z.string().describe("The address to send APT to"),
    amount: z.string().describe("The amount of APT to send"),
});

async function sendAPTMethod(
    walletClient: AptosWalletClient,
    parameters: z.infer<typeof sendAPTParametersSchema>,
): Promise<string> {
    try {
        const { to, amount } = parameters;
        const octas = parseUnits(amount, 8);

        const tx = await walletClient.sendTransaction({
            transactionData: {
                function: "0x1::coin::transfer",
                functionArguments: [to, octas],
                typeArguments: ["0x1::aptos_coin::AptosCoin"],
            },
        });
        return tx.hash;
    } catch (error) {
        throw new Error(`Failed to send SOL: ${error}`);
    }
}
