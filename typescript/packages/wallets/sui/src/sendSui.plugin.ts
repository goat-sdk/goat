import { Chain, PluginBase, createTool } from "@goat-sdk/core";
import { TransactionBlock } from "@mysten/sui.js/dist/cjs/transactions";
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
    // Create a new transaction block for sending SUI
    const tx = new TransactionBlock();
    
    // Split the gas coin and get a specific amount
    const [coin] = tx.splitCoins(tx.gas, [tx.pure(amount)]);
    
    // Transfer the split coin to the recipient
    tx.transferObjects([coin], tx.pure(to));
    
    // Send the transaction and wait for finalization
    return walletClient.sendTransaction({
        transaction: tx,
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
