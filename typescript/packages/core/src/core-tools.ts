import { formatUnits } from "viem";
import { z } from "zod";
import type { Tool, UnwrappedTool } from "./tool";
import type { WalletClient } from "./wallets";
import { getChainToken, isEVMWalletClient } from "./wallets";

export const getAddressParametersSchema = z.object({});

export const getBalanceParametersSchema = z.object({
    address: z
        .optional(z.string())
        .describe("The address to get the balance of, defaults to the address of the wallet"),
});

export function getAddress(
    walletClient: WalletClient,
    _parameters: z.infer<typeof getAddressParametersSchema>,
): string {
    return walletClient.getAddress();
}

export async function getBalance(
    walletClient: WalletClient,
    parameters: z.infer<typeof getBalanceParametersSchema>,
): Promise<string> {
    try {
        let address: string = parameters.address ?? getAddress(walletClient, {});

        if (isEVMWalletClient(walletClient)) {
            address = await walletClient.resolveAddress(address);
        }

        const balance = await walletClient.balanceOf(address.toString());

        return formatUnits(balance.value, balance.decimals);
    } catch (error) {
        throw new Error(`Failed to fetch balance: ${error}`);
    }
}

export const unwrappedTools: UnwrappedTool<WalletClient>[] = [
    {
        name: "get_address",
        description: "This {{tool}} returns the address of the wallet.",
        parameters: getAddressParametersSchema,
        method: getAddress,
    },
    {
        name: "get_balance",
        description: "This {{tool}} returns the {{token}} balance of the wallet.",
        parameters: getBalanceParametersSchema,
        method: getBalance,
    },
];

export function getCoreTools(walletClient: WalletClient): Tool[] {
    return unwrappedTools.map((tool) => ({
        ...tool,
        description: tool.description.replace("{{token}}", getChainToken(walletClient.getChain()).symbol),
        method: (parameters: z.infer<typeof tool.parameters>) => tool.method(walletClient, parameters),
    }));
}
