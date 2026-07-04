import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class NoParameters extends createToolParameters(z.object({})) {}

export class SendDmParameters extends createToolParameters(
    z.object({
        to_wallet: z.string().describe("Recipient Solana wallet address."),
        text: z.string().min(1).max(3000).describe("Plaintext message body to send."),
    }),
) {}

export class ReadDmsParameters extends createToolParameters(
    z.object({
        conv_id: z.string().describe("Deterministic conversation id returned by Deside."),
        limit: z.number().int().min(1).max(100).optional().describe("Maximum number of messages to return."),
        before_seq: z
            .number()
            .int()
            .positive()
            .optional()
            .describe("Read older messages with seq strictly lower than this value."),
    }),
) {}

export class MarkDmReadParameters extends createToolParameters(
    z.object({
        conv_id: z.string().describe("Deterministic conversation id returned by Deside."),
        seq: z.number().int().positive().describe("Highest message sequence to mark as read."),
        read_at: z.string().datetime().optional().describe("Optional ISO timestamp for the read marker."),
    }),
) {}

export class ListConversationsParameters extends createToolParameters(
    z.object({
        limit: z.number().int().min(1).max(100).optional().describe("Maximum number of conversations to return."),
        cursor: z.string().optional().describe("Opaque pagination cursor from a previous response."),
    }),
) {}

export class GetUserInfoParameters extends createToolParameters(
    z.object({
        wallet: z.string().describe("Solana wallet to inspect through Deside's public contract."),
    }),
) {}

export class SearchAgentsParameters extends createToolParameters(
    z.object({
        name: z.string().optional().describe("Partial agent name match."),
        category: z.string().optional().describe("Optional category filter."),
        wallet: z.string().optional().describe("Lookup a specific agent by wallet."),
        limit: z.number().int().min(1).max(50).optional().describe("Maximum number of results to return."),
        offset: z.number().int().min(0).optional().describe("Pagination offset."),
    }),
) {}
