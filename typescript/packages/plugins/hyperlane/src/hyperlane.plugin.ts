import { PluginBase } from '@goat-sdk/core';
import { HyperlaneService } from './hyperlane.service';
import {
    HyperlanePluginCtorParams,
    HyperlaneMessage,
    HyperlaneBridgeParams,
    HyperlaneICAParams,
    HyperlaneICACall,
    HyperlaneMessageStatus,
    HyperlaneBridgeType,
    HyperlaneSecurityModel
} from './types';
import { ChainMap, ChainMetadata } from '@hyperlane-xyz/sdk';
import { ProtocolType } from '@hyperlane-xyz/utils';
import { HyperlaneContracts } from '@hyperlane-xyz/sdk';
import { Chain, WalletClientBase } from "@goat-sdk/core";

export class HyperlanePlugin extends PluginBase {
    private service: HyperlaneService;
    private chainMetadata: ChainMap<ChainMetadata>;
    private contracts: ChainMap<HyperlaneContracts<any>>;
    private chain: Chain;

    constructor(params: HyperlanePluginCtorParams) {
        // Pass plugin name to super constructor
        super("hyperlane", []);
        
        // Store the chain
        this.chain = params.chain;
        
        // Initialize chain metadata with required fields
        this.chainMetadata = {
            [this.getChainKey(params.chain)]: {
                name: this.getChainKey(params.chain),
                chainId: this.getChainId(params.chain),
                domainId: this.getChainId(params.chain), // Required by Hyperlane
                protocol: ProtocolType.Ethereum, // Or determine from chain type
                rpcUrls: [{
                    http: params.rpcUrl || '',
                }],
                blocks: {
                    confirmations: 1,
                    reorgPeriod: 0,
                    estimateBlockTime: 10
                },
                // Add required chain metadata fields
                transactionOverrides: {}
            }
        };

        // Initialize contracts map
        this.contracts = {
            [this.getChainKey(params.chain)]: {
                mailbox: {
                    address: params.mailboxAddress || '',
                    // Add other necessary contract properties
                },
                interchainGasPaymaster: {
                    address: params.interchainGasPaymaster || '',
                },
                defaultIsm: {
                    address: params.defaultISM || '',
                },
                // Add other necessary contracts
            }
        };

        // Initialize the service
        this.service = new HyperlaneService(
            this.chainMetadata,
            this.contracts,
            params.walletClient
        );
    }

    private getChainKey(chain: any): string {
        // Implement chain key extraction based on your chain type
        return chain.name || chain.toString();
    }

    private getChainId(chain: any): number {
        // Implement chain ID extraction based on your chain type
        return typeof chain.id === 'number' ? chain.id : 0;
    }

    /**
     * Send a message across chains
     */
    async sendMessage(params: HyperlaneMessage): Promise<string> {
        return this.service.sendMessage({
            destinationChainId: params.destinationChain,
            recipient: params.recipient,
            messageBody: params.messageBody,
            gasAmount: params.gasAmount
        });
    }

    /**
     * Bridge tokens across chains
     * @deprecated This method is not implemented yet
     */
    async bridgeTokens(_params: HyperlaneBridgeParams): Promise<string> {
        throw new Error('Token bridging not implemented');
    }

    /**
     * Execute interchain account calls
     */
    async executeICACalls(params: HyperlaneICAParams): Promise<string> {
        return this.service.executeICACalls({
            destinationChainId: params.destinationChain,
            calls: params.calls.map(call => ({
                to: call.to,
                data: call.data,
                value: call.value
            }))
        });
    }

    /**
     * Get gas estimate for a message
     */
    async getGasEstimate(destinationChain: number, messageBody: string): Promise<string> {
        return this.service.getGasEstimate(destinationChain, messageBody);
    }

    /**
     * Check message delivery status
     */
    async getMessageStatus(messageId: string, destinationChain: number): Promise<boolean> {
        return this.service.getMessageStatus(messageId, destinationChain);
    }

    /**
     * Plugin initialization hook
     */
    async onInit(): Promise<void> {
        const chainKey = this.getChainKey(this.chain);
        // Validate required addresses
        if (!this.contracts[chainKey]?.mailbox?.address) {
            throw new Error('Mailbox address is required');
        }
        if (!this.contracts[chainKey]?.interchainGasPaymaster?.address) {
            throw new Error('InterchainGasPaymaster address is required');
        }
    }

    /**
     * Plugin cleanup hook
     */
    async onDestroy(): Promise<void> {
        // Cleanup resources if necessary
    }

    /**
     * Check if the plugin supports a given chain
     * @param chain The chain to check support for
     * @returns true if the chain is supported, false otherwise
     */
    supportsChain = (_chain: any) => true; // Using underscore to indicate intentionally unused parameter
}

/**
 * Factory function to create a new instance of the HyperlanePlugin
 * @param params Configuration parameters for the plugin
 * @returns A new instance of HyperlanePlugin
 */
export const hyperlane = (params: HyperlanePluginCtorParams) => new HyperlanePlugin(params);
