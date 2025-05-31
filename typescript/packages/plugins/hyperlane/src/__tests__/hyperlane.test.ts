import { http, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia, celoAlfajores, optimismSepolia, sepolia, zksyncSepoliaTestnet } from "viem/chains";
// import { viem } from "@goat-sdk/wallet-viem"; // TODO: update import
import { viem } from "../../../../wallets/viem/dist/ViemEVMWalletClient.js";
import { HyperlaneService } from "../../dist/hyperlane.service.js";
import { Isms, WarpRouteToken } from "../types.js";

const {
    WALLET_PRIVATE_KEY,
    WALLET_ADDRESS: WALLET_ADDRESS_UNTYPED,
    SEPOLIA_RPC,
    BASE_RPC,
    ALFAJORES_RPC,
    OPTIMISM_RPC,
    ZKSYNC_RPC,
} = process.env;

if (
    !WALLET_PRIVATE_KEY ||
    !WALLET_ADDRESS_UNTYPED ||
    !SEPOLIA_RPC ||
    !BASE_RPC ||
    !ALFAJORES_RPC ||
    !OPTIMISM_RPC ||
    !ZKSYNC_RPC
) {
    throw new Error(
        "Testing hyperlane requires the following environment variables to be set: " +
            " WALLET_PRIVATE_KEY, WALLET_ADDRESS, SEPOLIA_RPC, BASE_RPC, ALFAJORES_RPC, OPTIMISM_RPC, ZKSYNC_RPC",
    );
}

const account = privateKeyToAccount(WALLET_PRIVATE_KEY as `0x${string}`);
const WALLET_ADDRESS = WALLET_ADDRESS_UNTYPED.toLowerCase() as `0x${string}`;

const clients = {
    sepolia: viem(createWalletClient({ account, transport: http(SEPOLIA_RPC), chain: sepolia })),
    base: viem(createWalletClient({ account, transport: http(BASE_RPC), chain: baseSepolia })),
    alfajores: viem(createWalletClient({ account, transport: http(ALFAJORES_RPC), chain: celoAlfajores })),
    optimism: viem(createWalletClient({ account, transport: http(OPTIMISM_RPC), chain: optimismSepolia })),
    zksync: viem(createWalletClient({ account, transport: http(ZKSYNC_RPC), chain: zksyncSepoliaTestnet })),
};

const hyperlane = new HyperlaneService();

const walletAddressRegex = new RegExp(`^0x[0-9a-f]+${WALLET_ADDRESS.slice(2)}$`);
const hex40 = /^0x[0-9a-fA-F]{40}$/;
const hex64 = /^0x[0-9a-fA-F]{64}$/;
const hexString = /^0x[0-9a-fA-F]+$/;
const numberString = /^\d+$/;
const sepoliaMailbox = "0xfFAEF09B3cd11D9b20d1a19bECca54EEC2884766";
const zksyncsepoliaMailbox = "0x61e3BE234D7EE7b1e2a1fA84027105c733b91545";
const sepoliaTestnetValidator = "0x28b91d3dc0d0e138adf914105d88c8830cc66f4e";
const basesepoliaLinkTokenContractAddress = "0xe4ab69c077896252fafbd49efd26b5d171a32410";
const zksyncsepoliaLinkTokenContractAddress = "0x23A1aFD896c8c8876AF46aDc38521f4432658d1e";

describe("hyperlane.sendMessage and hyperlane.readMessage", () => {
    const originChain = "sepolia";
    const destinationChain = "basesepolia";

    it("sends a message and verifies origin readMessage response", async () => {
        const sendMessageResponse = await hyperlane.sendMessage(clients.sepolia, {
            originChain,
            destinationChain,
            destinationAddress: WALLET_ADDRESS,
            message: "hello",
        });

        const parsedSend = JSON.parse(sendMessageResponse);

        expect(parsedSend).toMatchObject({
            message: "Message sent successfully",
            messageId: expect.stringMatching(hex64),
            transactionHash: expect.stringMatching(hex64),
            isDelivered: false,
            originDomain: 11155111,
            destinationDomain: 84532,
            dispatchedMessage: {
                id: expect.stringMatching(hex64),
                message: expect.stringMatching(hexString),
                parsed: {
                    version: expect.any(Number),
                    nonce: expect.any(Number),
                    origin: 11155111,
                    sender: expect.stringMatching(walletAddressRegex),
                    destination: 84532,
                    recipient: expect.stringMatching(walletAddressRegex),
                    body: "0x68656c6c6f",
                    originChain: "sepolia",
                    destinationChain: "basesepolia",
                },
            },
        });

        const messageId = parsedSend.messageId;

        const readMessageResponseOrig = await hyperlane.readMessage({
            chain: originChain,
            messageId,
        });

        expect(JSON.parse(readMessageResponseOrig)).toMatchObject({
            message: "Message is pending delivery",
            details: {
                id: messageId,
                status: "PENDING",
                chain: {
                    name: "sepolia",
                    domainId: 11155111,
                },
                content: {
                    raw: expect.stringMatching(hexString),
                    decoded: "0x68656c6c6f",
                },
                metadata: {
                    sender: expect.stringMatching(hexString),
                    recipient: expect.stringMatching(hexString),
                    nonce: expect.any(Number),
                    originChain: "sepolia",
                    destinationChain: "basesepolia",
                },
            },
        });

        // TODO: verify destination chain response structure
        // const readMessageResponseDest = await hyperlane.readMessage({
        //     chain: destinationChain,
        //     messageId,
        // });

        // expect(readMessageResponseDest).toBeDefined(); // Add more specific assertions if desired
    });
});

