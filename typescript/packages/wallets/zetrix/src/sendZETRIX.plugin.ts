import { Chain, PluginBase } from "@goat-sdk/core";
import { createTool } from "@goat-sdk/core";
import { z } from "zod";
import { ZetrixWalletClient } from "./ZetrixWalletClient";

export class SendZETRIXPlugin extends PluginBase<ZetrixWalletClient> {
    constructor() {
        super("sendZETRIX", []);
    }

    supportsChain(chain: Chain) {
        return chain.type === "zetrix";
    }

    getTools(walletClient: ZetrixWalletClient) {
        const sendTool = createTool(
            {
                name: "send_ZETRIX",
                description: "Send ZETRIX to an address.",
                parameters: sendZETRIXParametersSchema,
            },
            (parameters: z.infer<typeof sendZETRIXParametersSchema>) => sendZETRIXMethod(walletClient, parameters),
        );
        return [sendTool];
    }
}

export const sendZETRIX = () => new SendZETRIXPlugin();

const sendZETRIXParametersSchema = z.object({
    to: z.string().describe("The address to send ZETRIX to"),
    amount: z.string().describe("The amount of ZETRIX to send"),
});

async function sendZETRIXMethod(
    walletClient: ZetrixWalletClient,
    parameters: z.infer<typeof sendZETRIXParametersSchema>,
): Promise<string> {
    try {
        const blob = await walletClient.buildSendZETRIXBlob(parameters.to, parameters.amount);
        const signature = await walletClient.signMessage(blob);
        const tx = await walletClient.sendTransaction(blob, signature);
        return tx;
    } catch (error) {
        throw new Error(`Failed to send ZETRIX: ${error}`);
    }
}
