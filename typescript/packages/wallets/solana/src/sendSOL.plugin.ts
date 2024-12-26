import { Chain, PluginBase } from "@goat-sdk/core";
import { createTool } from "@goat-sdk/core";
import { SystemProgram } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import { parseUnits } from "viem";
import { z } from "zod";
import { SolanaWalletClient } from "./SolanaWalletClient";

export class SendSOLPlugin extends PluginBase<SolanaWalletClient> {
    constructor() {
        super("sendSOL", []);
    }

    supportsChain(chain: Chain) {
        return chain.type === "solana";
    }

    getTools(walletClient: SolanaWalletClient) {
        const sendTool = createTool(
            {
                name: "send_SOL",
                description: "Send SOL to an address.",
                parameters: sendSOLParametersSchema,
            },
            (parameters: z.infer<typeof sendSOLParametersSchema>) => sendSOLMethod(walletClient, parameters),
        );
        return [sendTool];
    }
}

export const sendSOL = () => new SendSOLPlugin();

const sendSOLParametersSchema = z.object({
    to: z.string().describe("The address to send SOL to"),
    amount: z.string().describe("The amount of SOL to send"),
});

async function sendSOLMethod(
    walletClient: SolanaWalletClient,
    parameters: z.infer<typeof sendSOLParametersSchema>,
): Promise<string> {
    try {
        const { to, amount } = parameters;

        const senderAddress = walletClient.getAddress();
        const lamports = parseUnits(amount, 9);

        const transferInstruction = SystemProgram.transfer({
            fromPubkey: new PublicKey(senderAddress),
            toPubkey: new PublicKey(to),
            lamports,
        });

        const txResult = await walletClient.sendTransaction({
            instructions: [transferInstruction],
        });

        return txResult.hash;
    } catch (error) {
        throw new Error(`Failed to send SOL: ${error}`);
    }
}
