import { PluginBase, WalletClientBase } from "@goat-sdk/core";
import { FarcasterClient } from "./farcaster.service";
import { FarcasterConfig } from "./types";

export class FarcasterPlugin extends PluginBase<WalletClientBase> {
    private client: FarcasterClient;

    constructor(config: FarcasterConfig) {
        super("farcaster", []);
        this.client = new FarcasterClient(config);
    }

    // Plugin supports all chains since Farcaster is chain-agnostic
    supportsChain = (chain: Chain) => true;

    getTools() {
        return [
            // Get cast by URL or hash
            createTool(
                {
                    name: "get_cast",
                    description: "Get a cast by its URL or hash",
                    parameters: z.object({
                        identifier: z.string().describe("Cast URL or hash"),
                        type: z.enum(["url", "hash"]).default("hash").describe("Type of identifier"),
                    }),
                },
                async (params) => {
                    const result = await this.client.getCast(params.identifier, params.type);
                    return result;
                },
            ),

            // Publish new cast
            createTool(
                {
                    name: "publish_cast",
                    description: "Publish a new cast",
                    parameters: z.object({
                        signer_uuid: z.string().describe("UUID of the signer"),
                        text: z.string().describe("Content of the cast"),
                        parent: z.string().optional().describe("Parent URL or hash for replies"),
                        channel_id: z.string().optional().describe("Channel ID to post in"),
                    }),
                },
                async (params) => {
                    const result = await this.client.publishCast(params.signer_uuid, params.text, {
                        parent: params.parent,
                        channelId: params.channel_id,
                    });
                    return result;
                },
            ),

            // Search casts
            createTool(
                {
                    name: "search_casts",
                    description: "Search for casts",
                    parameters: z.object({
                        query: z.string().describe("Search query"),
                        author_fid: z.number().optional().describe("Filter by author FID"),
                        viewer_fid: z.number().optional().describe("Viewer FID for personalization"),
                        limit: z.number().min(1).max(100).optional().describe("Number of results"),
                    }),
                },
                async (params) => {
                    const result = await this.client.searchCasts(params.query, {
                        authorFid: params.author_fid,
                        viewerFid: params.viewer_fid,
                        limit: params.limit,
                    });
                    return result;
                },
            ),

            // Get conversation
            createTool(
                {
                    name: "get_conversation",
                    description: "Get a conversation thread",
                    parameters: z.object({
                        identifier: z.string().describe("Cast URL or hash"),
                        type: z.enum(["url", "hash"]).default("hash").describe("Type of identifier"),
                        reply_depth: z.number().min(0).max(5).optional().describe("Depth of replies"),
                        limit: z.number().min(1).max(50).optional().describe("Number of results"),
                    }),
                },
                async (params) => {
                    const result = await this.client.getConversation(params.identifier, {
                        type: params.type,
                        replyDepth: params.reply_depth,
                        limit: params.limit,
                    });
                    return result;
                },
            ),
        ];
    }
}
