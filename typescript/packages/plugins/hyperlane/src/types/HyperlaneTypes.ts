// src/types/HyperlaneTypes.ts
import { Chain, WalletClientBase } from "@goat-sdk/core";

export interface HyperlanePluginCtorParams {
    chain: Chain;
    walletClient: WalletClientBase;
    mailboxAddress?: string;
    interchainGasPaymaster?: string;
    defaultISM?: string;
    rpcUrl?: string;
    customRouterAddress?: string;
    gasLimitOverride?: number;
}

export interface HyperlaneMessage {
    destinationChain: number;
    recipient: string;
    messageBody: string;
    gasAmount?: string;
}

export interface HyperlaneBridgeParams {
    tokenAddress: string;
    amount: string;
    destinationChain: number;
    recipient: string;
    bridgeType: 'NATIVE' | 'ERC20' | 'SYNTHETIC' | 'COLLATERAL';
}

export interface HyperlaneICACall {
    to: string;
    data: string;
    value?: string;
}

export interface HyperlaneICAParams {
    destinationChain: number;
    calls: HyperlaneICACall[];
}

export enum HyperlaneMessageStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed'
}

export enum HyperlaneBridgeType {
    NATIVE = 'native',
    ERC20 = 'erc20',
    SYNTHETIC = 'synthetic',
    COLLATERAL = 'collateral'
}

export enum HyperlaneSecurityModel {
    DEFAULT = 'default',
    OPTIMISTIC = 'optimistic',
    MULTISIG = 'multisig',
    CUSTOM = 'custom'
}