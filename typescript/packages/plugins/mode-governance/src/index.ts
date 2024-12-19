import type { Chain, EVMWalletClient, Plugin } from "@goat-sdk/core";
import { getTools } from "./tools";

export type ModeGovernanceOptions = {
    // Optional configurations if needed
};

export function modeGovernance(options?: ModeGovernanceOptions): Plugin<EVMWalletClient> {
    return {
        name: "Mode Governance",
        supportsChain: (chain: Chain) => chain.type === "evm" && chain.id === 34443, // Mode mainnet
        supportsSmartWallets: () => true,
        getTools: async (walletClient: EVMWalletClient) => {
            return getTools(walletClient);
        },
    };
}

export * from "./constants"; 