import { formatUnits } from "viem";
import type { z } from "zod";
import type { EVMWalletClient } from "../wallets";
import type { getAddressParametersSchema, getETHBalanceParametersSchema } from "./parameters";

export function getAddress(
    walletClient: EVMWalletClient,
    parameters: z.infer<typeof getAddressParametersSchema>,
): string {
    return walletClient.getAddress();
}

export async function getBalance(
    walletClient: EVMWalletClient,
    parameters: z.infer<typeof getETHBalanceParametersSchema>,
): Promise<string> {
    try {
        const address = await walletClient.resolveAddress(parameters.address ?? getAddress(walletClient, {}));

        const balance = await walletClient.balanceOf(address.toString());

        return formatUnits(balance.value, balance.decimals);
    } catch (error) {
        throw new Error(`Failed to fetch balance: ${error}`);
    }
}
