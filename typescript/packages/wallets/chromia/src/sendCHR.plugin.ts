import { Chain, PluginBase } from "@goat-sdk/core";
import { createTool } from "@goat-sdk/core";
import { z } from "zod";
import { ChromiaWalletClient } from "./ChromiaWalletClient";
import { CHROMIA_MAINNET_BRID } from "./consts";
import { CHR_ASSET_ID } from "./consts";

export class SendCHRPlugin extends PluginBase<ChromiaWalletClient> {
    constructor() {
        super("sendCHR", []);
    }

    supportsChain(chain: Chain) {
        return chain.type === "chromia";
    }

    getTools(walletClient: ChromiaWalletClient) {
        const sendTool = createTool(
            {
                name: "send_CHR",
                description: "Send CHR to an address.",
                parameters: sendCHRParametersSchema,
            },
            (parameters: z.infer<typeof sendCHRParametersSchema>) => sendCHRMethod(walletClient, parameters),
        );
        return [sendTool];
    }
}

export const sendCHR = () => new SendCHRPlugin();

const sendCHRParametersSchema = z.object({
    to: z.string().describe("The address to send CHR to"),
    amount: z.string().describe("The amount of CHR to send"),
});

async function sendCHRMethod(
    walletClient: ChromiaWalletClient,
    parameters: z.infer<typeof sendCHRParametersSchema>,
): Promise<string> {
    try {
        const { to, amount } = parameters;
        const { receipt } = await walletClient.sendTransaction({
            to,
            assetId: CHR_ASSET_ID,
            amount,
        });
        return `https://explorer.chromia.com/mainnet/${
            CHROMIA_MAINNET_BRID.ECONOMY_CHAIN
        }/transaction/${receipt.transactionRid.toString("hex")}`;
    } catch (error) {
        return `Error sending CHR: ${error}`;
    }
}
