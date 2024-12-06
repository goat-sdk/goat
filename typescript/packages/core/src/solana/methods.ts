import { formatUnits } from "viem";
import type { z } from "zod";
import type { SolanaWalletClient } from "../wallets";
import type { getAddressParametersSchema, getSOLBalanceParametersSchema } from "./parameters";

export function getAddress(
    walletClient: SolanaWalletClient,
    parameters: z.infer<typeof getAddressParametersSchema>,
): string {
    return walletClient.getAddress();
}

export async function getBalance(
    walletClient: SolanaWalletClient,
    parameters: z.infer<typeof getSOLBalanceParametersSchema>,
): Promise<string> {
    try {
        const balance = await walletClient.balanceOf(parameters.address ?? getAddress(walletClient, {}));

        return formatUnits(balance.value, balance.decimals);
    } catch (error) {
        throw new Error(`Failed to fetch balance: ${error}`);
    }
}