describe("hyperlane.getMailbox", () => {
    it("retrieves the mailbox for a given chain", async () => {
        const originChain = "sepolia";

        const response = await hyperlane.getMailbox({
            chain: originChain,
        });

        expect(JSON.parse(response)).toEqual({
            message: "Mailbox address retrieved successfully",
            details: {
                chain: "sepolia",
                mailboxAddress: sepoliaMailbox,
                chainInfo: {
                    name: "sepolia",
                    chainId: 11155111,
                    domainId: 11155111,
                    protocol: "ethereum",
                    rpcUrls: expect.arrayContaining([
                        expect.objectContaining({
                            http: expect.stringMatching(/^https?:\/\/.+/),
                        }),
                    ]),
                },
            },
        });
    });
});

describe("hyperlane.getDeployedContracts", () => {
    it("retrieves deployed contracts for a given chain and contract type", async () => {
        const response = await hyperlane.getDeployedContracts({
            chain: "sepolia",
            contractType: "mailbox",
        });

        expect(JSON.parse(response)).toEqual({
            message: "Deployed contracts retrieved successfully",
            details: {
                chain: "sepolia",
                chainInfo: {
                    name: "sepolia",
                    chainId: 11155111,
                    domainId: 11155111,
                },
                contracts: {
                    mailbox: expect.stringMatching(hex40),
                },
            },
        });
    });
});

