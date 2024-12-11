import { formatUnits } from "viem";
import type { z } from "zod";
import type { ChromiaWalletClient } from "../wallets";
import type { getAddressParametersSchema, getCHRBalanceParametersSchema } from "./parameters";

export function getAddress(
    walletClient: ChromiaWalletClient,
    parameters: z.infer<typeof getAddressParametersSchema>,
): string {
    return walletClient.getAddress();
}

export async function getBalance(
    walletClient: ChromiaWalletClient,
    parameters: z.infer<typeof getCHRBalanceParametersSchema>,
): Promise<string> {
    try {
        const balance = await walletClient.balanceOf(parameters.address ?? getAddress(walletClient, {}));

        return formatUnits(balance.value, balance.decimals);
    } catch (error) {
        throw new Error(`Failed to fetch balance: ${error}`);
    }
}
