import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class ValidateTransactionParameters extends createToolParameters(
    z.object({
        chainId: z.number().describe("The chain ID of the network (e.g., 1 for Ethereum, 8453 for Base)"),
        from: z
            .string()
            .regex(/^0x[a-fA-F0-9]{40}$/)
            .describe("The sender wallet address (0x...)"),
        to: z
            .string()
            .regex(/^0x[a-fA-F0-9]{40}$/)
            .describe("The recipient/contract address (0x...)"),
        data: z.string().describe("The transaction calldata (hex string starting with 0x)"),
        value: z.string().default("0").describe("The transaction value in wei"),
        guardrailId: z
            .string()
            .optional()
            .describe("Optional guardrail/policy ID to validate against specific rules"),
    }),
) {}

export class IsSafeParameters extends createToolParameters(
    z.object({
        chainId: z.number().describe("The chain ID of the network"),
        from: z
            .string()
            .regex(/^0x[a-fA-F0-9]{40}$/)
            .describe("The sender wallet address"),
        to: z
            .string()
            .regex(/^0x[a-fA-F0-9]{40}$/)
            .describe("The recipient/contract address"),
        data: z.string().describe("The transaction calldata"),
        value: z.string().default("0").describe("The transaction value in wei"),
        guardrailId: z.string().optional().describe("Optional guardrail/policy ID"),
    }),
) {}

export class GetEvidenceParameters extends createToolParameters(
    z.object({
        validationId: z
            .string()
            .describe("The validation ID returned from a previous validation (e.g., val_xxx_xxx)"),
    }),
) {}
