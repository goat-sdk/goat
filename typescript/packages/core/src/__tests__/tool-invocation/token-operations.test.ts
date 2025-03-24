import { beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";
import { Tool } from "../../decorators/Tool";
import { getTools } from "../../utils/getTools";
import { MockWalletClient, createToolExecutionSpy } from "./mock-utils";
import { createMockParameters, createMockPlugin } from "./test-utils";

describe("Token operations", () => {
    describe("token_swap tool", () => {
        const swapSpy = createToolExecutionSpy();

        class SwapParameters extends createMockParameters(
            z.object({
                inputMint: z.string().describe("The token address to swap from"),
                outputMint: z.string().describe("The token address to swap to"),
                amount: z.number().describe("Amount to swap"),
                slippage: z.number().optional().describe("Slippage tolerance"),
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
            swapSpy.mockResolvedValue({ hash: "0xtx456", outputAmount: "10" });
        });

        it("should trigger swap with correct parameters", async () => {
            const wallet = new MockWalletClient();
            const plugin = createMockPlugin("swap", new SwapService());
            const tools = await getTools({ wallet, plugins: [plugin] });

            const swapTool = tools.find((tool) => tool.name === "swap");
            expect(swapTool).toBeDefined();

            if (swapTool) {
                await swapTool.execute({
                    inputMint: "USDC",
                    outputMint: "SOL",
                    amount: 5,
                    slippage: 1,
                });
            }

            expect(swapSpy).toHaveBeenCalledWith(wallet, {
                inputMint: "USDC",
                outputMint: "SOL",
                amount: 5,
                slippage: 1,
            });
        });

        it("should trigger swap with default slippage", async () => {
            const wallet = new MockWalletClient();
            const plugin = createMockPlugin("swap", new SwapService());
            const tools = await getTools({ wallet, plugins: [plugin] });

            const swapTool = tools.find((tool) => tool.name === "swap");
            expect(swapTool).toBeDefined();

            if (swapTool) {
                await swapTool.execute({
                    inputMint: "SOL",
                    outputMint: "JUP",
                    amount: 1,
                });
            }

            expect(swapSpy).toHaveBeenCalledWith(wallet, { inputMint: "SOL", outputMint: "JUP", amount: 1 });
        });
    });

    describe("token_transfer tool", () => {
        const transferSpy = createToolExecutionSpy();

        class TokenTransferParameters extends createMockParameters(
            z.object({
                tokenAddress: z.string().describe("The token contract address"),
                to: z.string().describe("Recipient address"),
                amount: z.number().describe("Amount to transfer"),
            }),
        ) {}

        class TokenTransferService {
            @Tool({
                description: "Transfer tokens to an address",
            })
            async transferToken(wallet: MockWalletClient, params: TokenTransferParameters) {
                return transferSpy(wallet, params);
            }
        }

        beforeEach(() => {
            transferSpy.mockReset();
            transferSpy.mockResolvedValue({ hash: "0xtx789" });
        });

        it("should trigger token transfer with correct parameters", async () => {
            const wallet = new MockWalletClient();
            const plugin = createMockPlugin("token", new TokenTransferService());
            const tools = await getTools({ wallet, plugins: [plugin] });

            const transferTool = tools.find((tool) => tool.name === "transfer_token");
            expect(transferTool).toBeDefined();

            if (transferTool) {
                await transferTool.execute({
                    tokenAddress: "0xtoken123",
                    to: "0xrecipient456",
                    amount: 10,
                });
            }

            expect(transferSpy).toHaveBeenCalledWith(wallet, {
                tokenAddress: "0xtoken123",
                to: "0xrecipient456",
                amount: 10,
            });
        });
    });
});
