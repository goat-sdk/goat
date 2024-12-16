import { z } from "zod";
import type { Plugin } from "../plugins";
import type { Chain, ChromiaWalletClient } from "../wallets";

export enum CHROMIA_MAINNET_BRID {
    ECONOMY_CHAIN = "15C0CA99BEE60A3B23829968771C50E491BD00D2E3AE448580CD48A8D71E7BBA",
}
export const CHR_ASSET_ID = "5f16d1545a0881f971b164f1601cbbf51c29efd0633b2730da18c403c3b428b5";

export function sendCHR(): Plugin<ChromiaWalletClient> {
    return {
        name: "send_chr",
        supportsSmartWallets: () => false,
        supportsChain: (chain: Chain) => chain.type === "chromia",
        getTools: async (walletClient: ChromiaWalletClient) => {
            return [
                {
                    name: "send_chr",
                    description: "This {{tool}} sends CHR to an address on a Chromia chain.",
                    parameters: sendCHRParametersSchema,
                    method: (parameters: z.infer<typeof sendCHRParametersSchema>) =>
                        sendCHRMethod(walletClient, parameters),
                },
            ];
        },
    };
}

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
        const { receipt } = await walletClient.sendTransaction({ to, assetId: CHR_ASSET_ID, amount });
        return `https://explorer.chromia.com/mainnet/${CHROMIA_MAINNET_BRID.ECONOMY_CHAIN}/transaction/${receipt.transactionRid.toString("hex")}`;
    } catch (error) {
        return `Error sending CHR: ${error}`;
    }
}
