import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import {
    GetSettlementEstimateParameters,
    GetSettlementRiskParameters,
    GetWhaleTradesParameters,
    VerifyRecordParameters,
} from "./parameters";
import { PredgeAPI, type PredgePluginOptions } from "./predge.api";
import type { X402Signer } from "./x402";

/** Adapts a GOAT EVM wallet to the x402 signer, or undefined when it cannot pay. */
export function toX402Signer(walletClient: EVMWalletClient | undefined): X402Signer | undefined {
    if (typeof walletClient?.signTypedData !== "function") return undefined;
    return {
        address: walletClient.getAddress(),
        chainId: walletClient.getChain().id,
        signTypedData: async (data) => (await walletClient.signTypedData(data as never)).signature,
    };
}

export class PredgeService {
    private readonly api: PredgeAPI;

    constructor(options: PredgePluginOptions = {}) {
        this.api = new PredgeAPI(options);
    }

    @Tool({
        name: "predge_get_settlement_risk",
        description:
            "Check whether a Polymarket market's resolution is settled, disputed or at risk before trading, paying or settling on it. Free, no API key. Input: condition id (0x...), numeric market id or slug. Returns a record read live from UMA on Polygon and signed by Predge: risk_level (ok, watch, caution, resolved), recommendation, UMA state, disputes, and the ed25519 signature check against Predge's published key. Treat watch or caution as a reason to stop and tell the user. An error or a failed signature is not a 'no risk' answer.",
    })
    async getSettlementRisk(parameters: GetSettlementRiskParameters) {
        return this.api.getSettlementRisk(parameters.market);
    }

    @Tool({
        name: "predge_verify_record",
        description:
            "Verify a Predge signed record offline (settlement risk, attestation, signed call). Input: the record as a JSON string, either the full API response or its attestation envelope. Checks the ed25519 signature over the canonical bytes against Predge's pinned key (never the key inside the record), the payload, the content hash and the envelope signature. valid is true only if every check passes.",
    })
    async verifyRecord(parameters: VerifyRecordParameters) {
        return this.api.verifyRecord(parameters.record);
    }

    @Tool({
        name: "predge_get_settlement_estimate",
        description:
            "Buy Predge's signed settlement estimate for a Polymarket market: $0.02 USDC per call, paid automatically over x402 from the agent's wallet on Base. Failed requests (400/404/422/502) are not charged. Returns the same signed record as predge_get_settlement_risk plus settlement_estimate: for a market disputed and not yet resolved, the calibrated probability that it settles differently from the disputed proposal. Call predge_get_settlement_risk first and use this only when the market has a dispute.",
    })
    async getSettlementEstimate(walletClient: EVMWalletClient, parameters: GetSettlementEstimateParameters) {
        return this.api.getSettlementEstimate(toX402Signer(walletClient), parameters.market);
    }

    @Tool({
        name: "predge_get_whale_trades",
        description:
            "Buy the latest Polymarket whale trades from Predge: trades of $10,000+ notional with market, side, size, price, wallet and a Predge wallet score, delayed 15 minutes. $0.005 USDC per call, paid automatically over x402 from the agent's wallet on Base. Input: limit (1-100, default 20).",
    })
    async getWhaleTrades(walletClient: EVMWalletClient, parameters: GetWhaleTradesParameters) {
        return this.api.getWhaleTrades(toX402Signer(walletClient), parameters.limit);
    }
}
