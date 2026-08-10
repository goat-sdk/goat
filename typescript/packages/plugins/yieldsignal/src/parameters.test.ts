import { describe, expect, it } from "vitest";
import {
    GetExitCapacityParameters,
    GetRateSensitivityParameters,
    GetSharedExposureParameters,
    GetYieldDecisionParameters,
    GetYieldDurabilityParameters,
    GetYieldSignalParameters,
} from "./parameters";

/**
 * These schemas are what the LLM sees, so a wrong default or a missing
 * required field is a silent behaviour change rather than a crash.
 *
 * Only the parameter classes are exercised here. The service is decorated with
 * `@Tool`, which resolves its schema through `design:paramtypes` reflection
 * metadata — esbuild-based runners (vitest included) do not emit that metadata,
 * so importing the service under vitest would throw regardless of correctness.
 */
describe("YieldSignal parameters", () => {
    it("defaults every asset to USDC so the tools are callable with no arguments", () => {
        expect(GetYieldSignalParameters.schema.parse({}).asset).toBe("USDC");
        expect(GetYieldDecisionParameters.schema.parse({}).asset).toBe("USDC");
        expect(GetYieldDurabilityParameters.schema.parse({}).asset).toBe("USDC");
        expect(GetRateSensitivityParameters.schema.parse({}).asset).toBe("USDC");
        expect(GetExitCapacityParameters.schema.parse({}).asset).toBe("USDC");
    });

    it("accepts ETH_STAKING only where the product actually covers it", () => {
        expect(GetYieldSignalParameters.schema.parse({ asset: "ETH_STAKING" }).asset).toBe("ETH_STAKING");
        expect(GetYieldDecisionParameters.schema.parse({ asset: "ETH_STAKING" }).asset).toBe("ETH_STAKING");
    });

    // The four analytics are lending-only by measurement: liquid staking has no
    // utilization curve, no borrow side and no itemized incentive component.
    // Accepting ETH_STAKING here would let an agent pay for a report that cannot
    // be computed.
    it("rejects ETH_STAKING on the lending-only analytics", () => {
        for (const Params of [
            GetYieldDurabilityParameters,
            GetRateSensitivityParameters,
            GetExitCapacityParameters,
            GetSharedExposureParameters,
        ]) {
            expect(() => Params.schema.parse({ asset: "ETH_STAKING", positions: "aave:1" })).toThrow();
        }
    });

    it("requires positions on shared exposure — it is the whole input of the report", () => {
        expect(() => GetSharedExposureParameters.schema.parse({})).toThrow();
        expect(GetSharedExposureParameters.schema.parse({ positions: "aave:200000,morpho:150000" }).positions).toBe(
            "aave:200000,morpho:150000",
        );
    });

    it("keeps decision inputs optional so the tool degrades to a plain recommendation", () => {
        const parsed = GetYieldDecisionParameters.schema.parse({ position: "aave", amountUsd: 25000 });
        expect(parsed.position).toBe("aave");
        expect(parsed.amountUsd).toBe(25000);
        expect(parsed.horizonDays).toBeUndefined();
    });
});
