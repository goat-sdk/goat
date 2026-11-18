import { beforeEach, describe, expect, it, vi } from "vitest";
import { RentShieldService, isValidSolanaPublicKey } from "./rentshield.service";

const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const SAMPLE_WALLET = "7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV";
const FAKE_SECRET_KEY = "5MaiiCavjCmn9Hs1o3eznqDEhRwxo7pXiAYez7keQUviUkauRiTMD8DrESdrNjN8zd9mTmVhRvBJeg5vhyvgrAhG";

describe("RentShieldService", () => {
    const fetchMock = vi.fn();

    beforeEach(() => {
        fetchMock.mockReset();
        vi.stubGlobal("fetch", fetchMock);
    });

    it("accepts 32-byte Solana public keys and rejects private keys or mnemonics", () => {
        expect(isValidSolanaPublicKey(USDC_MINT)).toBe(true);
        expect(isValidSolanaPublicKey(SAMPLE_WALLET)).toBe(true);
        expect(isValidSolanaPublicKey(FAKE_SECRET_KEY)).toBe(false);
        expect(isValidSolanaPublicKey("word1 word2 word3 word4")).toBe(false);
    });

    it("blocks private keys offline before calling fetch", async () => {
        const service = new RentShieldService();
        await expect(service.checkTokenRug({ mint: FAKE_SECRET_KEY } as never)).rejects.toThrow(/Invalid mint address/);
        await expect(service.scanWalletRent({ wallet: FAKE_SECRET_KEY } as never)).rejects.toThrow(
            /Invalid wallet address/,
        );
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("resolves live_endpoint.json on 404 and maps 11-layer audit fields", async () => {
        const service = new RentShieldService();
        fetchMock
            .mockResolvedValueOnce({ ok: false, status: 404 })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ ok: true, api_base: "https://edge.rentandrugshield.example" }),
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    ok: true,
                    mint: USDC_MINT,
                    symbol: "USDC",
                    score: 100,
                    safe_to_buy: true,
                    verdict: "SAFE",
                    layers_checked: 11,
                    layers_passed: 11,
                    checks: [{ layer: 1, key: "mint_auth", passed: true }],
                }),
            });

        const res = await service.checkTokenRug({ mint: USDC_MINT } as never);
        expect(res.score).toBe(100);
        expect(res.safeToBuy).toBe(true);
        expect(res.layersChecked).toBe(11);
        expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it("scans public wallet for 0%-first-claim empty ATA SOL rent", async () => {
        const service = new RentShieldService({ apiUrl: "https://edge.rentandrugshield.example" });
        fetchMock.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({
                ok: true,
                wallet: SAMPLE_WALLET,
                is_first_free_claim: true,
                effective_fee_bps: 0,
                reclaimable_count: 4,
                empty_count: 4,
                total_reclaimable_sol: 0.008157,
                total_reclaimable_lamports: 8157120,
            }),
        });

        const res = await service.scanWalletRent({ wallet: SAMPLE_WALLET } as never);
        expect(res.isFirstFreeClaim).toBe(true);
        expect(res.effectiveFeeBps).toBe(0);
        expect(res.emptyCount).toBe(4);
    });
});
