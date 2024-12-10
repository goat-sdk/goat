"use client";

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
  import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
  import { http, createConfig, WagmiProvider } from "wagmi";
  import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
  import { sepolia } from "viem/chains";
  import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";

  const config = createConfig({
    chains: [sepolia],
    multiInjectedProviderDiscovery: false,
    transports: {
        [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ?? ""),
    },
  });

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
    return (
        <DynamicContextProvider
        settings={{
          // Find your environment id at https://app.dynamic.xyz/dashboard/developer
          environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID ?? "",
          walletConnectors: [EthereumWalletConnectors],
        }}
      >
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <DynamicWagmiConnector>
              {children}
            </DynamicWagmiConnector>
          </QueryClientProvider>
        </WagmiProvider>
      </DynamicContextProvider>
    );
};
