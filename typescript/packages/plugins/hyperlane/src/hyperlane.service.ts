import { 
    MultiProvider,
    ChainMap,
    ChainMetadata,
    HyperlaneContracts,
} from '@hyperlane-xyz/sdk';

import {
    IMailbox__factory,
    IInterchainGasPaymaster__factory, 
    Router__factory,
    InterchainAccountRouter__factory,
    IMailbox,
    IInterchainGasPaymaster,
    Router,
    InterchainAccountRouter
} from '@hyperlane-xyz/core';

import { ProtocolType } from '@hyperlane-xyz/utils';
import { ethers, Signer } from 'ethers';
import { WalletClientBase } from '@goat-sdk/core';

export interface SendMessageParams {
    destinationChainId: number;
    recipient: string;
    messageBody: string;
    gasAmount?: string;
}

export interface TokenBridgeParams {
    destinationChainId: number;
    recipient: string;
    amount: string;
    tokenAddress: string;
}

export interface ICAParams {
    destinationChainId: number;
    calls: Array<{
        to: string;
        data: string;
        value?: string;
    }>;
}

// Updated Chain interface with 'name' as an optional property
interface Chain {
    id: number;
    name?: string;
}

// Extend IMailbox to include the 'dispatch' method
interface IMailboxExtended extends IMailbox {
    dispatch(
        destinationChainId: number,
        recipient: string,
        messageBody: string,
        overrides?: ethers.PayableOverrides
    ): Promise<ethers.ContractTransaction>;
}

// Extend InterchainAccountRouter to include the 'callRemote' method
interface InterchainAccountRouterExtended extends InterchainAccountRouter {
    callRemote(
        destinationChainId: number,
        calls: Array<{
            to: string;
            data: string;
            value?: ethers.BigNumber;
        }>
    ): Promise<ethers.ContractTransaction>;
}

export class HyperlaneService {
    private multiProvider: MultiProvider;
    private contracts: ChainMap<HyperlaneContracts<any>>;
    private wallet: WalletClientBase;

    constructor(
        chainMetadata: ChainMap<ChainMetadata>,
        contracts: ChainMap<HyperlaneContracts<any>>,
        wallet: WalletClientBase
    ) {
        this.multiProvider = new MultiProvider(chainMetadata);
        this.contracts = contracts;
        this.wallet = wallet;
    }

    async getMailbox(chainName: string): Promise<IMailboxExtended> {
        const provider = this.multiProvider.getProvider(chainName);
        const mailboxAddress = this.contracts[chainName].mailbox.address;
        return IMailbox__factory.connect(mailboxAddress, provider) as IMailboxExtended;
    }

    async getGasPaymaster(chainName: string): Promise<IInterchainGasPaymaster> {
        const provider = this.multiProvider.getProvider(chainName);
        const gasPaymasterAddress = this.contracts[chainName].interchainGasPaymaster.address;
        return IInterchainGasPaymaster__factory.connect(gasPaymasterAddress, provider);
    }

    async getRouter(chainName: string): Promise<Router> {
        const provider = this.multiProvider.getProvider(chainName);
        const routerAddress = this.contracts[chainName].router.address;
        return Router__factory.connect(routerAddress, provider);
    }

    async getInterchainAccountRouter(chainName: string): Promise<InterchainAccountRouterExtended> {
        const provider = this.multiProvider.getProvider(chainName);
        const routerAddress = this.contracts[chainName].interchainAccountRouter.address;
        return InterchainAccountRouter__factory.connect(routerAddress, provider) as InterchainAccountRouterExtended;
    }

    async sendMessage(params: SendMessageParams): Promise<string> {
        try {
            const chain = await this.wallet.getChain() as Chain;
            const sourceChainName = this.getChainNameById(chain.id);
            const mailbox = await this.getMailbox(sourceChainName);
            const provider = this.multiProvider.getProvider(sourceChainName);
            const signer = await this.getSigner(provider);
            const mailboxWithSigner = mailbox.connect(signer) as IMailboxExtended;

            const tx = await mailboxWithSigner.dispatch(
                params.destinationChainId,
                params.recipient, // Assuming recipient is already a valid address string
                ethers.utils.hexlify(ethers.utils.toUtf8Bytes(params.messageBody)), // Convert to hex string
                {
                    value: params.gasAmount ? ethers.BigNumber.from(params.gasAmount) : 0,
                }
            );

            const receipt = await tx.wait();
            return receipt.transactionHash;
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Failed to send message: ${error.message}`);
            }
            throw new Error('Failed to send message: Unknown error');
        }
    }

    async executeICACalls(params: ICAParams): Promise<string> {
        try {
            const chain = await this.wallet.getChain() as Chain;
            const sourceChainName = this.getChainNameById(chain.id);
            const router = await this.getInterchainAccountRouter(sourceChainName);
            const provider = this.multiProvider.getProvider(sourceChainName);
            const signer = await this.getSigner(provider);
            const routerWithSigner = router.connect(signer) as InterchainAccountRouterExtended;

            const calls = params.calls.map(call => ({
                to: call.to,
                data: ethers.utils.hexlify(call.data), // Convert Uint8Array to hex string
                value: call.value ? ethers.BigNumber.from(call.value) : ethers.constants.Zero
            }));

            const tx = await routerWithSigner.callRemote(
                params.destinationChainId,
                calls
            );

            const receipt = await tx.wait();
            return receipt.transactionHash;
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Failed to execute ICA calls: ${error.message}`);
            }
            throw new Error('Failed to execute ICA calls: Unknown error');
        }
    }

    async getMessageStatus(messageId: string, destinationChainId: number): Promise<boolean> {
        try {
            const destinationChainName = this.getChainNameById(destinationChainId);
            const mailbox = await this.getMailbox(destinationChainName);
            return await mailbox.delivered(messageId);
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Failed to get message status: ${error.message}`);
            }
            throw new Error('Failed to get message status: Unknown error');
        }
    }

    private getChainNameById(chainId: number): string {
        for (const [name, metadata] of Object.entries(this.multiProvider.metadata)) {
            if (metadata.protocol === ProtocolType.Ethereum && metadata.chainId === chainId) {
                return name;
            }
        }
        throw new Error(`Chain ID ${chainId} not found in metadata`);
    }

    async getGasEstimate(destinationChainId: number, messageBody: string): Promise<string> {
        try {
            const chain = await this.wallet.getChain() as Chain;
            const sourceChainName = this.getChainNameById(chain.id);
            const gasPaymaster = await this.getGasPaymaster(sourceChainName);
            
            const gasAmount = await gasPaymaster.quoteGasPayment(
                destinationChainId,
                ethers.utils.toUtf8Bytes(messageBody)
            );
            
            return gasAmount.toString();
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Failed to get gas estimate: ${error.message}`);
            }
            throw new Error('Failed to get gas estimate: Unknown error');
        }
    }

    private async getSigner(provider: ethers.providers.Provider): Promise<Signer> {
        // Adjusted to use 'wallet.getAddress()' assuming it exists
        const address = await this.wallet.getAddress(); // Ensure this method exists in WalletClientBase
        if (!address) {
            throw new Error('No wallet address available');
        }
        return new ethers.Wallet(address, provider);
    }
}

export default HyperlaneService;