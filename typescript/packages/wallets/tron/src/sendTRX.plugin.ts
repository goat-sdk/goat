// src/sendTRX.plugin.ts

import { Chain, PluginBase, createTool } from "@goat-sdk/core";
import { z } from "zod";
import { TronWalletClient } from "./TronWalletClient";

const sendTRXParametersSchema = z.object({
    to: z.string().describe("The address to send TRX to"),
    amount: z.number().describe("The amount of TRX to send"),
});

async function sendTRXMethod(
    walletClient: TronWalletClient,
    parameters: z.infer<typeof sendTRXParametersSchema>,
): Promise<string> {
    try {
        const { to, amount } = parameters;
        const tx = await walletClient.sendTransaction({ to, value: amount });
        return tx.hash;
    } catch (error) {
        throw new Error(`Failed to send TRX: ${error}`);
    }
}

export class SendTRXPlugin extends PluginBase<TronWalletClient> {
    constructor() {
        super("sendTRX", []);
    }

    supportsChain(chain: Chain): boolean {
        return chain.type === "tron";
    }

    getTools(walletClient: TronWalletClient) {
        const tool = createTool(
            {
                name: "send_trx",
                description: "Send TRX to an address.",
                parameters: sendTRXParametersSchema,
            },
            (parameters: z.infer<typeof sendTRXParametersSchema>) => sendTRXMethod(walletClient, parameters),
        );
        return [tool];
    }
}

export const sendTRX = () => new SendTRXPlugin();
