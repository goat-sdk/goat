import "reflect-metadata";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { WalletClientBase } from "../../classes";
import { Tool } from "../../decorators/Tool";
import { getTools } from "../../utils/getTools";
import { mockWalletClient } from "./mock-utils";
import { createMockParameters, createMockPlugin } from "./test-utils";

describe("Jupiter token swap examples", () => {
    const swapSpy = vi.fn();

    class SwapParameters extends createMockParameters(
        z.object({
            inputMint: z.string().describe("The token to swap from"),
            outputMint: z.string().describe("The token to swap to"),
            amount: z.number().describe("Amount to swap"),
            slippageBps: z.number().optional().describe("Slippage in basis points"),
        }),
    ) {}

    class JupiterService {
        @Tool({
            description: "Swap tokens on Jupiter DEX",
        })
        async swapTokens(wallet: WalletClientBase, params: SwapParameters) {
            // Create a new instance with the parameters to ensure validation
            const validParams = new SwapParameters(params);
            return swapSpy(wallet, validParams);
        }
    }

    beforeEach(() => {
        swapSpy.mockReset();
        swapSpy.mockResolvedValue({ hash: "0xtx123" });
    });

    it("should handle 'I want to trade 5 USDC for SOL'", async () => {
        const wallet = mockWalletClient();
        const plugin = createMockPlugin("jupiter", new JupiterService());
        const tools = await getTools({ wallet, plugins: [plugin] });

        const swapTool = tools.find((tool) => tool.name === "swap_tokens");
        expect(swapTool).toBeDefined();

        if (swapTool) {
            await swapTool.execute({
                inputMint: "USDC",
                outputMint: "SOL",
                amount: 5,
            });
        }

        // Verify spy was called with correct parameters
        expect(swapSpy).toHaveBeenCalled();
        const callArgs = swapSpy.mock.calls[0];
        // Check parameter properties directly instead of instance type
        expect(callArgs[0]).toEqual(
            expect.objectContaining({
                inputMint: "USDC",
                outputMint: "SOL",
                amount: 5,
            }),
        );
    });

    it("should handle 'Exchange 1 SOL for JUP tokens'", async () => {
        const wallet = mockWalletClient();
        const plugin = createMockPlugin("jupiter", new JupiterService());
        const tools = await getTools({ wallet, plugins: [plugin] });

        const swapTool = tools.find((tool) => tool.name === "swap_tokens");
        expect(swapTool).toBeDefined();

        if (swapTool) {
            await swapTool.execute({
                inputMint: "SOL",
                outputMint: "JUP",
                amount: 1,
            });
        }

        // Verify spy was called with correct parameters
        expect(swapSpy).toHaveBeenCalled();
        const callArgs = swapSpy.mock.calls[0];
        // Check parameter properties directly instead of instance type
        expect(callArgs[0]).toEqual(
            expect.objectContaining({
                inputMint: "SOL",
                outputMint: "JUP",
                amount: 1,
            }),
        );
    });

    it("should handle 'Swap 10 USDC for JUP with 1% slippage'", async () => {
        const wallet = mockWalletClient();
        const plugin = createMockPlugin("jupiter", new JupiterService());
        const tools = await getTools({ wallet, plugins: [plugin] });

        const swapTool = tools.find((tool) => tool.name === "swap_tokens");
        expect(swapTool).toBeDefined();

        if (swapTool) {
            await swapTool.execute({
                inputMint: "USDC",
                outputMint: "JUP",
                amount: 10,
                slippageBps: 100, // 1% = 100 basis points
            });
        }

        // Verify spy was called with correct parameters
        expect(swapSpy).toHaveBeenCalled();
        const callArgs = swapSpy.mock.calls[0];
        // Check parameter properties directly instead of instance type
        expect(callArgs[0]).toEqual(
            expect.objectContaining({
                inputMint: "USDC",
                outputMint: "JUP",
                amount: 10,
                slippageBps: 100,
            }),
        );
    });
});

