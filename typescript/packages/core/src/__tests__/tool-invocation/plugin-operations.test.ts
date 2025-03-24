import "reflect-metadata";
import { beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";
import { Tool } from "../../decorators/Tool";
import { getTools } from "../../utils/getTools";
import { MockWalletClient, createToolExecutionSpy } from "./mock-utils";
import { createMockParameters, createMockPlugin } from "./test-utils";

describe("Plugin-specific operations", () => {
    describe("solana_compressed_airdrop tool", () => {
        const airdropSpy = createToolExecutionSpy();

        class AirdropParameters extends createMockParameters(
            z.object({
                mint: z.string().describe("Token mint address"),
                amount: z.number().describe("Amount to airdrop"),
                recipients: z.array(z.string()).describe("Recipient addresses"),
                enableLogs: z.boolean().optional().describe("Enable logs"),
            })
        ) {
            static schema = z.object({
                mint: z.string().describe("Token mint address"),
                amount: z.number().describe("Amount to airdrop"),
                recipients: z.array(z.string()).describe("Recipient addresses"),
                enableLogs: z.boolean().optional().describe("Enable logs"),
            });
        }

        class AirdropService {
            @Tool({
                description: "Airdrop tokens to multiple recipients",
            })
            async airdrop(wallet: MockWalletClient, params: AirdropParameters) {
                return airdropSpy(wallet, params);
            }
        }

        beforeEach(() => {
            airdropSpy.mockReset();
            airdropSpy.mockResolvedValue({ success: true, txIds: ["tx1", "tx2"] });
        });

        it("should trigger airdrop with correct parameters", async () => {
            const wallet = new MockWalletClient();
            const plugin = createMockPlugin("airdrop", new AirdropService());
            const tools = await getTools({ wallet, plugins: [plugin] });

            const airdropTool = tools.find((tool) => tool.name === "airdrop");
            expect(airdropTool).toBeDefined();

            if (airdropTool) {
                await airdropTool.execute({
                    mint: "4h2cMlJ5byq4iqZ73rKRSz9rLmLjQvEDf9lm6JFgNu",
                    amount: 100,
                    recipients: ["9aUn5swQzUTRanaaTwmszxiv89cvFwUCjF"],
                    enableLogs: false,
                });
            }

            expect(airdropSpy).toHaveBeenCalledWith(wallet, {
                mint: "4h2cMlJ5byq4iqZ73rKRSz9rLmLjQvEDf9lm6JFgNu",
                amount: 100,
                recipients: ["9aUn5swQzUTRanaaTwmszxiv89cvFwUCjF"],
                enableLogs: false,
            });
        });
    });

    describe("jupiter_swap tool", () => {
        const jupiterSwapSpy = createToolExecutionSpy();

        class JupiterSwapParameters extends createMockParameters(
            z.object({
                inputMint: z.string().describe("Input token mint address"),
                outputMint: z.string().describe("Output token mint address"),
                amount: z.number().describe("Amount to swap"),
                slippage: z.number().optional().describe("Slippage tolerance in percentage"),
            })
        ) {
            static schema = z.object({
                inputMint: z.string().describe("Input token mint address"),
                outputMint: z.string().describe("Output token mint address"),
                amount: z.number().describe("Amount to swap"),
                slippage: z.number().optional().describe("Slippage tolerance in percentage"),
            });
        }

        class JupiterService {
            @Tool({
                description: "Swap tokens using Jupiter DEX",
            })
            async jupiterSwap(wallet: MockWalletClient, params: JupiterSwapParameters) {
                return jupiterSwapSpy(wallet, params);
            }
        }

        beforeEach(() => {
            jupiterSwapSpy.mockReset();
            jupiterSwapSpy.mockResolvedValue({ txId: "jupiterTx123", outputAmount: "42.5" });
        });

        it("should trigger Jupiter swap with correct parameters", async () => {
            const wallet = new MockWalletClient();
            const plugin = createMockPlugin("jupiter", new JupiterService());
            const tools = await getTools({ wallet, plugins: [plugin] });

            const swapTool = tools.find((tool) => tool.name === "jupiter_swap");
            expect(swapTool).toBeDefined();

            if (swapTool) {
                await swapTool.execute({
                    inputMint: "USDC",
                    outputMint: "SOL",
                    amount: 5,
                    slippage: 0.5,
                });
            }

            expect(jupiterSwapSpy).toHaveBeenCalledWith(wallet, {
                inputMint: "USDC",
                outputMint: "SOL",
                amount: 5,
                slippage: 0.5,
            });
        });
    });

    describe("coingecko_price tool", () => {
        const priceSpy = createToolExecutionSpy();

        class CoinGeckoParameters extends createMockParameters(
            z.object({
                coinId: z.string().describe("CoinGecko coin ID"),
                vsCurrency: z.string().describe("Currency to get price in"),
            })
        ) {
            static schema = z.object({
                coinId: z.string().describe("CoinGecko coin ID"),
                vsCurrency: z.string().describe("Currency to get price in"),
            });
        }

        class CoinGeckoService {
            @Tool({
                description: "Get cryptocurrency price from CoinGecko",
            })
            async getPrice(wallet: MockWalletClient, params: CoinGeckoParameters) {
                return priceSpy(wallet, params);
            }
        }

        beforeEach(() => {
            priceSpy.mockReset();
            priceSpy.mockResolvedValue({ price: 30000, lastUpdated: "2023-01-01T00:00:00Z" });
        });

        it("should trigger CoinGecko price check with correct parameters", async () => {
            const wallet = new MockWalletClient();
            const plugin = createMockPlugin("coingecko", new CoinGeckoService());
            const tools = await getTools({ wallet, plugins: [plugin] });

            const priceTool = tools.find((tool) => tool.name === "get_price");
            expect(priceTool).toBeDefined();

            if (priceTool) {
                await priceTool.execute({
                    coinId: "bitcoin",
                    vsCurrency: "usd",
                });
            }

            expect(priceSpy).toHaveBeenCalledWith({
                coinId: "bitcoin",
                vsCurrency: "usd",
            });
        });
    });
});
