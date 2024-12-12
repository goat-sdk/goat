import { z } from "zod";
import type { ChromiaWalletClient } from "../wallets";
import type { Plugin } from "./plugins";

export const CHR_ASSET_ID = "5f16d1545a0881f971b164f1601cbbf51c29efd0633b2730da18c403c3b428b5";

export function sendCHR(): Plugin<ChromiaWalletClient> {
    return {
        name: "send_chr",
        supportsSmartWallets: () => false,
        supportsChain: (chain) => chain.type === "chromia",
        getTools: async () => {
            return [
                {
                    name: "send_chr",
                    description: "This {{tool}} sends CHR to an address on a Chromia chain.",
                    parameters: sendCHRParametersSchema,
                    method: sendCHRMethod,
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
        await walletClient.sendTransaction({ to, assetId: CHR_ASSET_ID, amount });
        return `CHR sent to ${to} with amount ${amount}`;
    } catch (error) {
        return `Error sending CHR: ${error}`;
    }
}
