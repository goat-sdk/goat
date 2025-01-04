import { Chain, PluginBase, createTool } from "@goat-sdk/core";
import { Transaction } from "@mysten/sui.js/transactions";
import { z } from "zod";
import { SuiWalletClient } from "./SuiWalletClient";

// Define the parameters schema for sending SUI
const sendSUIParametersSchema = z.object({
    to: z.string().describe("The recipient's address"),
    amount: z.string().describe("The amount of SUI to send"),
});

// Implementation of the send method
const sendSUIMethod = async (walletClient: SuiWalletClient, parameters: z.infer<typeof sendSUIParametersSchema>) => {
    const { to, amount } = parameters;
    const txb = new Transaction();
    // Split amount into coins and transfer to recipient
    const [coin] = txb.splitCoins(txb.gas, [txb.pure(amount)]);
    txb.transferObjects([coin], txb.pure(to));
    return walletClient.sendTransaction({
        transaction: txb,
    });
};

export class SendSUIPlugin extends PluginBase<SuiWalletClient> {
    constructor() {
        super("sendSUI", []);
    }

    supportsChain = (chain: Chain) => chain.type === "sui";

    getTools(walletClient: SuiWalletClient) {
        const sendTool = createTool(
            {
                name: "send_sui",
                description: "Send SUI to an address.",
                parameters: sendSUIParametersSchema,
            },
            // Implement the method
            (parameters: z.infer<typeof sendSUIParametersSchema>) => sendSUIMethod(walletClient, parameters),
        );
        return [sendTool];
    }
}
