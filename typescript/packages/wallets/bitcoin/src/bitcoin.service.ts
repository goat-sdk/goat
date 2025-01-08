import type { z } from "zod";
import { number, object, string } from "zod";
import type { BitcoinWalletClient } from "./BitcoinWalletClient";

export const sendBitcoinParametersSchema = object({
    to: string().describe("The Bitcoin address to send to"),
    amount: number().positive().describe("The amount of Bitcoin to send in satoshis"),
    feeRate: number().positive().optional().describe("Optional fee rate in satoshis/byte"),
});

export async function sendBitcoinMethod(
    walletClient: BitcoinWalletClient,
    parameters: z.infer<typeof sendBitcoinParametersSchema>,
) {
    return await walletClient.sendTransaction({
        to: parameters.to,
        amount: parameters.amount,
        feeRate: parameters.feeRate,
    });
}
