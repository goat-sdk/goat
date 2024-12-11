import {
    type EVMReadRequest,
    type EVMReadResult,
    type EVMTransaction,
    type EVMTransactionResult,
    type EVMTypedData,
    type EVMWalletClient,
    isEVMWalletClient,
} from "./evm";
import { type EVMSmartWalletClient, isEVMSmartWalletClient } from "./evm-smart-wallet";
import {
    type SolanaReadRequest,
    type SolanaReadResult,
    type SolanaTransaction,
    type SolanaTransactionResult,
    type SolanaWalletClient,
    isSolanaWalletClient,
} from "./solana";

import type { Balance, Chain, Signature, WalletClient } from "./core";
import { type AnyEVMWalletClient, type ChainForWalletClient, isEVMChain, isSolanaChain } from "./utils";

export type {
    EVMWalletClient,
    SolanaWalletClient,
    WalletClient,
    Chain,
    EVMTransaction,
    EVMReadRequest,
    EVMReadResult,
    EVMTransactionResult,
    SolanaTransaction,
    SolanaReadRequest,
    SolanaReadResult,
    SolanaTransactionResult,
    Signature,
    Balance,
    EVMSmartWalletClient,
    ChainForWalletClient,
    EVMTypedData,
};

export {
    isEVMWalletClient,
    isSolanaWalletClient,
    isEVMSmartWalletClient,
    isEVMChain,
    isSolanaChain,
    type AnyEVMWalletClient,
};
