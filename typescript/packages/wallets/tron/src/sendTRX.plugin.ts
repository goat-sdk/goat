import { Chain, PluginBase, WalletClientBase, createTool } from "@goat-sdk/core";
import { z } from "zod";
import { TronWalletClient } from "./TronWalletClient";

const sendTRXParametersSchema = z.object({
    to: z.string().describe("The address to send TRX to"),
    amount: z.number().describe("The amount of TRX to send"),
});

async function sendTRXMethod(
    walletClient: WalletClientBase,
    parameters: z.infer<typeof sendTRXParametersSchema>,
): Promise<string> {
    // Cast to TronWalletClient since we know this plugin is for Tron.
    const tronWalletClient = walletClient as TronWalletClient;
    try {
        const { to, amount } = parameters;
        const tx = await tronWalletClient.sendTransaction({ to, value: amount });
        return tx.hash;
    } catch (error) {
        throw new Error(`Failed to send TRX: ${error}`);
    }
}

export class SendTRXPlugin extends PluginBase<TronWalletClient> {
    constructor() {
        super("sendTRX", []);
    }

    supportsChain = (chain: Chain) => chain.type === "tron";

    getTools(walletClient: WalletClientBase) {
        const sendTool = createTool(
            {
                name: "send_trx",
                description: "Send TRX to an address.",
                parameters: sendTRXParametersSchema,
            },
            (parameters: z.infer<typeof sendTRXParametersSchema>) => sendTRXMethod(walletClient, parameters),
        );
        return [sendTool];
    }
}

export const sendTRX = () => new SendTRXPlugin();