describe("hyperlane.deployIsm", () => {
    // Test all ISM types
    it("sets up a trustedRelayerIsm on sepolia", async () => {
        const response = await hyperlane.deployIsm(clients.sepolia, {
            type: "trustedRelayerIsm",
            mailbox: sepoliaMailbox,
            relayer: WALLET_ADDRESS,
            destinationChain: "sepolia",
        });

        expect(JSON.parse(response)).toEqual({
            message: "ISM deployed successfully",
            details: {
                type: "trustedRelayerIsm",
                address: expect.stringMatching(hex40),
                destinationChain: "sepolia",
                config: {
                    type: "trustedRelayerIsm",
                    relayer: WALLET_ADDRESS,
                },
            },
        });
    });

    it("sets up a merkleRootMultisigIsm on sepolia", async () => {
        const response = await hyperlane.deployIsm(clients.sepolia, {
            type: "merkleRootMultisigIsm",
            mailbox: sepoliaMailbox,
            validators: [
                { signingAddress: WALLET_ADDRESS },
                { signingAddress: "0x1234567890123456789012345678901234567890" },
            ],
            threshold: 1,
            destinationChain: "sepolia",
        });

        expect(JSON.parse(response)).toEqual({
            message: "ISM deployed successfully",
            details: {
                type: "merkleRootMultisigIsm",
                address: expect.stringMatching(hex40),
                destinationChain: "sepolia",
                config: {
                    type: "merkleRootMultisigIsm",
                    validators: [WALLET_ADDRESS, "0x1234567890123456789012345678901234567890"],
                    threshold: 1,
                },
            },
        });
    });

    it("sets up a messageIdMultisigIsm on sepolia", async () => {
        const response = await hyperlane.deployIsm(clients.sepolia, {
            type: "messageIdMultisigIsm",
            mailbox: sepoliaMailbox,
            validators: [
                { signingAddress: WALLET_ADDRESS },
                { signingAddress: "0x1234567890123456789012345678901234567890" },
            ],
            threshold: 1,
            destinationChain: "sepolia",
        });

        expect(JSON.parse(response)).toEqual({
            message: "ISM deployed successfully",
            details: {
                type: "messageIdMultisigIsm",
                address: expect.stringMatching(hex40),
                destinationChain: "sepolia",
                config: {
                    type: "messageIdMultisigIsm",
                    validators: [WALLET_ADDRESS, "0x1234567890123456789012345678901234567890"],
                    threshold: 1,
                },
            },
        });
    });

    it("sets up a storageMerkleRootMultisigIsm on sepolia", async () => {
        const response = await hyperlane.deployIsm(clients.sepolia, {
            type: "storageMerkleRootMultisigIsm",
            mailbox: sepoliaMailbox,
            validators: [
                { signingAddress: WALLET_ADDRESS },
                { signingAddress: "0x1234567890123456789012345678901234567890" },
            ],
            threshold: 1,
            destinationChain: "sepolia",
        });

        expect(JSON.parse(response)).toEqual({
            message: "ISM deployed successfully",
            details: {
                type: "storageMerkleRootMultisigIsm",
                address: expect.stringMatching(hex40),
                destinationChain: "sepolia",
                config: {
                    type: "storageMerkleRootMultisigIsm",
                    validators: [WALLET_ADDRESS, "0x1234567890123456789012345678901234567890"],
                    threshold: 1,
                },
            },
        });
    });

    it("sets up a storageMessageIdMultisigIsm on sepolia", async () => {
        const response = await hyperlane.deployIsm(clients.sepolia, {
            type: "storageMessageIdMultisigIsm",
            mailbox: sepoliaMailbox,
            validators: [
                { signingAddress: WALLET_ADDRESS },
                { signingAddress: "0x1234567890123456789012345678901234567890" },
            ],
            threshold: 1,
            destinationChain: "sepolia",
        });

        expect(JSON.parse(response)).toEqual({
            message: "ISM deployed successfully",
            details: {
                type: "storageMessageIdMultisigIsm",
                address: expect.stringMatching(hex40),
                destinationChain: "sepolia",
                config: {
                    type: "storageMessageIdMultisigIsm",
                    validators: [WALLET_ADDRESS, "0x1234567890123456789012345678901234567890"],
                    threshold: 1,
                },
            },
        });
    });

    it("sets up a weightedMerkleRootMultisigIsm on sepolia", async () => {
        const response = await hyperlane.deployIsm(clients.sepolia, {
            type: "weightedMerkleRootMultisigIsm",
            mailbox: sepoliaMailbox,
            validators: [
                { signingAddress: WALLET_ADDRESS, weight: 2 },
                { signingAddress: "0x1234567890123456789012345678901234567890", weight: 1 },
            ],
            thresholdWeight: 2,
            destinationChain: "sepolia",
        });

        expect(JSON.parse(response)).toEqual({
            message: "ISM deployed successfully",
            details: {
                type: "weightedMerkleRootMultisigIsm",
                address: expect.stringMatching(hex40),
                destinationChain: "sepolia",
                config: {
                    type: "weightedMerkleRootMultisigIsm",
                    validators: [
                        { signingAddress: WALLET_ADDRESS, weight: 2 },
                        { signingAddress: "0x1234567890123456789012345678901234567890", weight: 1 },
                    ],
                    thresholdWeight: 2,
                },
            },
        });
    });

    it("sets up a weightedMessageIdMultisigIsm on sepolia", async () => {
        const response = await hyperlane.deployIsm(clients.sepolia, {
            type: "weightedMessageIdMultisigIsm",
            mailbox: sepoliaMailbox,
            validators: [
                { signingAddress: WALLET_ADDRESS, weight: 2 },
                { signingAddress: "0x1234567890123456789012345678901234567890", weight: 1 },
            ],
            thresholdWeight: 2,
            destinationChain: "sepolia",
        });

        expect(JSON.parse(response)).toEqual({
            message: "ISM deployed successfully",
            details: {
                type: "weightedMessageIdMultisigIsm",
                address: expect.stringMatching(hex40),
                destinationChain: "sepolia",
                config: {
                    type: "weightedMessageIdMultisigIsm",
                    validators: [
                        { signingAddress: WALLET_ADDRESS, weight: 2 },
                        { signingAddress: "0x1234567890123456789012345678901234567890", weight: 1 },
                    ],
                    thresholdWeight: 2,
                },
            },
        });
    });

    it("sets up a pausableIsm on sepolia", async () => {
        const response = await hyperlane.deployIsm(clients.sepolia, {
            type: "pausableIsm",
            mailbox: sepoliaMailbox,
            owner: WALLET_ADDRESS,
            paused: false,
            ownerOverrides: {
                "11155420": "0x1234567890123456789012345678901234567890",
            },
            destinationChain: "sepolia",
        });

        expect(JSON.parse(response)).toEqual({
            message: "ISM deployed successfully",
            details: {
                type: "pausableIsm",
                address: expect.stringMatching(hex40),
                destinationChain: "sepolia",
                config: {
                    type: "pausableIsm",
                    owner: WALLET_ADDRESS,
                    paused: false,
                    ownerOverrides: {
                        "11155420": "0x1234567890123456789012345678901234567890",
                    },
                },
            },
        });
    });

    it("sets up a testIsm on sepolia", async () => {
        const response = await hyperlane.deployIsm(clients.sepolia, {
            type: "testIsm",
            mailbox: sepoliaMailbox,
            destinationChain: "sepolia",
        });

        expect(JSON.parse(response)).toEqual({
            message: "ISM deployed successfully",
            details: {
                type: "testIsm",
                address: expect.stringMatching(hex40),
                destinationChain: "sepolia",
                config: {
                    type: "testIsm",
                },
            },
        });
    });

    // TODO: deployIsm tests below this fail
    it("sets up an opStackIsm on sepolia", async () => {
        const response = await hyperlane.deployIsm(clients.sepolia, {
            type: "opStackIsm",
            mailbox: sepoliaMailbox,
            originChain: "optimism",
            nativeBridge: "0x1234567890123456789012345678901234567890",
            destinationChain: "sepolia",
        });

        expect(JSON.parse(response)).toEqual({
            message: "ISM deployed successfully",
            details: {
                type: "opStackIsm",
                address: expect.stringMatching(hex40),
                destinationChain: "sepolia",
                config: {
                    type: "opStackIsm",
                    originChain: "optimism",
                    nativeBridge: "0x1234567890123456789012345678901234567890",
                },
            },
        });
    });

    it("sets up an arbL2ToL1Ism on sepolia", async () => {
        const response = await hyperlane.deployIsm(clients.sepolia, {
            type: "arbL2ToL1Ism",
            mailbox: sepoliaMailbox,
            bridge: "0x1234567890123456789012345678901234567890",
            destinationChain: "sepolia",
        });

        expect(JSON.parse(response)).toEqual({
            message: "ISM deployed successfully",
            details: {
                type: "arbL2ToL1Ism",
                address: expect.stringMatching(hex40),
                destinationChain: "sepolia",
                config: {
                    type: "arbL2ToL1Ism",
                    bridge: "0x1234567890123456789012345678901234567890",
                },
            },
        });
    });

    it("sets up a routingIsm on sepolia", async () => {
        const response = await hyperlane.deployIsm(clients.sepolia, {
            type: "routingIsm",
            mailbox: sepoliaMailbox,
            domains: {
                "11155420": "0x1234567890123456789012345678901234567890",
            },
            destinationChain: "sepolia",
        });

        expect(JSON.parse(response)).toEqual({
            message: "ISM deployed successfully",
            details: {
                type: "routingIsm",
                address: expect.stringMatching(hex40),
                config: {
                    type: "routingIsm",
                    domains: {
                        "11155420": "0x1234567890123456789012345678901234567890",
                    },
                    destinationChain: "sepolia",
                },
            },
        });
    });

    it("sets up an aggregationIsm on sepolia", async () => {
        const response = await hyperlane.deployIsm(clients.sepolia, {
            type: "aggregationIsm",
            mailbox: sepoliaMailbox,
            modules: ["0x1234567890123456789012345678901234567890", "0x1234567890123456789012345678901234567890"],
            destinationChain: "sepolia",
        });

        expect(JSON.parse(response)).toEqual({
            message: "ISM deployed successfully",
            details: {
                type: "aggregationIsm",
                address: expect.stringMatching(hex40),
                config: {
                    type: "aggregationIsm",
                    modules: [
                        "0x1234567890123456789012345678901234567890",
                        "0x1234567890123456789012345678901234567890",
                    ],
                    destinationChain: "sepolia",
                },
            },
        });
    });

    it("sets up a defaultFallbackRoutingIsm on sepolia", async () => {
        const response = await hyperlane.deployIsm(clients.sepolia, {
            type: "defaultFallbackRoutingIsm",
            mailbox: sepoliaMailbox,
            domains: {
                "11155420": "0x1234567890123456789012345678901234567890",
            },
            owner: WALLET_ADDRESS,
            destinationChain: "sepolia",
        });

        expect(JSON.parse(response)).toEqual({
            message: "ISM deployed successfully",
            details: {
                type: "defaultFallbackRoutingIsm",
                address: expect.stringMatching(hex40),
                config: {
                    type: "defaultFallbackRoutingIsm",
                    domains: {
                        "11155420": "0x1234567890123456789012345678901234567890",
                    },
                    owner: WALLET_ADDRESS,
                    destinationChain: "sepolia",
                },
            },
        });
    });

    it("sets up a staticAggregationIsm on sepolia", async () => {
        const response = await hyperlane.deployIsm(clients.sepolia, {
            type: "staticAggregationIsm",
            mailbox: sepoliaMailbox,
            modules: ["0x1234567890123456789012345678901234567890", "0x1234567890123456789012345678901234567890"],
            threshold: 2,
            destinationChain: "sepolia",
        });

        expect(JSON.parse(response)).toEqual({
            message: "ISM deployed successfully",
            details: {
                type: "staticAggregationIsm",
                address: expect.stringMatching(hex40),
                config: {
                    type: "staticAggregationIsm",
                    modules: [
                        "0x1234567890123456789012345678901234567890",
                        "0x1234567890123456789012345678901234567890",
                    ],
                    threshold: 2,
                    destinationChain: "sepolia",
                },
            },
        });
    });
});