describe("Solana transfer examples", () => {
    const transferSpy = vi.fn();

    class TransferParameters extends createMockParameters(
        z.object({
            to: z.string().describe("Recipient address"),
            amount: z.number().describe("Amount to transfer"),
            token: z.string().optional().describe("Token to transfer (default is SOL)"),
        }),
    ) {}

    class TransferService {
        @Tool({
            description: "Transfer tokens to an address",
        })
        async transfer(wallet: WalletClientBase, params: TransferParameters) {
            // Create a new instance with the parameters to ensure validation
            const validParams = new TransferParameters(params);
            return transferSpy(wallet, validParams);
        }
    }

    beforeEach(() => {
        transferSpy.mockReset();
        transferSpy.mockResolvedValue({ hash: "0xtx456" });
    });

    it("should handle 'Can you transfer 0.0001 sol to GZbQmKY7zwjP3nbdqRWpLN98iApin9w5eXMGp7bmZbGB?'", async () => {
        const wallet = mockWalletClient();
        const plugin = createMockPlugin("transfer", new TransferService());
        const tools = await getTools({ wallet, plugins: [plugin] });

        const transferTool = tools.find((tool) => tool.name === "transfer");
        expect(transferTool).toBeDefined();

        if (transferTool) {
            await transferTool.execute({
                to: "GZbQmKY7zwjP3nbdqRWpLN98iApin9w5eXMGp7bmZbGB",
                amount: 0.0001,
            });
        }

        // Verify spy was called with correct parameters
        expect(transferSpy).toHaveBeenCalled();
        const callArgs = transferSpy.mock.calls[0];
        // Check parameter properties directly instead of instance type
        expect(callArgs[0]).toEqual(
            expect.objectContaining({
                to: "GZbQmKY7zwjP3nbdqRWpLN98iApin9w5eXMGp7bmZbGB",
                amount: 0.0001,
            }),
        );
    });

    it("should handle 'Can you transfer like two sol to GZbQmKY7zwjP3nbdqRWpLN98iApin9w5eXMGp7bmZbGB for testing?'", async () => {
        const wallet = mockWalletClient();
        const plugin = createMockPlugin("transfer", new TransferService());
        const tools = await getTools({ wallet, plugins: [plugin] });

        const transferTool = tools.find((tool) => tool.name === "transfer");
        expect(transferTool).toBeDefined();

        if (transferTool) {
            await transferTool.execute({
                to: "GZbQmKY7zwjP3nbdqRWpLN98iApin9w5eXMGp7bmZbGB",
                amount: 2,
            });
        }

        // Verify spy was called with correct parameters
        expect(transferSpy).toHaveBeenCalled();
        const callArgs = transferSpy.mock.calls[0];
        // Check parameter properties directly instead of instance type
        expect(callArgs[0]).toEqual(
            expect.objectContaining({
                to: "GZbQmKY7zwjP3nbdqRWpLN98iApin9w5eXMGp7bmZbGB",
                amount: 2,
            }),
        );
    });

    it("should handle 'Send 250 USDC to GZbQmKY7zwjP3nbdqRWpLN98iApin9w5eXMGp7bmZbGB'", async () => {
        const wallet = mockWalletClient();
        const plugin = createMockPlugin("transfer", new TransferService());
        const tools = await getTools({ wallet, plugins: [plugin] });

        const transferTool = tools.find((tool) => tool.name === "transfer");
        expect(transferTool).toBeDefined();

        if (transferTool) {
            await transferTool.execute({
                to: "GZbQmKY7zwjP3nbdqRWpLN98iApin9w5eXMGp7bmZbGB",
                amount: 250,
                token: "USDC",
            });
        }

        // Verify spy was called with correct parameters
        expect(transferSpy).toHaveBeenCalled();
        const callArgs = transferSpy.mock.calls[0];
        // Check parameter properties directly instead of instance type
        expect(callArgs[0]).toEqual(
            expect.objectContaining({
                to: "GZbQmKY7zwjP3nbdqRWpLN98iApin9w5eXMGp7bmZbGB",
                amount: 250,
                token: "USDC",
            }),
        );
    });
});

