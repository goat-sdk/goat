import type { Balance, EvmChain, Signature } from "@goat-sdk/core";
import {
    type EVMReadRequest,
    type EVMReadResult,
    type EVMTransaction,
    type EVMTypedData,
    EVMWalletClient,
} from "@goat-sdk/wallet-evm";
import {
    type Config as WagmiConfig,
    getAccount,
    getBalance,
    getChainId,
    getEnsAddress,
    readContract,
    sendTransaction,
    signMessage,
    signTypedData,
    simulateContract,
    waitForTransactionReceipt,
    writeContract,
} from "@wagmi/core";
import { type Address, type Hash, encodeFunctionData, formatUnits } from "viem";
import { normalize } from "viem/ens";

// types
import type { EVMTransactionResult } from "../types";

export default class WagmiWalletClient extends EVMWalletClient {
    // private variables
    private readonly _config: WagmiConfig;

    constructor(config: WagmiConfig) {
        super();

        this._config = config;
    }

    /**
     * private methods
     */

    private _address(): Address | undefined {
        const { address } = getAccount(this._config);

        return address;
    }

    private async _waitForReceipt(hash: Hash): Promise<EVMTransactionResult> {
        const { transactionHash } = await waitForTransactionReceipt(this._config, {
            hash,
        });

        return {
            hash: transactionHash,
        };
    }

    /**
     * public methods
     */

    public async balanceOf(address: string): Promise<Balance> {
        const { decimals, symbol, value } = await getBalance(this._config, {
            address: address as Address,
        });
        const { chain } = getAccount(this._config);

        return {
            value: formatUnits(BigInt(value), decimals),
            decimals,
            symbol,
            name: chain?.nativeCurrency.name || symbol,
            inBaseUnits: String(value),
        };
    }

    public getAddress(): string {
        return this._address() ?? "";
    }

    public getChain(): EvmChain {
        return {
            type: "evm",
            id: getChainId(this._config),
        };
    }

    public isConnected(): boolean {
        const { isConnected } = getAccount(this._config);

        return isConnected;
    }

    public async read(request: EVMReadRequest): Promise<EVMReadResult> {
        const { address, abi, functionName, args } = request;

        if (!abi) {
            throw new Error("read request must include abi for evm");
        }

        return {
            value: await readContract(this._config, {
                address: await this.resolveAddress(address),
                abi,
                functionName,
                args,
            }),
        };
    }

    public async resolveAddress(address: string): Promise<Address> {
        if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return address as Address;
        }

        try {
            const resolvedAddress = await getEnsAddress(this._config, {
                name: normalize(address),
            });

            if (!resolvedAddress) {
                throw new Error("failed to resolve ens name");
            }

            return resolvedAddress;
        } catch (error) {
            throw new Error(`failed to resolve ens name: ${error}`);
        }
    }

    public async sendTransaction({ to, abi, functionName, args, value, options, data }: EVMTransaction) {
        let hash: Hash;
        let paymasterParams: Record<"paymaster" | "paymasterInput", Address> | null = null;
        let toAddress: Address;

        if (!this.isConnected()) {
            throw new Error("No account connected");
        }

        if (options?.paymaster?.address && options?.paymaster?.input) {
            paymasterParams = {
                paymaster: options.paymaster.address,
                paymasterInput: options.paymaster.input,
            };
        }

        toAddress = await this.resolveAddress(to);

        // if there is no abi, this will be a simple transfer call
        if (!abi) {
            hash = await sendTransaction(this._config, {
                data,
                to: toAddress,
                value,
                ...paymasterParams,
            });

            return await this._waitForReceipt(hash);
        }

        if (!functionName) {
            throw new Error("Function name is required for contract calls");
        }

        const { request } = await simulateContract(this._config, {
            abi,
            address: toAddress,
            args,
            functionName,
            value: value,
        });

        // without paymaster, we can pass the result of the simulate contract if it was successful
        if (!paymasterParams) {
            hash = await writeContract(this._config, request);

            return await this._waitForReceipt(hash);
        }

        hash = await sendTransaction(this._config, {
            to: request.address,
            data: encodeFunctionData({
                abi,
                args,
                functionName,
            }),
            value: request.value,
            ...paymasterParams,
        });

        return await this._waitForReceipt(hash);
    }

    public async signMessage(message: string): Promise<Signature> {
        const signature = await signMessage(this._config, {
            message,
        });

        return {
            signature,
        };
    }

    public async signTypedData({ domain, message, primaryType, types }: EVMTypedData): Promise<Signature> {
        const signature = await signTypedData(this._config, {
            account: this._address(),
            domain: {
                ...domain,
                chainId: typeof domain.chainId === "bigint" ? Number(domain.chainId) : domain.chainId,
            },
            message,
            primaryType,
            types,
        });

        return { signature };
    }
}