describe("hyperlane.manageValidators", () => {
    it("adds a validator on sepolia", async () => {
        const response = await hyperlane.manageValidators(clients.sepolia, {
            chain: "sepolia",
            action: "ADD",
            validator: sepoliaTestnetValidator,
            weight: 1,
        });
        
        expect(JSON.parse(response)).toEqual({
            message: "Validator added successfully",
            details: {
                chain: "sepolia",
                action: "ADD",
                validator: sepoliaTestnetValidator,
                weight: 1,
                transactionHash: expect.stringMatching(hex64),
            },
        });
    });

    it("updates a validator on sepolia", async () => {
        const updateResponse = await hyperlane.manageValidators(clients.sepolia, {
            chain: "sepolia",
            action: "UPDATE",
            validator: sepoliaTestnetValidator,
            weight: 1,
        });

        expect(JSON.parse(updateResponse)).toEqual({
            message: "Validator updated successfully",
            details: {
                chain: "sepolia",
                action: "UPDATE",
                validator: sepoliaTestnetValidator,
                weight: 1,
                transactionHash: expect.stringMatching(hex64),
            },
        });
    });

    it("removes a validator on sepolia", async () => {
        const removeResponse = await hyperlane.manageValidators(clients.sepolia, {
            chain: "sepolia",
            action: "REMOVE",
            validator: sepoliaTestnetValidator,
            weight: 1,
        });
        
        expect(JSON.parse(removeResponse)).toEqual({
            message: "Validator removed successfully",
            details: {
                chain: "sepolia",
                action: "ADD",
                validator: sepoliaTestnetValidator,
                weight: 1,
                transactionHash: expect.stringMatching(hex64),
            },
        });
    });
});

