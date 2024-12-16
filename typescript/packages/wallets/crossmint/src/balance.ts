import type { CrossmintApiClient } from "@crossmint/common-sdk-base";
import type { Chain, EVMWalletClient, Plugin } from "@goat-sdk/core";
import { z } from "zod";
import { SUPPORTED_CURRENCIES, SupportedEVMCurrency, SupportedSolanaCurrency } from "./api";
import { CrossmintEVMSmartWalletClient } from "./smart-wallet";
import { CrossmintSolanaCustodialWalletClient } from "./custodial";

export const getBalanceParametersSchema = z.object({
    wallet: z.string().optional().describe("The address to check the balance of"),
    currencies: z.array(z.enum(SUPPORTED_CURRENCIES)).optional()
        .describe("The currencies to check balances for"),
    chains: z.array(z.string()).optional()
        .describe("The chains to check balances for"),
});

export function balanceFactory(client: CrossmintApiClient) {
    return function balance(): Plugin<CrossmintEVMSmartWalletClient | CrossmintSolanaCustodialWalletClient> {
        return {
            name: "Crossmint Balance",
            supportsChain: (chain: Chain) => true,
            supportsSmartWallets: () => true,
            getTools: async () => {
                return [
                    {
                        name: "get_token_balances",
                        description: "This {{tool}} gets token balances across multiple chains and tokens for any wallet address",
                        parameters: getBalanceParametersSchema,
                        method: async (
                            walletClient: CrossmintEVMSmartWalletClient | CrossmintSolanaCustodialWalletClient,
                            parameters: z.infer<typeof getBalanceParametersSchema>,
                        ) => {
                            const wallet = parameters.wallet ?? walletClient.getAddress();
                            const currencies = parameters.currencies ?? SUPPORTED_CURRENCIES;
                            
                            if (walletClient.getChain().type === "evm") {
                                const chains = parameters.chains;
                                if (chains === undefined) {
                                    throw new Error("Chains are required for EVM wallets");
                                }
                                return (walletClient as CrossmintEVMSmartWalletClient).tokenBalanceOf(currencies as SupportedEVMCurrency[], chains as any, wallet);
                            }
                            return (walletClient as CrossmintSolanaCustodialWalletClient).tokenBalanceOf(currencies as SupportedSolanaCurrency[], wallet);
                        },
                    },
                ];
            },
        };
    };
}
