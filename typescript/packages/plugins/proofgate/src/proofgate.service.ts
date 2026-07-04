import { Tool } from "@goat-sdk/core";
import { ProofGateAPI } from "./api";
import { GetEvidenceParameters, IsSafeParameters, ValidateTransactionParameters } from "./parameters";

export class ProofGateService {
    constructor(
        private api: ProofGateAPI,
        private autoBlock: boolean = true,
    ) {}

    @Tool({
        name: "proofgate_validate_transaction",
        description:
            "Validate a blockchain transaction against ProofGate guardrails before execution. Returns detailed validation result including pass/fail status, reason, individual checks, and on-chain evidence. Use this to ensure DeFi transactions are safe.",
    })
    async validateTransaction(parameters: ValidateTransactionParameters) {
        const result = await this.api.validate({
            chainId: parameters.chainId,
            from: parameters.from,
            to: parameters.to,
            data: parameters.data,
            value: parameters.value,
            guardrailId: parameters.guardrailId,
        });

        if (this.autoBlock && result.result === "FAIL") {
            throw new Error(`Transaction blocked by ProofGate: ${result.reason}`);
        }

        return {
            safe: result.result === "PASS",
            result: result.result,
            reason: result.reason,
            validationId: result.validationId,
            checks: result.checks || [],
            severity: result.severity,
            chainId: result.chainId,
            chainName: result.chainName,
            evidenceUri: result.evidenceUri,
        };
    }

    @Tool({
        name: "proofgate_is_safe",
        description:
            "Quick safety check for a transaction. Returns true if safe, false if unsafe. Use for simple pass/fail checks before executing DeFi transactions.",
    })
    async isSafe(parameters: IsSafeParameters): Promise<{ safe: boolean; reason: string }> {
        try {
            const result = await this.api.validate({
                chainId: parameters.chainId,
                from: parameters.from,
                to: parameters.to,
                data: parameters.data,
                value: parameters.value,
                guardrailId: parameters.guardrailId,
            });

            const safe = result.result === "PASS";

            if (this.autoBlock && !safe) {
                throw new Error(`Transaction blocked by ProofGate: ${result.reason}`);
            }

            return { safe, reason: result.reason };
        } catch (error) {
            if (this.autoBlock) {
                throw error;
            }
            return {
                safe: false,
                reason: error instanceof Error ? error.message : "Validation failed",
            };
        }
    }

    @Tool({
        name: "proofgate_get_evidence",
        description:
            "Get the on-chain evidence for a previous validation. Use this to retrieve cryptographic proof that a transaction was validated.",
    })
    async getEvidence(parameters: GetEvidenceParameters) {
        const evidence = await this.api.getEvidence(parameters.validationId);
        return evidence;
    }
}
