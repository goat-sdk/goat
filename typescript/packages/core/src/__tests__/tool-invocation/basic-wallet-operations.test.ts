import "reflect-metadata";
import { beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";
import { Tool } from "../../decorators/Tool";
import { getTools } from "../../utils/getTools";
import { MockWalletClient, createToolExecutionSpy } from "./mock-utils";
import { createMockParameters, createMockPlugin } from "./test-utils";

describe("Basic wallet operations", () => {
    describe("balance_check tool", () => {
        const balanceCheckSpy = createToolExecutionSpy();

        class BalanceParameters extends createMockParameters(
            z.object({
                address: z.string().describe("Wallet address to check"),
            }),
        ) {}

        class BalanceService {
            @Tool({
                description: "Check the balance of a wallet"
            })
            async checkBalance(params: BalanceParameters) {
                return balanceCheckSpy(params);
            }
        }

        beforeEach(() => {
            balanceCheckSpy.mockReset();
            balanceCheckSpy.mockResolvedValue({ balance: "100", symbol: "SOL" });
        });

        it("should trigger balance check with correct parameters", async () => {
            const wallet = new MockWalletClient();
            const plugin = createMockPlugin("balance", new BalanceService());
            const tools = await getTools({ wallet, plugins: [plugin] });

            // Find the balance check tool
            const balanceTool = tools.find((tool) => tool.name === "check_balance");
            expect(balanceTool).toBeDefined();

            // Execute the tool
            if (balanceTool) {
                await balanceTool.execute({ address: "abc123" });
            }

            // Verify the tool was called with correct parameters
            expect(balanceCheckSpy).toHaveBeenCalledWith({ address: "abc123" });
        });
    });

    describe("transfer tool", () => {
        const transferSpy = createToolExecutionSpy();

        class TransferParameters extends createMockParameters(
            z.object({
                to: z.string().describe("Recipient address"),
                amount: z.string().describe("Amount to transfer"),
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

        it("should trigger transfer with correct parameters", async () => {
            const wallet = new MockWalletClient();
            const plugin = createMockPlugin("transfer", new TransferService());
            const tools = await getTools({ wallet, plugins: [plugin] });

            // Find the transfer tool
            const transferTool = tools.find((tool) => tool.name === "transfer");
            expect(transferTool).toBeDefined();

            // Execute the tool
            if (transferTool) {
                await transferTool.execute({ to: "0xabc", amount: "1.5" });
            }

            // Verify the tool was called with correct parameters
            expect(transferSpy).toHaveBeenCalledWith(wallet, { to: "0xabc", amount: "1.5" });
        });
    });
});