describe("Solana compressed airdrop examples", () => {
    const airdropSpy = vi.fn();

    class AirdropParameters extends createMockParameters(
        z.object({
            mint: z.string().describe("Token mint address"),
            amount: z.number().describe("Amount to airdrop"),
            recipients: z.array(z.string()).describe("Recipient addresses"),
            enableLogs: z.boolean().optional().describe("Enable logs"),
        }),
    ) {}

    class AirdropService {
        @Tool({
            description: "Airdrop tokens to multiple recipients",
        })
        async compressedAirdrop(wallet: WalletClientBase, params: AirdropParameters) {
            // Create a new instance with the parameters to ensure validation
            const validParams = new AirdropParameters(params);
            return airdropSpy(wallet, validParams);
        }
    }

    beforeEach(() => {
        airdropSpy.mockReset();
        airdropSpy.mockResolvedValue({ success: true, txIds: ["tx1", "tx2"] });
    });

    it("should handle 'Airdrop 100 tokens of mint 4h2cMlJ5byq4iqZ73rKRSz9rLmLjQvEDf9lm6JFgNu to [9aUn5swQzUTRanaaTwmszxiv89cvFwUCjF'", async () => {
        const wallet = mockWalletClient();
        const plugin = createMockPlugin("airdrop", new AirdropService());
        const tools = await getTools({ wallet, plugins: [plugin] });

        const airdropTool = tools.find((tool) => tool.name === "compressed_airdrop");
        expect(airdropTool).toBeDefined();

        if (airdropTool) {
            await airdropTool.execute({
                mint: "4h2cMlJ5byq4iqZ73rKRSz9rLmLjQvEDf9lm6JFgNu",
                amount: 100,
                recipients: ["9aUn5swQzUTRanaaTwmszxiv89cvFwUCjF"],
            });
        }

        // Verify spy was called with correct parameters
        expect(airdropSpy).toHaveBeenCalled();
        const callArgs = airdropSpy.mock.calls[0];
        // Check parameter properties directly instead of instance type
        expect(callArgs[0]).toEqual(
            expect.objectContaining({
                mint: "4h2cMlJ5byq4iqZ73rKRSz9rLmLjQvEDf9lm6JFgNu",
                amount: 100,
                recipients: ["9aUn5swQzUTRanaaTwmszxiv89cvFwUCjF"],
            }),
        );
    });

    it("should handle 'Send 50 tokens from E5fU1X4TTq3XdVXz1wdYzbUYBzYQu5YnvLalwa0e2d1t to 2 recipients, each gets 50, with no logs.'", async () => {
        const wallet = mockWalletClient();
        const plugin = createMockPlugin("airdrop", new AirdropService());
        const tools = await getTools({ wallet, plugins: [plugin] });

        const airdropTool = tools.find((tool) => tool.name === "compressed_airdrop");
        expect(airdropTool).toBeDefined();

        if (airdropTool) {
            await airdropTool.execute({
                mint: "E5fU1X4TTq3XdVXz1wdYzbUYBzYQu5YnvLalwa0e2d1t",
                amount: 50,
                recipients: ["recipient1", "recipient2"],
                enableLogs: false,
            });
        }

        // Verify spy was called with correct parameters
        expect(airdropSpy).toHaveBeenCalled();
        const callArgs = airdropSpy.mock.calls[0];
        // Check parameter properties directly instead of instance type
        expect(callArgs[0]).toEqual(
            expect.objectContaining({
                mint: "E5fU1X4TTq3XdVXz1wdYzbUYBzYQu5YnvLalwa0e2d1t",
                amount: 50,
                recipients: ["recipient1", "recipient2"],
                enableLogs: false,
            }),
        );
    });
});