describe("hyperlane.getTokens", () => {
    it('retrieves token metadata from chain "soon"', async () => {
        const response = await hyperlane.getTokens({ chain: "soon" });

        const parsed = JSON.parse(response);

        expect(parsed).toHaveProperty("message", "Tokens found");
        expect(parsed.details).toHaveProperty("chain", "soon");
        expect(parsed.details.tokens).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    chainName: "soon",
                    connections: expect.arrayContaining([
                        expect.objectContaining({
                            chainName: expect.any(String),
                            routerAddress: expect.any(String),
                        }),
                    ]),
                    decimals: expect.any(Number),
                    name: expect.any(String),
                    routeId: expect.any(String),
                    standard: expect.any(String),
                    symbol: expect.any(String),
                    tokenRouterAddress: expect.any(String),
                    underlyingTokenAddress: expect.any(String),
                }),
            ]),
        );
    });
});

describe("hyperlane.getWarpRoutesForChain", () => {
    it('retrieves warp routes for chain "soon"', async () => {
        const response = await hyperlane.getWarpRoutesForChain(clients.sepolia, { chain: "soon" });
        const parsed = JSON.parse(response) as {
            message: string;
            warpRoutes: Record<string, { tokens: WarpRouteToken[] }>;
        };

        expect(typeof parsed).toBe("object");

        expect(parsed.warpRoutes).toEqual(
            expect.objectContaining({
                [expect.any(String)]: expect.objectContaining({
                    tokens: expect.arrayContaining([
                        expect.objectContaining({
                            addressOrDenom: expect.any(String),
                            chainName: expect.any(String),
                            connections: expect.any(Array),
                            decimals: expect.any(Number),
                            name: expect.any(String),
                            standard: expect.any(String),
                            symbol: expect.any(String),
                        }),
                    ]),
                }),
            }),
        );
    });
});

