const PROOFGATE_API_URL = "https://www.proofgate.xyz/api";

export interface ValidationRequest {
    chainId: number;
    from: string;
    to: string;
    data: string;
    value: string;
    guardrailId?: string;
}

export interface ValidationResponse {
    result: "PASS" | "FAIL";
    reason: string;
    validationId: string;
    checks?: Array<{
        check: string;
        passed: boolean;
        message: string;
        severity: "info" | "warning" | "critical";
    }>;
    severity?: "info" | "warning" | "critical";
    evidenceUri?: string;
    chainId?: number;
    chainName?: string;
}

export interface ProofGateAPIError {
    error: string;
    code?: string;
}

export class ProofGateAPI {
    constructor(private apiKey: string) {}

    async validate(request: ValidationRequest): Promise<ValidationResponse> {
        const response = await fetch(`${PROOFGATE_API_URL}/validate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify(request),
        });

        const data = await response.json();

        if (!response.ok) {
            const error = data as ProofGateAPIError;
            throw new Error(error.error || `ProofGate API error: ${response.status}`);
        }

        return data as ValidationResponse;
    }

    async getEvidence(validationId: string): Promise<{ uri: string; data: unknown }> {
        const response = await fetch(`${PROOFGATE_API_URL}/evidence/${validationId}`, {
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to get evidence: ${response.status}`);
        }

        return response.json();
    }
}
