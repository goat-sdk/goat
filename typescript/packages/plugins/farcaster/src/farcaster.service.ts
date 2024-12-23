import type { WalletClientBase } from "@goat-sdk/core";
import { z } from "zod";
import { PublishCastOptions, PublishCastOptionsSchema } from "./parameters";
import { FarcasterConfig } from "./types";

export class FarcasterClient {
    private apiKey: string;
    private baseUrl: string;

    constructor(config: FarcasterConfig) {
        this.apiKey = config.apiKey;
        this.baseUrl = config.baseUrl || "https://api.neynar.com/v2/farcaster";
    }

    private async makeRequest(endpoint: string, options: RequestInit = {}) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                accept: "application/json",
                "x-api-key": this.apiKey,
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`Farcaster API error: ${response.statusText}`);
        }

        return response.json();
    }

    // Cast methods
    async getCast(identifier: string, type: "url" | "hash" = "hash") {
        return this.makeRequest(`/cast?identifier=${identifier}&type=${type}`);
    }

    async publishCast(signerUuid: string, text: string, options: PublishCastOptions = {}) {
        const validatedOptions = PublishCastOptionsSchema.parse(options);

        return this.makeRequest("/cast", {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({
                signer_uuid: signerUuid,
                text,
                ...validatedOptions,
            }),
        });
    }

    async searchCasts(
        query: string,
        options: {
            authorFid?: number;
            viewerFid?: number;
            limit?: number;
            cursor?: string;
        } = {},
    ) {
        const params = new URLSearchParams({
            q: query,
            ...Object.fromEntries(Object.entries(options).map(([key, value]) => [key, String(value)])),
        });
        return this.makeRequest(`/cast/search?${params}`);
    }

    async getConversation(
        identifier: string,
        options: {
            type?: "url" | "hash";
            replyDepth?: number;
            limit?: number;
        } = {},
    ) {
        const params = new URLSearchParams({
            identifier,
            type: options.type || "hash",
            reply_depth: String(options.replyDepth || 2),
            limit: String(options.limit || 20),
        });
        return this.makeRequest(`/cast/conversation?${params}`);
    }
}