describe("hyperlane.getIsmsForChain", () => {
    it('retrieves Isms for chain "sepolia"', async () => {
        const response = await hyperlane.getIsmsForChain(clients.sepolia, { chain: "sepolia" });
        const parsed = JSON.parse(response) as {
            message: string;
            isms: Record<string, Isms>;
        };

        expect(typeof parsed).toBe("object");
        expect(Object.keys(parsed.isms).length).toBeGreaterThan(0);

        for (const [ismId, ismData] of Object.entries(parsed.isms)) {
            expect(ismData).toHaveProperty("address");
            expect(ismData).toHaveProperty("chainId");
            expect(ismData).toHaveProperty("domainId");
        }
    });
});

describe("hyperlane.inspectWarpRoute", () => {
    it("inspects a warp route on a given chain", async () => {
        const response = await hyperlane.inspectWarpRoute(clients.sepolia, {
            warpRouteAddress: "0x753e7AafFA0eB3bB352753e5c0f0F5Bb807e3752",
            chain: "basesepolia",
        });

        expect(JSON.parse(response)).toEqual({
            tokenType: "collateral",
            tokenConfig: expect.objectContaining({
                type: "collateral",
                name: "ChainLink Token",
                symbol: "LINK",
                decimals: 18,
                token: "0xE4aB69C077896252FAFBD49EFD26B5D171A32410",
            }),
            mailboxConfig: expect.objectContaining({
                mailbox: "0x6966b0E55883d49BFB24539356a2f8A673E02039",
                owner: "0x0Ef3456E616552238B0c562d409507Ed6051A7b3",
                hook: "0x0000000000000000000000000000000000000000",
                interchainSecurityModule: "0x0000000000000000000000000000000000000000",
            }),
            warpRouteConfig: expect.objectContaining({
                mailbox: "0x6966b0E55883d49BFB24539356a2f8A673E02039",
                owner: "0x0Ef3456E616552238B0c562d409507Ed6051A7b3",
                hook: "0x0000000000000000000000000000000000000000",
                interchainSecurityModule: "0x0000000000000000000000000000000000000000",
                type: "collateral",
                name: "ChainLink Token",
                symbol: "LINK",
                decimals: 18,
                token: "0xE4aB69C077896252FAFBD49EFD26B5D171A32410",
                remoteRouters: expect.objectContaining({
                    "11155420": expect.objectContaining({
                        address: "0xe97e8fA57540fAF2617EFceE30506aF559c4Ac88",
                    }),
                }),
                proxyAdmin: expect.objectContaining({
                    address: "0x3aFE3e53f4174Dc7e145795f69b3FFd5eb911ABD",
                    owner: "0x0Ef3456E616552238B0c562d409507Ed6051A7b3",
                }),
                destinationGas: expect.objectContaining({
                    "11155420": "64000",
                }),
            }),
        });
    });
});

describe("hyperlane.sendAssets", () => {
    it("initiates a native to synthetic asset transfer from sepolia to alfajores", async () => {
        const response = await hyperlane.sendAssets(clients.sepolia, {
            warpRouteAddress: "0xedf994d49f865d3a4bd6f74aefbe1dccae7204f2",
            tokenAddress: "0xedf994d49f865d3a4bd6f74aefbe1dccae7204f2",
            originChain: "sepolia",
            destinationChain: "alfajores",
            recipientAddress: WALLET_ADDRESS,
            amount: "0.001",
        });

        const parsed = JSON.parse(response);
        expect(parsed).toEqual({
            message: "Cross-chain asset transfer initiated",
            transaction: expect.objectContaining({
                transactionHash: expect.stringMatching(hex64),
                status: "success",
                to: "0xedf994d49f865d3a4bd6f74aefbe1dccae7204f2",
                type: "eip1559",
                from: WALLET_ADDRESS,
            }),
        });
    });

    it("initiates a synthetic to native asset return from alfajores to sepolia", async () => {
        // TODO: fails intermittently
        const response = await hyperlane.sendAssets(clients.alfajores, {
            warpRouteAddress: "0x78fe869f19f917fde4192c51c446fbd3721788ee",
            tokenAddress: "0x78fe869f19f917fde4192c51c446fbd3721788ee",
            originChain: "alfajores",
            destinationChain: "sepolia",
            recipientAddress: WALLET_ADDRESS,
            amount: "0.001",
        });

        const parsed = JSON.parse(response);
        expect(parsed).toEqual({
            message: "Cross-chain asset transfer initiated",
            transaction: expect.objectContaining({
                transactionHash: expect.stringMatching(hex64),
                status: "success",
                to: "0x78fe869f19f917fde4192c51c446fbd3721788ee",
                type: "eip1559",
                from: WALLET_ADDRESS,
            }),
        });
    });

    it("initiates a collateral to synthetic asset transfer from basesepolia to optimismsepolia for LINK", async () => {
        const response = await hyperlane.sendAssets(clients.base, {
            warpRouteAddress: "0x753e7aaffa0eb3bb352753e5c0f0f5bb807e3752",
            tokenAddress: "0xe4ab69c077896252fafbd49efd26b5d171a32410",
            originChain: "basesepolia",
            destinationChain: "optimismsepolia",
            recipientAddress: WALLET_ADDRESS,
            amount: "1",
        });

        const parsed = JSON.parse(response);
        expect(parsed).toEqual({
            message: "Cross-chain asset transfer initiated",
            transaction: expect.objectContaining({
                transactionHash: expect.stringMatching(hex64),
                status: "success",
                to: "0x753e7aaffa0eb3bb352753e5c0f0f5bb807e3752",
                type: "eip1559",
                from: WALLET_ADDRESS,
            }),
        });
    });

    // TODO: this test won't work until the warp route is set up with a relayer
    it("initiates a synthetic to collateral asset return from optimismsepolia to basesepolia for LINK", async () => {
        const response = await hyperlane.sendAssets(clients.optimism, {
            warpRouteAddress: "0xe97e8fa57540faf2617efcee30506af559c4ac88",
            tokenAddress: "0xe4ab69c077896252fafbd49efd26b5d171a32410",
            originChain: "optimismsepolia",
            destinationChain: "basesepolia",
            recipientAddress: WALLET_ADDRESS,
            amount: "0.0001",
        });

        const parsed = JSON.parse(response);
        expect(parsed).toEqual({
            message: "Cross-chain asset transfer initiated",
            transaction: expect.objectContaining({
                transactionHash: expect.stringMatching(hex64),
                status: "success",
                to: "0xe97e8fa57540faf2617efcee30506af559c4ac88",
                type: "eip1559",
                from: WALLET_ADDRESS,
            }),
        });
    });
});

