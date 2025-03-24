import { beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";
import { Tool } from "../../decorators/Tool";
import { getTools } from "../../utils/getTools";
import { MockWalletClient, createToolExecutionSpy } from "./mock-utils";
import { createMockParameters, createMockPlugin } from "./test-utils";

describe("Edge cases and error handling", () => {
    describe("parameter validation", () => {
        const transferSpy = createToolExecutionSpy();

        class TransferParameters extends createMockParameters(
            z.object({
                to: z.string().describe("Recipient address"),
                amount: z.number().min(0).describe("Amount to transfer"),
            }),
        ) {}

        class TransferService {
            @Tool({
                description: "Transfer tokens to an address",
            })
            async transfer(wallet: MockWalletClient, params: TransferParameters) {
                return transferSpy(wallet, params);
            }
        }

        beforeEach(() => {
            transferSpy.mockReset();
            transferSpy.mockResolvedValue({ hash: "0xtx123" });
        });

        it("should validate parameters before calling the tool", async () => {
            const wallet = new MockWalletClient();
            const plugin = createMockPlugin("transfer", new TransferService());
            const tools = await getTools({ wallet, plugins: [plugin] });

            const transferTool = tools.find((tool) => tool.name === "transfer");
            expect(transferTool).toBeDefined();

            // This should throw because amount is negative
            if (transferTool) {
                await expect(transferTool.execute({ to: "0xabc", amount: -10 })).rejects.toThrow();
            }

            // Verify the tool was not called
            expect(transferSpy).not.toHaveBeenCalled();
        });
    });

    describe("missing required parameters", () => {
        const swapSpy = createToolExecutionSpy();

        class SwapParameters extends createMockParameters(
            z.object({
                inputMint: z.string().describe("The token address to swap from"),
                outputMint: z.string().describe("The token address to swap to"),
                amount: z.number().describe("Amount to swap"),
            }),
        ) {}

        class SwapService {
            @Tool({
                description: "Swap one token for another",
            })
            async swap(wallet: MockWalletClient, params: SwapParameters) {
                return swapSpy(wallet, params);
            }
        }

        beforeEach(() => {
            swapSpy.mockReset();
            swapSpy.mockResolvedValue({ hash: "0xtx456" });
        });

        it("should validate required parameters are present", async () => {
            const wallet = new MockWalletClient();
            const plugin = createMockPlugin("swap", new SwapService());
            const tools = await getTools({ wallet, plugins: [plugin] });

            const swapTool = tools.find((tool) => tool.name === "swap");
            expect(swapTool).toBeDefined();

            // This should throw because outputMint is missing
            if (swapTool) {
                await expect(
                    // @ts-ignore - Intentionally passing incomplete parameters for testing
                    swapTool.execute({ inputMint: "USDC", amount: 5 }),
                ).rejects.toThrow();
            }

            // Verify the tool was not called
            expect(swapSpy).not.toHaveBeenCalled();
        });
    });

    describe("parameter type validation", () => {
        const mintSpy = createToolExecutionSpy();

        class MintParameters extends createMockParameters(
            z.object({
                name: z.string().describe("NFT name"),
                supply: z.number().int().describe("Token supply"),
                decimals: z.number().int().min(0).max(9).describe("Token decimals"),
            }),
        ) {}

        class MintService {
            @Tool({
                description: "Mint a new token",
            })
            async mintToken(wallet: MockWalletClient, params: MintParameters) {
                return mintSpy(wallet, params);
            }
        }

        beforeEach(() => {
            mintSpy.mockReset();
            mintSpy.mockResolvedValue({ tokenAddress: "0xtoken123" });
        });

        it("should validate parameter types", async () => {
            const wallet = new MockWalletClient();
            const plugin = createMockPlugin("mint", new MintService());
            const tools = await getTools({ wallet, plugins: [plugin] });

            const mintTool = tools.find((tool) => tool.name === "mint_token");
            expect(mintTool).toBeDefined();

            if (mintTool) {
                // This should throw because decimals is out of range
                await expect(mintTool.execute({ name: "Test Token", supply: 1000000, decimals: 10 })).rejects.toThrow();

                // This should throw because supply is not an integer
                await expect(mintTool.execute({ name: "Test Token", supply: 1000.5, decimals: 6 })).rejects.toThrow();
            }

            // Verify the tool was not called
            expect(mintSpy).not.toHaveBeenCalled();
        });
    });
});
