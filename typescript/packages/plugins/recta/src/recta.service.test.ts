import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RectaPlugin } from "./recta.plugin";
import { RectaService } from "./recta.service";

const SENDER = "0x1234567890123456789012345678901234567890";
const TEMPLATE = {
    covered: true,
    body: {
        source_network: "ethereum",
        amount: "6000",
        sender: "<YOUR_SENDER>",
        recipient: "<RECIPIENT>",
        baseline_provider: "stargate_v2",
        execution_authority: {
            headroom: "0.2",
            source_max_fee_per_gas_wei: "<MAX_FEE_PER_GAS_WEI>",
            source_max_priority_fee_per_gas_wei: "<MAX_PRIORITY_FEE_PER_GAS_WEI>",
        },
    },
};
const TRIAL = { status: "TRIAL", outcome: "SAVING_FOUND", saving_usdc: "2.39903" };

function json(body: unknown, status = 200) {
    return { ok: status < 400, status, text: async () => JSON.stringify(body) } as Response;
}

describe("RectaService", () => {
    const fees = vi.fn(async () => ({ maxFeePerGas: 20_000_000_000n, maxPriorityFeePerGas: 2_000_000_000n }));
    const service = new RectaService(fees);
    let wallet: Record<string, ReturnType<typeof vi.fn>>;
    let fetchMock: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        wallet = {
            getAddress: vi.fn(() => SENDER),
            getChain: vi.fn(() => ({ type: "evm", id: 1 })),
            sendTransaction: vi.fn(),
            signMessage: vi.fn(),
            signTypedData: vi.fn(),
        };
        fetchMock = vi.spyOn(globalThis, "fetch");
    });
    afterEach(() => vi.restoreAllMocks());

    const args = { destinationNetwork: "base", asset: "USDC", amount: "6000", baselineProvider: "stargate_v2" as const };

    it("supports only EVM chains a Recta route can start from", () => {
        const plugin = new RectaPlugin({ estimateFeesPerGas: fees });
        expect(plugin.supportsChain({ type: "evm", id: 8453 })).toBe(true);
        expect(plugin.supportsChain({ type: "evm", id: 84532 })).toBe(false);
        expect(plugin.supportsChain({ type: "solana" })).toBe(false);
    });

    it("reads coverage from the wallet's chain", async () => {
        fetchMock.mockResolvedValue(json({ covered: true }));
        // biome-ignore lint/suspicious/noExplicitAny: test double
        expect(await service.checkRouteCoverage(wallet as any, { destinationNetwork: "base", asset: "USDC" })).toEqual({ covered: true });
        expect(fetchMock.mock.calls[0][0]).toBe(
            "https://api.recta.build/v1/golden-corridor/fit?source_network=ethereum&source_asset=USDC&destination_network=base&destination_asset=USDC",
        );
    });

    it("fills the template with the wallet's address and fees, and never signs or sends", async () => {
        fetchMock.mockResolvedValueOnce(json(TEMPLATE)).mockResolvedValueOnce(json(TRIAL));
        // biome-ignore lint/suspicious/noExplicitAny: test double
        expect(await service.compareBridgeRoute(wallet as any, args)).toEqual(TRIAL);
        const [url, init] = fetchMock.mock.calls[1] as [string, RequestInit];
        expect(url).toBe("https://api.recta.build/v1/golden-corridor/trial-evaluation");
        const sent = JSON.parse(init.body as string);
        expect(sent.sender).toBe(SENDER);
        expect(sent.recipient).toBe(SENDER);
        expect(sent.execution_authority).toEqual({
            headroom: "0.2",
            source_max_fee_per_gas_wei: "20000000000",
            source_max_priority_fee_per_gas_wei: "2000000000",
        });
        expect(fees).toHaveBeenCalledWith(1);
        expect(wallet.sendTransaction).not.toHaveBeenCalled();
        expect(wallet.signMessage).not.toHaveBeenCalled();
        expect(wallet.signTypedData).not.toHaveBeenCalled();
    });

    it("stops when Recta does not cover the transfer", async () => {
        fetchMock.mockResolvedValueOnce(json({ covered: false }));
        // biome-ignore lint/suspicious/noExplicitAny: test double
        expect(await service.compareBridgeRoute(wallet as any, args)).toEqual({ covered: false, answer: { covered: false } });
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("refuses a wallet on a chain Recta does not serve", async () => {
        wallet.getChain = vi.fn(() => ({ type: "evm", id: 84532 }));
        // biome-ignore lint/suspicious/noExplicitAny: test double
        await expect(service.compareBridgeRoute(wallet as any, args)).rejects.toThrow("cannot start on chain 84532");
        expect(fetchMock).not.toHaveBeenCalled();
    });
});
