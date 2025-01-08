import { Chain, PluginBase, ToolBase, createTool } from "@goat-sdk/core";
import type { z } from "zod";
import { BitcoinWalletClient } from "./BitcoinWalletClient";
import { sendBitcoinMethod, sendBitcoinParametersSchema } from "./bitcoin.service";

export class SendBitcoinPlugin extends PluginBase<BitcoinWalletClient> {
    constructor() {
        super("sendBitcoin", []);
    }

    supportsChain(chain: Chain) {
        return chain.type === "bitcoin";
    }

    getTools(walletClient: BitcoinWalletClient): ToolBase[] {
        const sendTool = createTool(
            {
                name: "send_bitcoin",
                description: "Send Bitcoin to an address.",
                parameters: sendBitcoinParametersSchema,
            },
            (parameters: z.infer<typeof sendBitcoinParametersSchema>) => sendBitcoinMethod(walletClient, parameters),
        );
        return [sendTool];
    }
}

export const sendBitcoin = () => new SendBitcoinPlugin();
