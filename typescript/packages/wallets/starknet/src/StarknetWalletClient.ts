import type { 
    Account, 
    RpcProvider, 
    Call, 
    InvocationsDetails, 
    InvokeFunctionResponse 
} from "starknet";
import { WalletClientBase } from "@goat-sdk/core";
import { formatUnits } from "ethers";

export type StarknetWalletCtorParams = {
    starknetAccount: Account;
    starknetClient: RpcProvider;
};

export type StarknetTransaction = {
    calls: Call[];
    transactionDetails?: InvocationsDetails;
};

export class StarknetWalletClient extends WalletClientBase {
    private starknetAccount: Account;
    starknetClient: RpcProvider;

    constructor(params: StarknetWalletCtorParams) {
        super();
        this.starknetAccount = params.starknetAccount;
        this.starknetClient = params.starknetClient;
    }

    getAddress() {
        return this.starknetAccount.address;
    }

    getChain() {
        return {
            type: "starknet",
        } as const;
    }

    async signMessage(message: string) {
        try {
            const signature = await this.starknetAccount.signMessage({
                domain: {
                    name: 'StarkNet',
                    chainId: 'SN_MAIN',
                    version: '1'
                },
                types: {
                    Message: [{ name: 'message', type: 'felt' }]
                },
                primaryType: 'Message',
                message: { message }
            });
            return {
                signature: signature.toString(),
            };
        } catch (error) {
            console.error("Error signing message:", error);
            throw error;
        }
    }

    async sendTransaction({ calls, transactionDetails }: StarknetTransaction) {
        try {
            const result = await this.starknetAccount.execute(
                calls,
                undefined,
                {
                    maxFee: transactionDetails?.maxFee,
                    version: transactionDetails?.version,
                    nonce: transactionDetails?.nonce,
                    resourceBounds: transactionDetails?.resourceBounds
                }
            );

            const receipt = await this.starknetClient.waitForTransaction(
                result.transaction_hash,
                { retryInterval: 1000 }
            );
            
            if (!receipt.isSuccess()) {
                throw new Error('Transaction failed');
            }

            return {
                hash: receipt.transaction_hash,
            };
        } catch (error) {
            console.error("Error sending transaction:", error);
            throw error;
        }
    }

    async balanceOf(address: string) {
        try {
            const ETH_CONTRACT = '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7';
            
            const result = await this.starknetClient.callContract({
                contractAddress: ETH_CONTRACT,
                entrypoint: 'balanceOf',
                calldata: [address]
            });

            const balanceWei = result[0];

            return {
                decimals: 18,
                symbol: "ETH",
                name: "Ethereum",
                value: formatUnits(balanceWei, 18),
                inBaseUnits: balanceWei.toString(),
            };
        } catch (error) {
            console.error("Error fetching balance:", error);
            throw error;
        }
    }
}

export function starknet({ starknetAccount, starknetClient }: StarknetWalletCtorParams) {
    return new StarknetWalletClient({ starknetAccount, starknetClient });
}