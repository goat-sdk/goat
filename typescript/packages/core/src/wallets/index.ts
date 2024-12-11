import {
    type EVMReadRequest,
    type EVMTransaction,
    type EVMTypedData,
    type EVMWalletClient,
    isEVMWalletClient,
} from "./evm";
import { type EVMSmartWalletClient, isEVMSmartWalletClient } from "./evm-smart-wallet";
import {
    type SolanaReadRequest,
    type SolanaTransaction,
    type SolanaWalletClient,
    isSolanaWalletClient,
} from "./solana";
import {
    type ChromiaReadRequest,
    type ChromiaTransaction,
    type ChromiaWalletClient,
    isChromiaWalletClient,
} from "./chromia";

import type { Balance, Chain, Signature, WalletClient } from "./core";
import { type AnyEVMWalletClient, type ChainForWalletClient, isEVMChain, isSolanaChain, isChromiaChain } from "./utils";

export type {
    EVMWalletClient,
    SolanaWalletClient,
    WalletClient,
    Chain,
    EVMTransaction,
    EVMReadRequest,
    SolanaTransaction,
    SolanaReadRequest,
    Signature,
    Balance,
    ChromiaWalletClient,
    ChromiaReadRequest,
    ChromiaTransaction,
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
    isChromiaChain,
    type AnyEVMWalletClient,
};
