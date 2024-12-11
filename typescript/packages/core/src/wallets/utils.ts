import type { Chain, ChromiaChain, EVMChain, SolanaChain, WalletClient } from "./core";
import type { EVMWalletClient } from "./evm";
import type { EVMSmartWalletClient } from "./evm-smart-wallet";
import type { SolanaWalletClient } from "./solana";

export type ChainForWalletClient<TWalletClient extends WalletClient> = TWalletClient extends EVMWalletClient
    ? EVMChain
    : TWalletClient extends SolanaWalletClient
      ? SolanaChain
      : Chain;

export function isEVMChain(chain: Chain): chain is EVMChain {
    return chain.type === "evm";
}

export function isSolanaChain(chain: Chain): chain is SolanaChain {
    return chain.type === "solana";
}

export function isChromiaChain(chain: Chain): chain is ChromiaChain {
    return chain.type === "chromia";
}

export type AnyEVMWalletClient = EVMWalletClient | EVMSmartWalletClient;
