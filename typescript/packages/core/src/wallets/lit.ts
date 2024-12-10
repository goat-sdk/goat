import { LitNodeClient } from "@lit-protocol/lit-node-client";
import type { SessionSigsMap } from "@lit-protocol/types";

export type LitWalletOptions = {
    litNodeClient: LitNodeClient;
    pkpSessionSigs: SessionSigsMap;
    wrappedKeyId: string;
};

export type LitEVMWalletOptions = LitWalletOptions & {
    network: "evm";
    chainId?: number;
};
 
export type LitSolanaWalletOptions = LitWalletOptions & {
    network: "solana";
};