describe("hyperlane.deployWarpRoute", { timeout: 300000 }, () => {
    it("deploys a warp route from native to synthetic between sepolia and alfajores", async () => {
        const response = await hyperlane.deployWarpRoute(clients.sepolia, {
            chains: [
                {
                    // walletClient: clients.sepolia,
                    type: "native",
                    chainName: "sepolia",
                    useTrustedIsm: true,
                },
                {
                    // walletClient: clients.alfajores,
                    type: "synthetic",
                    chainName: "alfajores",
                    useTrustedIsm: true,
                },
            ],
        });

        const parsed = JSON.parse(response);
        expect(parsed).toEqual({
            message: "Warp route deployed successfully",
            result: {
                tokens: expect.arrayContaining([
                    expect.objectContaining({
                        chainName: "sepolia",
                        addressOrDenom: expect.stringMatching(hex40),
                        // collateralAddressOrDenom: expect.stringMatching(hex40),
                        // collateralAddressOrDenom: undefined,
                        // type: "native",
                    }),
                    expect.objectContaining({
                        chainName: "alfajores",
                        addressOrDenom: expect.stringMatching(hex40),
                        // collateralAddressOrDenom: undefined,
                        // type: "synthetic",
                    }),
                ]),
            },
        });
    });

    it("deploys a warp route from native to native between sepolia and alfajores", async () => {
        const response = await hyperlane.deployWarpRoute(clients.sepolia, {
            chains: [
                {
                    // walletClient: clients.sepolia,
                    type: "native",
                    chainName: "sepolia",
                    useTrustedIsm: true,
                },
                {
                    // walletClient: clients.alfajores,
                    type: "native",
                    chainName: "alfajores",
                    useTrustedIsm: true,
                },
            ],
        });

        const parsed = JSON.parse(response);
        expect(parsed).toEqual({
            message: "Warp route deployed successfully",
            result: {
                tokens: expect.arrayContaining([
                    expect.objectContaining({
                        chainName: "sepolia",
                        addressOrDenom: expect.stringMatching(hex40),
                        // collateralAddressOrDenom: expect.stringMatching(hex40),
                        // collateralAddressOrDenom: undefined,
                        // type: "native",
                    }),
                    expect.objectContaining({
                        chainName: "alfajores",
                        addressOrDenom: expect.stringMatching(hex40),
                        // collateralAddressOrDenom: undefined,
                        // type: "synthetic",
                    }),
                ]),
            },
        });
    });

    let destinationWarpRouteAddress: string;

    it("deploys a warp route from collateral to synthetic between basesepolia and zksyncsepolia", async () => {
        const response = await hyperlane.deployWarpRoute(clients.base, {
            chains: [
                {
                    // walletClient: clients.base,
                    chainName: "basesepolia",
                    type: "collateral",
                    useTrustedIsm: true,
                    tokenAddress: basesepoliaLinkTokenContractAddress,
                    symbol: "LINK",
                    name: "ChainLink",
                    decimals: 18,
                },
                {
                    // walletClient: clients.zksync,
                    chainName: "zksyncsepolia",
                    type: "synthetic",
                    useTrustedIsm: true,
                    symbol: "LINK",
                    name: "Chainlink",
                    decimals: 18,
                },
            ],
        });

        const parsed = JSON.parse(response);
        destinationWarpRouteAddress = parsed.result.tokens[1].addressOrDenom;
        expect(parsed).toEqual({
            message: "Warp route deployed successfully",
            result: {
                tokens: [
                    expect.objectContaining({
                        chainName: "basesepolia",
                        addressOrDenom: expect.stringMatching(hex40),
                        // TODO: fill in
                        // collateralAddressOrDenom: basesepoliaLinkTokenContractAddress,
                        // type: "collateral"
                    }),
                    expect.objectContaining({
                        chainName: "zksyncsepolia",
                        addressOrDenom: expect.stringMatching(hex40),
                        // TODO: fill in
                        // collateralAddressOrDenom: undefined,
                        // type: "synthetic"
                    }),
                ],
            },
        });
    });

    it("deploys a warp route from collateral to collateral between basesepolia and zksyncsepolia", async () => {
        const response = await hyperlane.deployWarpRoute(clients.base, {
            chains: [
                {
                    // walletClient: clients.base,
                    chainName: "basesepolia",
                    type: "collateral",
                    useTrustedIsm: true,
                    tokenAddress: basesepoliaLinkTokenContractAddress,
                    symbol: "LINK",
                    name: "ChainLink",
                    decimals: 18,
                },
                {
                    // walletClient: clients.zksync,
                    chainName: "zksyncsepolia",
                    type: "collateral",
                    useTrustedIsm: true,
                    tokenAddress: zksyncsepoliaLinkTokenContractAddress,
                    symbol: "LINK",
                    name: "Chainlink",
                    decimals: 18,
                },
            ],
        });

        const parsed = JSON.parse(response);
        expect(parsed).toEqual({
            message: "Warp route deployed successfully",
            result: {
                tokens: [
                    expect.objectContaining({
                        chainName: "basesepolia",
                        addressOrDenom: expect.stringMatching(hex40),
                        // TODO: fill in
                        // collateralAddressOrDenom: basesepoliaLinkTokenContractAddress,
                        // type: "collateral"
                    }),
                    expect.objectContaining({
                        chainName: "zksyncsepolia",
                        addressOrDenom: expect.stringMatching(hex40),
                        // TODO: fill in
                        // collateralAddressOrDenom: undefined,
                        // type: "synthetic"
                    }),
                ],
            },
        });
    });

});

