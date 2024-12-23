// typescript/packages/plugins/ionic/src/evm-wallet-client.d.ts
import { type PublicClient, type WalletClient, type Account } from 'viem';

declare module "@goat-sdk/wallet-evm" {
  export interface EVMWalletClient {
    publicClient: PublicClient;
    walletClient: WalletClient;
    account: Account;
    chainId: number;
    // Add other properties and methods of your EVMWalletClient
  }
}