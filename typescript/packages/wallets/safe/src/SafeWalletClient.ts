import { EVMReadRequest, EVMSmartWalletClient, EVMTransaction, EVMTypedData } from "@goat-sdk/wallet-evm";
import Safe, { PredictedSafeProps, SafeAccountConfig, SigningMethod, Eip1193Provider } from "@safe-global/protocol-kit";
import {
    http,
    Account,
    Address,
    Chain,
    type WalletClient as ViemWalletClient,
    createWalletClient,
    formatUnits,
    publicActions,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import { normalize } from "viem/ens";

class SafeWalletError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "SafeWalletError";
    }
}

class SafeNotInitializedError extends SafeWalletError {
    constructor() {
        super("Safe account not initialized");
    }
}

class SafeNotDeployedError extends SafeWalletError {
    constructor() {
        super("Safe is not deployed");
    }
}

class ChainNotConfiguredError extends SafeWalletError {
    constructor() {
        super("Chain not properly configured");
    }
}

export class SafeWalletClient extends EVMSmartWalletClient {
    #client: ViemWalletClient;
    #account: Account;
    #safeAccount: Safe | undefined;
    #safeAddress: Address | undefined;
    #isDeployed = false;
    #saltNonce?: string;
    #privateKey: `0x${string}`;

    constructor(privateKey: `0x${string}`, chain: Chain, saltNonce?: string) {
        super();
        if (!privateKey || !privateKey.startsWith("0x")) {
            throw new Error("Invalid private key format");
        }
        this.#privateKey = privateKey;
        this.#client = createWalletClient({
            account: privateKeyToAccount(privateKey),
            chain: chain,
            transport: http(),
        });
        if (!this.#client.account) {
            throw new Error("Client does not have an account");
        }
        this.#account = this.#client.account;
        this.#saltNonce = saltNonce;
    }

    async #initializeSafeAccount(): Promise<void> {
        if (!this.#client.chain?.rpcUrls.default.http[0]) {
            throw new ChainNotConfiguredError();
        }

        const safeAccountConfig: SafeAccountConfig = {
            owners: [this.#account.address],
            threshold: 1,
        };

        const predictedSafe: PredictedSafeProps = {
            safeAccountConfig,
            safeDeploymentConfig: {
                saltNonce: this.#saltNonce ?? "0",
            },
        };

        const safeConfig =
            this.#isDeployed && this.#safeAddress
                ? {
                      provider: this.#client.chain.rpcUrls.default.http[0],
                      signer: this.#account.address,
                      safeAddress: this.#safeAddress,
                  }
                : {
                      provider: this.#client.chain.rpcUrls.default.http[0],
                      signer: this.#account.address,
                      predictedSafe,
                  };

        try {
            this.#safeAccount = await Safe.init(safeConfig);
            this.#safeAddress = (await this.#safeAccount.getAddress()) as Address;
            this.#isDeployed = await this.isDeployed();
        } catch (error) {
            throw new SafeWalletError(
                `Failed to initialize Safe: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }

    getAddress(): string {
        if (!this.#safeAddress) throw new SafeNotInitializedError();
        return this.#safeAddress;
    }

    async initialize(): Promise<void> {
        if (!this.#safeAccount) {
            await this.#initializeSafeAccount();
        }
    }

    async deploySafe() {
        if (!this.#safeAccount) throw new SafeNotInitializedError();
        if (this.#isDeployed) throw new SafeWalletError("Safe is already deployed");

        try {
            const deploymentTransaction = await this.#safeAccount.createSafeDeploymentTransaction();
            const transactionHash = await this.#client.sendTransaction({
                account: this.#account,
                to: deploymentTransaction.to as `0x${string}`,
                value: 0n,
                data: deploymentTransaction.data as `0x${string}`,
                chain: this.#client.chain,
            });

            await this.#client.extend(publicActions).waitForTransactionReceipt({ hash: transactionHash });
            this.#isDeployed = true;
            await this.#initializeSafeAccount();
            return { hash: transactionHash };
        } catch (error) {
            throw new SafeWalletError(
                `Failed to deploy Safe: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }

    async #ensureSafeInitialized(): Promise<void> {
        if (!this.#safeAccount) {
            await this.#initializeSafeAccount();
        }
    }

    async #ensureSafeDeployed(): Promise<void> {
        await this.#ensureSafeInitialized();
        if (!this.#isDeployed) {
            throw new SafeNotDeployedError();
        }
    }

    async #createAndExecuteTransaction(metaTransactions: Array<{ to: string; value: string; data: string }>) {
        const transaction = await this.#safeAccount?.createTransaction({ transactions: metaTransactions });
        if (!transaction) throw new SafeWalletError("Failed to create Safe transaction");

        const result = await this.#safeAccount?.executeTransaction(transaction);
        if (!result) throw new SafeWalletError("Failed to execute Safe transaction");

        return result;
    }

    async sendBatchOfTransactions(transactions: EVMTransaction[]): Promise<{ hash: string }> {
        await this.#ensureSafeDeployed();

        try {
            const metaTransactions = transactions.map((tx) => ({
                to: tx.to,
                value: tx.value?.toString() ?? "0",
                data: tx.data ?? "0x",
            }));

            const result = await this.#createAndExecuteTransaction(metaTransactions);
            return { hash: result.hash };
        } catch (error) {
            throw new SafeWalletError(
                `Failed to send batch transactions: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }

    async sendTransaction(transaction: EVMTransaction): Promise<{ hash: string }> {
        await this.#ensureSafeDeployed();
        try {
            const metaTransaction = {
                to: transaction.to,
                value: transaction.value?.toString() ?? "0",
                data: transaction.data ?? "0x",
            };

            const result = await this.#createAndExecuteTransaction([metaTransaction]);
            return { hash: result.hash };
        } catch (error) {
            throw new SafeWalletError(
                `Failed to send transaction: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }

    async read(request: EVMReadRequest) {
        const { address, abi, functionName, args } = request;
        if (!abi) throw new Error("Read request must include ABI for EVM");

        const result = await this.#client.extend(publicActions).readContract({
            address: await this.resolveAddress(address),
            abi,
            functionName,
            args,
        });

        return { value: result };
    }

    async resolveAddress(address: string): Promise<`0x${string}`> {
        if (!this.#safeAccount) throw new Error("Safe account not initialized");
        if (/^0x[a-fA-F0-9]{40}$/.test(address)) return address as `0x${string}`;

        try {
            const resolvedAddress = (await this.#client.extend(publicActions).getEnsAddress({
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
        await this.#ensureSafeDeployed();
        if (!this.#safeAccount) throw new SafeNotInitializedError();

        try {
            const safeMessage = this.#safeAccount.createMessage(message);
            const signature = await this.#safeAccount.signMessage(safeMessage, SigningMethod.ETH_SIGN);
            return { signature: signature.encodedSignatures() };
        } catch (error) {
            throw new SafeWalletError(
                `Failed to sign message: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }

    async #createTypedDataDomain(data: EVMTypedData) {
        const domainFields = Object.entries(data.domain)
            .filter(([key]) => key !== "chainId")
            .map(([name, value]) => ({
                name,
                type: typeof value === "string" ? "string" : "uint256",
            }));

        return {
            ...domainFields,
            chainId: this.#client.chain?.id ?? 0,
        };
    }

    async #createTypedDataTypes(data: EVMTypedData, domainFields: Array<{ name: string; type: string }>) {
        const types = Object.entries(data.types).reduce(
            (acc, [key, value]) => {
                acc[key] = Array.isArray(value) ? value : [];
                return acc;
            },
            {} as Record<string, Array<{ name: string; type: string }>>,
        );

        return {
            EIP712Domain: [{ name: "chainId", type: "uint256" }, ...domainFields],
            ...types,
        };
    }

    async signTypedData(data: EVMTypedData) {
        await this.#ensureSafeDeployed();
        if (!this.#safeAccount) throw new SafeNotInitializedError();

        try {
            const domainFields = Object.entries(data.domain)
                .filter(([key]) => key !== "chainId")
                .map(([name, value]) => ({
                    name,
                    type: typeof value === "string" ? "string" : "uint256",
                }));

            const typeData = {
                domain: await this.#createTypedDataDomain(data),
                message: data.message,
                types: await this.#createTypedDataTypes(data, domainFields),
                primaryType: data.primaryType,
            };

            const safeMessage = this.#safeAccount.createMessage(typeData);
            const signature = await this.#safeAccount.signMessage(safeMessage, SigningMethod.ETH_SIGN);
            return { signature: signature.encodedSignatures() };
        } catch (error) {
            throw new SafeWalletError(
                `Failed to sign typed data: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }

    async balanceOf(address: string) {
        const resolvedAddress = await this.resolveAddress(address);
        const balance = await this.#client.extend(publicActions).getBalance({
            address: resolvedAddress,
        });

        const chain = this.#client.chain ?? mainnet;

        return {
            value: formatUnits(BigInt(balance), chain.nativeCurrency.decimals),
            decimals: chain.nativeCurrency.decimals,
            symbol: chain.nativeCurrency.symbol,
            name: chain.nativeCurrency.name,
            inBaseUnits: balance.toString(),
        };
    }

    getChain() {
        if (!this.#client.chain) throw new Error("Chain not initialized");
        return {
            type: "evm" as const,
            id: this.#client.chain.id,
        };
    }

    async isDeployed() {
        if (!this.#safeAccount) throw new Error("Safe account not initialized");
        if (!this.#safeAddress) throw new Error("Safe address not initialized");
        if (this.#isDeployed) return true;

        const isDeployed = await this.#client.extend(publicActions).getCode({
            address: this.#safeAddress,
        });

        this.#isDeployed = Boolean(isDeployed);
        if (isDeployed && this.#client.chain?.rpcUrls.default.http[0]) {
            this.#safeAccount = await Safe.init({
                signer: this.#privateKey,
                safeAddress: this.#safeAddress,
                provider: { request: this.#client.request } as Eip1193Provider,
            });
        }
        return this.#isDeployed;
    }
}

export async function safe(privateKey: `0x${string}`, chain: Chain, saltNonce?: string): Promise<SafeWalletClient> {
    const wallet = new SafeWalletClient(privateKey, chain, saltNonce);
    await wallet.initialize();
    if (!(await wallet.isDeployed())) {
        await wallet.deploySafe();
    }
    return wallet;
}
