import { z } from "zod";


const paginationSchema = z.object({
    limit: z.number().min(1).max(100).optional().describe("Number of results to return"),
    cursor: z.string().optional().describe("Pagination cursor for fetching next page"),
});


export const getCastParametersSchema = z.object({
    identifier: z.string().describe("Cast URL or hash identifier"),
    type: z.enum(["url", "hash"])
        .default("hash")
        .describe("Type of identifier (url or hash)"),
    viewer_fid: z.number().optional()
        .describe("Viewer's FID to include viewer-specific context"),
});


export const publishCastParametersSchema = z.object({
    signer_uuid: z.string()
        .describe("UUID of the signer. Must be approved for the API key"),
    text: z.string()
        .max(320)
        .describe("Content of the cast (max 320 characters)"),
    parent: z.string()
        .optional()
        .describe("Parent URL or hash for replies"),
    channel_id: z.string()
        .optional()
        .describe("Channel ID to post in (e.g., 'neynar', 'farcaster')"),
    embeds: z.array(z.object({
        url: z.string().optional(),
        cast_id: z.object({
            hash: z.string(),
            fid: z.number(),
        }).optional(),
    }))
        .optional()
        .describe("Optional embeds for the cast (URLs or other casts)"),
});


export const searchCastsParametersSchema = z.object({
    query: z.string()
        .describe("Search query string"),
    author_fid: z.number()
        .optional()
        .describe("Filter results by author FID"),
    viewer_fid: z.number()
        .optional()
        .describe("Viewer FID for personalized results"),
    parent_url: z.string()
        .optional()
        .describe("Filter by parent URL"),
    channel_id: z.string()
        .optional()
        .describe("Filter by channel ID"),
    priority_mode: z.boolean()
        .optional()
        .default(false)
        .describe("Only show results from power users and followed users"),
}).merge(paginationSchema);

// Schema for getting a conversation
export const getConversationParametersSchema = z.object({
    identifier: z.string()
        .describe("Cast URL or hash identifier"),
    type: z.enum(["url", "hash"])
        .default("hash")
        .describe("Type of identifier (url or hash)"),
    reply_depth: z.number()
        .min(0)
        .max(5)
        .optional()
        .default(2)
        .describe("Depth of replies to fetch (0-5)"),
    include_parent_casts: z.boolean()
        .optional()
        .default(false)
        .describe("Include parent casts in chronological order"),
    viewer_fid: z.number()
        .optional()
        .describe("Viewer's FID to include viewer-specific context"),
}).merge(paginationSchema);


export const getConversationSummaryParametersSchema = z.object({
    identifier: z.string()
        .describe("Cast URL or hash identifier"),
    limit: z.number()
        .min(1)
        .max(50)
        .optional()
        .default(20)
        .describe("Number of casts to consider in summary"),
    prompt: z.string()
        .optional()
        .describe("Additional prompt for summary generation"),
});


export const bulkGetCastsParametersSchema = z.object({
    hashes: z.array(z.string())
        .min(1)
        .max(100)
        .describe("Array of cast hashes to fetch"),
    viewer_fid: z.number()
        .optional()
        .describe("Viewer's FID to include viewer-specific context"),
});


export const deleteCastParametersSchema = z.object({
    signer_uuid: z.string()
        .describe("UUID of the signer who owns the cast"),
    hash: z.string()
        .describe("Hash of the cast to delete"),
});


export type GetCastParameters = z.infer<typeof getCastParametersSchema>;
export type PublishCastParameters = z.infer<typeof publishCastParametersSchema>;
export type SearchCastsParameters = z.infer<typeof searchCastsParametersSchema>;
export type GetConversationParameters = z.infer<typeof getConversationParametersSchema>;
export type GetConversationSummaryParameters = z.infer<typeof getConversationSummaryParametersSchema>;
export type BulkGetCastsParameters = z.infer<typeof bulkGetCastsParametersSchema>;
export type DeleteCastParameters = z.infer<typeof deleteCastParametersSchema>;