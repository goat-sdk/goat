import { CrossmintApiClient } from "@crossmint/common-sdk-base";
import { EVMReadRequest, EVMSmartWalletClient, EVMTransaction, EVMTypedData } from "@goat-sdk/wallet-evm";
import { http, Abi, type PublicClient, createPublicClient, encodeFunctionData, formatUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import { normalize } from "viem/ens";
import { SupportedSmartWalletChains, getViemChain } from "../chains";
import { CrossmintWalletsAPI } from "./CrossmintWalletsAPI";

export type CustodialSigner = `0x${string}`;

export type KeyPairSigner = {
    secretKey: `0x${string}`;
};

type EmailLinkedUser = {
    email: string;
};

type PhoneLinkedUser = {
    phone: string;
};

type UserIdLinkedUser = {
    userId: number;
};

type LinkedUser = EmailLinkedUser | PhoneLinkedUser | UserIdLinkedUser;

export type SmartWalletOptions = {
    signer: CustodialSigner | KeyPairSigner;
    address?: string;
    linkedUser?: LinkedUser;
    chain: SupportedSmartWalletChains;
    provider: string;
    options?: {
        ensProvider?: string;
    };
};

function getLocator(address: string | undefined, linkedUser: LinkedUser | undefined) {
    if (linkedUser) {
        if ("email" in linkedUser) {
            return `email:${linkedUser.email}:evm-smart-wallet`;
        }
        if ("phone" in linkedUser) {
            return `phone:${linkedUser.phone}:evm-smart-wallet`;
        }
        if ("userId" in linkedUser) {
            return `userId:${linkedUser.userId}:evm-smart-wallet`;
        }
    }

    if (!address) {
        throw new Error("A Smart Wallet address is required if no linked user is provided");
    }

    return address;
}

function buildTransactionData({
    recipientAddress,
    abi,
    functionName,
    args,
    value,
}: {
    recipientAddress: string;
    abi?: Abi;
    functionName?: string;
    args?: unknown[];
    value?: bigint;
}) {
    if (!abi) {
        return {
            to: recipientAddress,
            value: value?.toString() ?? "0",
            data: "0x",
        };
    }

    if (!functionName) {
        throw new Error("Function name is required");
    }

    return {
        to: recipientAddress,
        value: value?.toString() ?? "0",
        data: encodeFunctionData({ abi, functionName, args }),
    };
}

export class SmartWalletClient extends EVMSmartWalletClient {
    #locator: string;
    #client: CrossmintWalletsAPI;
    #chain: SupportedSmartWalletChains;
    #signer: CustodialSigner | KeyPairSigner;
    #address: string;
    #viemClient: PublicClient;
    #ensClient: PublicClient;

    private get hasCustodialSigner() {
        return typeof this.#signer === "string";
    }

    private get secretKey() {
        if (typeof this.#signer === "string") {
            return null;
        }
        return this.#signer.secretKey;
    }

    private get signerAccount() {
        if (typeof this.#signer === "string") {
            return null;
        }
        return privateKeyToAccount(this.#signer.secretKey);
    }

    constructor(address: string, apiClient: CrossmintWalletsAPI, options: SmartWalletOptions) {
        super();
        this.#locator = getLocator(options.address, options.linkedUser);
        this.#address = address;
        this.#client = apiClient;
        this.#chain = options.chain;
        this.#signer = options.signer;

        this.#viemClient = createPublicClient({
            chain: getViemChain(options.chain),
            transport: http(options.provider),
        });

        this.#ensClient = createPublicClient({
            chain: mainnet,
            transport: http(options.options?.ensProvider ?? ""),
        });
    }

    getAddress() {
        return this.#address;
    }

    getChain() {
        return {
            type: "evm" as const,
            id: this.#viemClient.chain?.id ?? 0,
        };
    }

    async resolveAddress(address: string) {
        if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return address as `0x${string}`;
        }

        if (!this.#ensClient) {
            throw new Error("ENS provider is not configured.");
        }

        try {
            const resolvedAddress = (await this.#ensClient.getEnsAddress({
                name: normalize(address),
            })) as `0x${string}`;
            if (!resolvedAddress) {
                throw new Error("ENS name could not be resolved.");
            }
            return resolvedAddress as `0x${string}`;
        } catch (error) {
            throw new Error(`Failed to resolve ENS name: ${error}`);
        }
    }

    async signMessage(message: string) {
        const { id: signatureId, approvals } = await this.#client.signMessageForSmartWallet(
            this.#address,
            message,
            this.#chain,
            this.signerAccount?.address,
        );

        if (!this.hasCustodialSigner) {
            const account = this.signerAccount;
            if (!account) {
                throw new Error("Signer account is not available");
            }
            const toSign = approvals?.pending[0].message;
            const signature = await account.signMessage({
                message: { raw: toSign as `0x${string}` },
            });

            await this.#client.approveSignatureForSmartWallet(
                signatureId,
                this.#address,
                `evm-keypair:${this.signerAccount?.address}`,
                signature,
            );
        }

        while (true) {
            const latestSignature = await this.#client.checkSignatureStatus(signatureId, this.#address);

            if (latestSignature.status === "success") {
                if (!latestSignature.outputSignature) {
                    throw new Error("Signature is undefined");
                }

                return {
                    signature: latestSignature.outputSignature,
                };
            }

            if (latestSignature.status === "failed") {
                throw new Error("Signature failed");
            }

            await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
        }
    }

    async signTypedData(data: EVMTypedData) {
        const { id: signatureId, approvals } = await this.#client.signTypedDataForSmartWallet(
            this.#address,
            data,
            this.#chain,
            this.signerAccount?.address as `0x${string}`,
        );

        if (!this.hasCustodialSigner) {
            const account = this.signerAccount;
            if (!account) {
                throw new Error("Signer account is not available");
            }
            const toSign = approvals?.pending[0].message;
            const signature = await account.signMessage({
                message: { raw: toSign as `0x${string}` },
            });

            await this.#client.approveSignatureForSmartWallet(
                signatureId,
                this.#address,
                `evm-keypair:${this.signerAccount?.address}`,
                signature,
            );
        }

        while (true) {
            const latestSignature = await this.#client.checkSignatureStatus(signatureId, this.#address);

            if (latestSignature.status === "success") {
                if (!latestSignature.outputSignature) {
                    throw new Error("Signature is undefined");
                }

                return {
                    signature: latestSignature.outputSignature,
                };
            }

            if (latestSignature.status === "failed") {
                throw new Error("Signature failed");
            }

            await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
        }
    }

    async sendTransaction(transaction: EVMTransaction) {
        return await this._sendBatchOfTransactions([transaction]);
    }

    async sendBatchOfTransactions(transactions: EVMTransaction[]) {
        return await this._sendBatchOfTransactions(transactions);
    }

    async read(request: EVMReadRequest) {
        const { address, abi, functionName, args } = request;
        if (!abi) throw new Error("Read request must include ABI for EVM");

        const result = await this.#viemClient.readContract({
            address: await this.resolveAddress(address),
            abi,
            functionName,
            args,
        });

        return { value: result };
    }

    async balanceOf(address: string) {
        const resolvedAddress = await this.resolveAddress(address);
        const balance = await this.#viemClient.getBalance({
            address: resolvedAddress,
        });

        return {
            decimals: 18,
            symbol: "ETH",
            name: "Ethereum",
            value: formatUnits(balance, 18),
            inBaseUnits: balance.toString(),
        };
    }

    private async _sendBatchOfTransactions(transactions: EVMTransaction[]) {
        const transactionDatas = transactions.map((transaction) => {
            const { to: recipientAddress, abi, functionName, args, value } = transaction;

            return buildTransactionData({
                recipientAddress,
                abi,
                functionName,
                args,
                value,
            });
        });

        const transactionResponse = await this.#client.createTransactionForSmartWallet(
            this.#address,
            transactionDatas,
            this.#chain,
            this.signerAccount?.address as `0x${string}`,
        );

        if (!this.hasCustodialSigner) {
            const account = this.signerAccount;
            if (!account) {
                throw new Error("Signer account is not available");
            }
            const userOpHash = transactionResponse.approvals?.pending[0].message;

            if (!userOpHash) {
                throw new Error("User operation hash is not available");
            }
            const signature = await account.signMessage({
                message: { raw: userOpHash as `0x${string}` },
            });

            await this.#client.approveTransaction(this.#locator, transactionResponse.id, [
                {
                    signature,
                    signer: `evm-keypair:${this.signerAccount?.address}`,
                },
            ]);
        }

        while (true) {
            const latestTransaction = await this.#client.checkTransactionStatus(this.#locator, transactionResponse.id);

            if (latestTransaction.status === "success" || latestTransaction.status === "failed") {
                return {
                    hash: latestTransaction.onChain?.txId ?? "",
                    status: latestTransaction.status,
                };
            }

            await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
        }
    }
}

export function smartWalletFactory(crossmintClient: CrossmintApiClient) {
    const walletsApi = new CrossmintWalletsAPI(crossmintClient);
    return async function smartWallet(options: SmartWalletOptions) {
        const { address } = await walletsApi.getWallet(getLocator(options.address, options.linkedUser));
        return new SmartWalletClient(address, walletsApi, options);
    };
}
