import {
    http,
    type Config as WagmiConfig,
    createConfig,
    getAccount,
    getChainId,
    getEnsAddress,
    sendTransaction,
    signMessage,
    signTypedData,
    waitForTransactionReceipt,
    writeContract,
} from "@wagmi/core";
import { type Account } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { anvil } from "viem/chains";
import { Mock, beforeAll, describe, expect, test, vi } from "vitest";

// clients
import WagmiWalletClient from "./WagmiWalletClient";

vi.mock("@wagmi/core");

describe(WagmiWalletClient.name, () => {
    const hash = "0xmockedhash1234567890abcdef";
    const signature = "0xmockedsignature1234567890abcdef";
    let account: Account;
    let client: WagmiWalletClient;
    let wagmiConfig: WagmiConfig;

    beforeAll(() => {
        account = privateKeyToAccount(generatePrivateKey());
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
        (getEnsAddress as Mock).mockImplementation(vi.fn(async () => account.address));
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

    describe("getAddress", () => {
        test("should return the address", () => {
            const result = client.getAddress();

            expect(result).toBe(account.address);
        });

        test("should return the address", () => {
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
                const result = await client.resolveAddress("hello-humie.eth");
            } catch (error) {
                expect((error as Error).message).toMatch("failed to resolve ens name");

                return;
            }

            throw new Error("expect error when ens failed to be resolved");
        });
    });

    describe("signMessage", () => {
        test("should return the signed message", async () => {
            const result = await client.signMessage("hello humie");

            expect(result.signature).toBe(signature);
        });
    });
});
