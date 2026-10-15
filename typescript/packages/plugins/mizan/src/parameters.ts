import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class VerifyCredentialParameters extends createToolParameters(
    z.object({
        credentialId: z
            .string()
            .optional()
            .describe("Registry id of the MIZAN credential, e.g. 'v12-btc-trend-4h'. Omit if sha256 is given."),
        sha256: z.string().optional().describe("sha256 of the proof bundle, used instead of credentialId."),
    }),
) {}

export class SearchCredentialsParameters extends createToolParameters(
    z.object({
        query: z
            .string()
            .optional()
            .describe("Free text matched against credential id, alias, dataset and issuer, e.g. 'btc trend'"),
        alias: z.string().optional().describe("Substring of the public alias (the agent or strategy label)"),
        issuer: z.string().optional().describe("Substring of the issuer name"),
        verdict: z
            .enum(["PASS", "FAIL", "NOT_SIGNIFICANT", "SIGNIFICANT", "LEDGER_ENTRY"])
            .optional()
            .describe("Only return credentials with this verdict"),
        limit: z.number().int().min(1).max(100).optional().describe("Maximum results, default 20"),
    }),
) {}

export class ListDatasetsParameters extends createToolParameters(
    z.object({
        asset: z.string().optional().describe("Asset symbol filter, e.g. 'BTC'"),
        interval: z.string().optional().describe("Bar interval filter, e.g. '4h' or '1d'"),
        limit: z.number().int().min(1).max(200).optional().describe("Maximum results, default 50"),
    }),
) {}

export class CheckAgentParameters extends createToolParameters(
    z.object({
        agent: z
            .string()
            .describe(
                "The agent to check: name or alias, MIZAN credential id, wallet address, ERC-8004 id, agent-card URL or proof-bundle sha256",
            ),
        action: z.string().optional().describe("What you are about to do, e.g. 'copy', 'pay', 'allocate', 'follow'"),
    }),
) {}

export class ListProvenAgentsParameters extends createToolParameters(
    z.object({
        limit: z.number().int().min(1).max(200).optional().describe("Maximum results, default 25"),
        realOnly: z
            .boolean()
            .optional()
            .describe("Only Bitcoin-confirmed credentials (default true). Set false to include unconfirmed ones."),
    }),
) {}
