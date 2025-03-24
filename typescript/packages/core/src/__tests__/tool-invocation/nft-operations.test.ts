import "reflect-metadata";
import { beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";
import { Tool } from "../../decorators/Tool";
import { getTools } from "../../utils/getTools";
import { MockWalletClient, createToolExecutionSpy } from "./mock-utils";
import { createMockParameters, createMockPlugin } from "./test-utils";

describe("NFT operations", () => {
    describe("mint_nft tool", () => {
        const mintSpy = createToolExecutionSpy();

        class MintParameters extends createMockParameters(
            z.object({
                name: z.string().describe("NFT name"),
                description: z.string().describe("NFT description"),
                image: z.string().describe("NFT image URL"),
                recipient: z.string().optional().describe("Recipient address"),
            }),
        ) {}

        class NFTService {
            @Tool({
                description: "Mint a new NFT",
            })
            async mintNFT(wallet: MockWalletClient, params: MintParameters) {
                return mintSpy(wallet, params);
            }
        }

        beforeEach(() => {
            mintSpy.mockReset();
            mintSpy.mockResolvedValue({ tokenId: "123", hash: "0xtx789" });
        });

        it("should trigger NFT mint with correct parameters", async () => {
            const wallet = new MockWalletClient();
            const plugin = createMockPlugin("nft", new NFTService());
            const tools = await getTools({ wallet, plugins: [plugin] });

            const mintTool = tools.find((tool) => tool.name === "mint_nft");
            expect(mintTool).toBeDefined();

            if (mintTool) {
                await mintTool.execute({
                    name: "Test NFT",
                    description: "A test NFT",
                    image: "https://example.com/image.png",
                    recipient: "0xdef",
                });
            }

            expect(mintSpy).toHaveBeenCalledWith(wallet, {
                name: "Test NFT",
                description: "A test NFT",
                image: "https://example.com/image.png",
                recipient: "0xdef",
            });
        });
    });

    describe("nft_transfer tool", () => {
        const transferSpy = createToolExecutionSpy();

        class NFTTransferParameters extends createMockParameters(
            z.object({
                tokenId: z.string().describe("NFT token ID"),
                contractAddress: z.string().describe("NFT contract address"),
                to: z.string().describe("Recipient address"),
            }),
        ) {}

        class NFTTransferService {
            @Tool({
                description: "Transfer an NFT to another address",
            })
            async transferNFT(wallet: MockWalletClient, params: NFTTransferParameters) {
                return transferSpy(wallet, params);
            }
        }

        beforeEach(() => {
            transferSpy.mockReset();
            transferSpy.mockResolvedValue({ hash: "0xtx456" });
        });

        it("should trigger NFT transfer with correct parameters", async () => {
            const wallet = new MockWalletClient();
            const plugin = createMockPlugin("nft-transfer", new NFTTransferService());
            const tools = await getTools({ wallet, plugins: [plugin] });

            const transferTool = tools.find((tool) => tool.name === "transfer_nft");
            expect(transferTool).toBeDefined();

            if (transferTool) {
                await transferTool.execute({
                    tokenId: "123",
                    contractAddress: "0xnft789",
                    to: "0xrecipient456",
                });
            }

            expect(transferSpy).toHaveBeenCalledWith(wallet, {
                tokenId: "123",
                contractAddress: "0xnft789",
                to: "0xrecipient456",
            });
        });
    });
});
