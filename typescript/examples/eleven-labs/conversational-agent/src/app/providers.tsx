"use client";

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
    return (
        <DynamicContextProvider
            settings={{
                environmentId: "31b6e93b-23fa-4a26-bab2-3a1cdf4ad7fd", // TODO replace in prod
                walletConnectors: [EthereumWalletConnectors, SolanaWalletConnectors],
            }}
        >
            {children}
        </DynamicContextProvider>
    );
};
