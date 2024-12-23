import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { PublicClient, WalletClient } from "viem";

declare module "@goat-sdk/wallet-evm" {
    interface EVMWalletClient {
        getClients(): Promise<{
            publicClient: PublicClient;
            walletClient?: WalletClient;
        }>;
    }
}