describe("hyperlane.configureIsm", () => {
    let ismAddress: string;

    it("sets up a trustedRelayerIsm on zksyncsepolia", async () => {
        const response = JSON.parse(
            await hyperlane.deployIsm(clients.zksync, {
                type: "trustedRelayerIsm",
                mailbox: zksyncsepoliaMailbox,
                relayer: WALLET_ADDRESS,
                destinationChain: "zksyncsepolia",
            }),
        );

        ismAddress = response.details.address;

        expect(response).toEqual({
            message: "ISM deployed successfully",
            details: {
                type: "trustedRelayerIsm",
                address: expect.stringMatching(hex40),
                destinationChain: "zksyncsepolia",
                config: {
                    type: "trustedRelayerIsm",
                    relayer: WALLET_ADDRESS,
                },
            },
        });
    });

    it("assigns a trusted relayer ism to a warp route", async () => {
        const response = await hyperlane.configureIsm(clients.base, {
            destinationWarpRouteAddress: "0xe97e8fa57540faf2617efcee30506af559c4ac88",
            ismAddress,
        });

        const parsed = JSON.parse(response);
        expect(parsed).toEqual({
            message: "ISM configured successfully",
            transaction: expect.objectContaining({
                blockHash: expect.stringMatching(hex64),
                blockNumber: expect.stringMatching(numberString),
                contractAddress: null,
                cumulativeGasUsed: expect.stringMatching(numberString),
                effectiveGasPrice: expect.stringMatching(numberString),
                from: WALLET_ADDRESS,
                gasUsed: expect.stringMatching(numberString),
                hash: expect.stringMatching(hex64),
                logs: [],
                logsBloom: expect.stringMatching(hexString),
                status: "success",
                to: expect.stringMatching(hex40),
                transactionHash: expect.stringMatching(hex64),
                transactionIndex: expect.any(Number),
                type: "eip1559",
            }),
        });
    });
});