import type { EVMTransaction } from "@goat-sdk/wallet-evm";
import {
    http,
    type GetBalanceReturnType,
    type ReadContractReturnType,
    type Config as WagmiConfig,
    createConfig,
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
import { type Abi, formatUnits, parseEther } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { anvil } from "viem/chains";
import { type Mock, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

// clients
import WagmiWalletClient from "./WagmiWalletClient";

vi.mock("@wagmi/core");

describe(WagmiWalletClient.name, () => {
    const abi: Abi = [
        {
            inputs: [],
            stateMutability: "nonpayable",
            type: "constructor",
        },
        {
            inputs: [],
            name: "getMessage",
            outputs: [
                {
                    internalType: "string",
                    name: "",
                    type: "string",
                },
            ],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [
                {
                    internalType: "string",
                    name: "_message",
                    type: "string",
                },
            ],
            name: "setMessage",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
    ];
    const account = privateKeyToAccount(generatePrivateKey());
    const balanceInWei = parseEther("1");
    const disconnectedFn = vi.fn(() => ({
        address: undefined,
        addresses: undefined,
        chain: undefined,
        chainId: undefined,
        connector: undefined,
        isConnected: false,
        isReconnecting: false,
        isConnecting: false,
        isDisconnected: true,
        status: "disconnected",
    }));
    const hash = "0xmockedhash1234567890abcdef";
    const message = "hello humie!";
    const signature = "0xmockedsignature1234567890abcdef";
    const toAccount = privateKeyToAccount(generatePrivateKey());
    let client: WagmiWalletClient;
    let wagmiConfig: WagmiConfig;

    beforeAll(() => {
        wagmiConfig = createConfig({
            chains: [anvil], // use a local network to avoid live networks
            transports: {
                [anvil.id]: http(),
            },
        });
        client = new WagmiWalletClient(wagmiConfig);

        // setup mocks
        (getAccount as Mock).mockImplementation(
            vi.fn(() => ({
                address: account.address,
                addresses: [account.address],
                chainId: anvil.id,
                chain: anvil,
                connector: undefined,
                isConnected: true,
                isConnecting: false,
                isDisconnected: false,
                isReconnecting: false,
                status: "connected",
            })),
        );
        (getChainId as Mock).mockImplementation(vi.fn(() => anvil.id));
        (getBalance as Mock).mockImplementation(
            vi.fn<[], Promise<GetBalanceReturnType>>(async () => ({
                decimals: anvil.nativeCurrency.decimals,
                formatted: "",
                symbol: anvil.nativeCurrency.symbol,
                value: balanceInWei,
            })),
        );
        (getEnsAddress as Mock).mockImplementation(vi.fn(async () => account.address));
        (readContract as Mock).mockImplementation(
            vi.fn<[], Promise<ReadContractReturnType<typeof abi, "getMessage">>>(async () => message),
        );
        (sendTransaction as Mock).mockImplementation(vi.fn(async () => hash));
        (signMessage as Mock).mockImplementation(vi.fn(async () => signature));
        (signTypedData as Mock).mockImplementation(vi.fn(async () => signature));
        (waitForTransactionReceipt as Mock).mockImplementation(
            vi.fn(async () => ({
                transactionHash: hash,
            })),
        );
        (writeContract as Mock).mockImplementation(vi.fn(async () => hash));
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("balanceOf", () => {
        test("should return the balance", async () => {
            const { decimals, inBaseUnits, name, symbol, value } = await client.balanceOf(account.address);

            expect(decimals).toBe(anvil.nativeCurrency.decimals);
            expect(inBaseUnits).toBe(String(balanceInWei));
            expect(name).toBe(anvil.nativeCurrency.name);
            expect(symbol).toBe(anvil.nativeCurrency.symbol);
            expect(value).toBe(formatUnits(balanceInWei, anvil.nativeCurrency.decimals));
        });
    });

    describe("getAddress", () => {
        test("should return the address", () => {
            const result = client.getAddress();

            expect(result).toBe(account.address);
        });

        test("should return the empty address if it is not connected", () => {
            (getAccount as Mock).mockImplementationOnce(disconnectedFn);

            const result = client.getAddress();

            expect(result).toBe("");
        });
    });

    describe("getChain", () => {
        test("should return the chain details", () => {
            const { id, type } = client.getChain();

            expect(type).toBe("evm");
            expect(id).toBe(anvil.id);
        });
    });

    describe("isConnected", () => {
        test("should be connected", () => {
            const result = client.isConnected();

            expect(result).toBe(true);
        });

        test("should be disconnected", () => {
            (getAccount as Mock).mockImplementationOnce(
                vi.fn(() => ({
                    address: undefined,
                    addresses: undefined,
                    chain: undefined,
                    chainId: undefined,
                    connector: undefined,
                    isConnected: false,
                    isReconnecting: false,
                    isConnecting: false,
                    isDisconnected: true,
                    status: "disconnected",
                })),
            );

            const result = client.isConnected();

            expect(result).toBe(false);
        });
    });

    describe("read", () => {
        test("should read the contract", async () => {
            const result = await client.read({
                abi,
                address: account.address,
                functionName: "getMessage",
            });

            expect(result.value).toBe(message);
        });
    });

    describe("resolveAddress", () => {
        test("should return the address if it is an evm address", async () => {
            const result = await client.resolveAddress(account.address);

            expect(result).toBe(account.address);
        });

        test("should return an address if it is an ens", async () => {
            const result = await client.resolveAddress("hello-humie.eth");

            expect(result).toBe(account.address);
        });

        test("should throw an error if the ens cannot be resolved", async () => {
            (getEnsAddress as Mock).mockImplementationOnce(vi.fn(async () => undefined));

            try {
                await client.resolveAddress("hello-humie.eth");
            } catch (error) {
                expect((error as Error).message).toMatch("Failed to resolve ENS name");

                return;
            }

            throw new Error("expect error when ens failed to be resolved");
        });
    });

    describe("sendTransaction", () => {
        test("should throw an error if it is not connected", async () => {
            (getAccount as Mock).mockImplementationOnce(disconnectedFn);

            try {
                await client.sendTransaction({
                    to: toAccount.address,
                    value: balanceInWei,
                });
            } catch (error) {
                expect((error as Error).message).toBe("No account connected");

                return;
            }

            throw new Error("expect error for not being connected when sending a transaction");
        });

        test("should send a transfer transaction", async () => {
            const args: EVMTransaction = {
                to: toAccount.address,
                value: balanceInWei,
            };
            const result = await client.sendTransaction(args);

            expect(result.hash).toBe(hash);
            expect(sendTransaction as Mock).toBeCalledWith(wagmiConfig, args);
            expect(writeContract as Mock).not.toBeCalled();
        });

        test("should throw an error if no function name has been specified", async () => {
            try {
                await client.sendTransaction({
                    abi,
                    to: toAccount.address,
                });
            } catch (error) {
                expect((error as Error).message).toBe("Function name is required for contract calls");

                return;
            }

            throw new Error("expect error for for no function name specified");
        });

        test("should send a write contract request", async () => {
            const contractAddress = privateKeyToAccount(generatePrivateKey()).address;
            const args: EVMTransaction = {
                abi,
                args: ["What is the meaning of life?"],
                to: contractAddress,
                functionName: "setMessage",
            };
            const request = {
                address: contractAddress,
                abi,
                functionName: args.functionName,
                args: args.args,
                chain: anvil,
                account: null,
            };

            (simulateContract as Mock).mockImplementationOnce(
                vi.fn(async () => ({
                    request,
                })),
            );

            const result = await client.sendTransaction(args);

            expect(result.hash).toBe(hash);
            expect(simulateContract as Mock).toBeCalledWith(wagmiConfig, {
                abi,
                address: contractAddress,
                args: args.args,
                functionName: args.functionName,
            });
            expect(sendTransaction as Mock).not.toBeCalled();
            expect(writeContract as Mock).toBeCalledWith(wagmiConfig, request);
        });
    });

    describe("signMessage", () => {
        test("should return the signed message", async () => {
            const result = await client.signMessage("hello humie");

            expect(result.signature).toBe(signature);
        });
    });
});
