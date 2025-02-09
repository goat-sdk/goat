import { Chain, WalletClientBase } from "@goat-sdk/core";

export interface HyperlanePluginCtorParams {
  // Core configuration
  chain: Chain;
  walletClient: WalletClientBase;  // Changed from WalletClient to WalletClientBase
  
  // Hyperlane specific configuration
  mailboxAddress?: string;
  interchainGasPaymaster?: string;
  defaultISM?: string;
  
  // API Configuration
  rpcUrl?: string;
  apiKey?: string;
  
  // Optional configurations
  customRouterAddress?: string;
  gasLimitOverride?: number;
  timeout?: number;
}

// Additional type for message passing
export interface HyperlaneMessage {
  destinationChain: number;      // Destination chain ID
  recipient: string;             // Recipient address
  messageBody: string;           // Encoded message data
  gasAmount?: string;            // Gas payment amount
}

// Type for token bridging
export interface HyperlaneBridgeParams {
  tokenAddress: string;          // Token address to bridge
  amount: string;                // Amount to bridge
  destinationChain: number;      // Destination chain ID
  recipient: string;             // Recipient address
}

// Type for interchain account
export interface HyperlaneICAParams {
  destinationChain: number;      // Destination chain ID
  calls: Array<{                 // Array of calls to make
    to: string;
    value: string;
    data: string;
  }>;
}