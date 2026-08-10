import { Tool } from "@goat-sdk/core";
import { createYieldSignalClient } from "yieldsignal-client";
import {
    GetExitCapacityParameters,
    GetRateSensitivityParameters,
    GetSharedExposureParameters,
    GetYieldDecisionParameters,
    GetYieldDurabilityParameters,
    GetYieldSignalParameters,
} from "./parameters";
import type { YieldSignalOptions } from "./yieldsignal.plugin";

/**
 * Every tool here performs a real x402 payment before it returns data. The
 * payment is settled by the `x402Client` the caller passes in — this service
 * never provisions a wallet or picks a signer.
 */
export class YieldSignalService {
    private readonly client: ReturnType<typeof createYieldSignalClient>;

    constructor(options: YieldSignalOptions) {
        this.client = createYieldSignalClient(options.x402Client, { baseUrl: options.baseUrl });
    }

    @Tool({
        name: "yieldsignal_get_yield_signal",
        description:
            "Get the current risk-weighted best yield across lending protocols on Base (Aave, Compound, Morpho, Moonwell, Euler, Fluid) or liquid staking on Ethereum (Lido, Rocket Pool, cbETH, Frax, BETH). Returns the leading protocol, its risk-weighted APY in basis points and the gap to the runner-up, with the data source tagged per reading. Costs a small x402 payment in USDC on Base.",
    })
    async getYieldSignal(parameters: GetYieldSignalParameters) {
        return this.client.getSignal(parameters.asset);
    }

    @Tool({
        name: "yieldsignal_get_yield_decision",
        description:
            "Decide whether moving capital is worth the cost, given where it already sits. Returns MOVE or HOLD with the expected net gain, the break-even in days and a confidence tier — not just which protocol pays most. Use this instead of the raw signal when the agent already holds a position.",
    })
    async getYieldDecision(parameters: GetYieldDecisionParameters) {
        const { asset, ...input } = parameters;
        return this.client.getDecision(asset, input);
    }

    @Tool({
        name: "yieldsignal_get_yield_durability",
        description:
            "Check how much of a lending APY survives if reward campaigns stop. Splits each protocol's APY into base interest versus incentive and returns the post-incentive floor. Protocols that do not itemize their reward component are reported as undecomposable and never assumed incentive-free.",
    })
    async getYieldDurability(parameters: GetYieldDurabilityParameters) {
        return this.client.getDurability(parameters.asset);
    }

    @Tool({
        name: "yieldsignal_get_rate_sensitivity",
        description:
            "Measure how close a lending market is to the kink where borrow rates jump, read from the protocol's own on-chain interest rate curve. Answers whether a small change in utilization would move the rate a little or a lot.",
    })
    async getRateSensitivity(parameters: GetRateSensitivityParameters) {
        return this.client.getSensitivity(parameters.asset);
    }

    @Tool({
        name: "yieldsignal_get_exit_capacity",
        description:
            "Check whether a position of a given size can actually be withdrawn from a lending market right now. Returns per-protocol utilization and withdrawable liquidity read from the protocol's own books. Protocols that do not expose borrowed amounts are marked as not measured and are never reported as executable.",
    })
    async getExitCapacity(parameters: GetExitCapacityParameters) {
        return this.client.getCapacity(parameters.asset, parameters.amountUsd);
    }

    @Tool({
        name: "yieldsignal_get_shared_exposure",
        description:
            "Given positions across several lending venues, show how much capital sits behind the same underlying collateral, oracle or curator. Answers 'I am in N venues, but behind how many distinct risks?'. Positions are passed as 'protocol:usdAmount' pairs, comma separated.",
    })
    async getSharedExposure(parameters: GetSharedExposureParameters) {
        return this.client.getExposure(parameters.asset, parameters.positions);
    }
}
