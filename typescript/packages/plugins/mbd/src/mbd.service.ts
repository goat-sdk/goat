import { Tool, WalletClientBase } from "@goat-sdk/core";
import {
    GetContentRecommendationsParameters,
    GetPersonalizedFeedParameters,
    GetSimilarCastsParameters,
    GetSimilarUsersParameters,
    GetTrendAnalysisParameters,
    GetTrendingFeedParameters,
    GetUserInterestsParameters,
} from "./parameters";

// Define interfaces for API responses
interface MBDResponseItem {
    item_id: string;
}

interface NeynarCast {
    hash: string;
    text: string;
    // Add other properties as needed
}

interface NeynarUser {
    fid: number;
    // Add other properties as needed
}

interface SemanticLabel {
    labels?: {
        semantic?: Record<string, number>;
        sentiment?: {
            positive: number;
            negative: number;
            neutral?: number;
        };
    };
}

interface UserInterest {
    topic: string;
    score: number;
}

interface ContentRecommendation {
    interest: string;
    casts: NeynarCast[];
}

export class MBDSocialService {
    private mbdApiKey: string;
    private neynarApiKey: string;

    constructor(config: { mbdApiKey: string; neynarApiKey: string }) {
        this.mbdApiKey = config.mbdApiKey;
        this.neynarApiKey = config.neynarApiKey;
    }

    private async mbdRequest<T>(endpoint: string, method: string, body: Record<string, unknown>): Promise<T> {
        const url = `https://api.mbd.xyz/v1/farcaster${endpoint}`;
        const response = await fetch(url, {
            method: method,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "x-api-key": this.mbdApiKey,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`MBD API error: ${response.status} ${response.statusText}`);
        }

        return response.json() as Promise<T>;
    }

    private async neynarRequest<T>(endpoint: string, queryParams: Record<string, string> = {}): Promise<T> {
        const queryString = new URLSearchParams(queryParams).toString();
        const url = `https://api.neynar.com/v2/farcaster${endpoint}${queryString ? `?${queryString}` : ""}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                accept: "application/json",
                api_key: this.neynarApiKey,
            },
        });

        if (!response.ok) {
            throw new Error(`Neynar API error: ${response.status} ${response.statusText}`);
        }

        return response.json() as Promise<T>;
    }

    @Tool({
        name: "get_personalized_feed",
        description: "Get a personalized feed for a Farcaster user based on their interests and engagement",
    })
    async getPersonalizedFeed(walletClient: WalletClientBase, parameters: GetPersonalizedFeedParameters) {
        try {
            // Get recommended casts for the user from MBD
            const mbdResponse = await this.mbdRequest<{ body: MBDResponseItem[] }>("/casts/feed/for-you", "POST", {
                user_id: parameters.fid,
                scoring: parameters.scoring,
                limit: parameters.limit,
            });

            // Extract cast IDs from response
            const castIds = mbdResponse.body.map((item: MBDResponseItem) => item.item_id);

            // Get cast details from Neynar
            const castsData = await this.neynarRequest<{ casts: NeynarCast[] }>("/casts", {
                casts: castIds.join(","),
            });

            return {
                status: "success",
                message: `Retrieved ${castIds.length} personalized casts for user ${parameters.fid}`,
                casts: castsData.casts || [],
            };
        } catch (error) {
            return {
                status: "error",
                message: `Failed to get personalized feed: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    }

    @Tool({
        name: "get_similar_casts",
        description: "Find casts similar to a specific cast",
    })
    async getSimilarCasts(walletClient: WalletClientBase, parameters: GetSimilarCastsParameters) {
        try {
            // Get similar casts from MBD
            const mbdResponse = await this.mbdRequest<{ body: MBDResponseItem[] }>("/casts/feed/similar", "POST", {
                item_id: parameters.castId,
                limit: parameters.limit,
            });

            // Extract cast IDs from response
            const castIds = mbdResponse.body.map((item: MBDResponseItem) => item.item_id);

            // Get cast details from Neynar
            const castsData = await this.neynarRequest<{ casts: NeynarCast[] }>("/casts", {
                casts: castIds.join(","),
            });

            return {
                status: "success",
                message: `Found ${castIds.length} casts similar to ${parameters.castId}`,
                casts: castsData.casts || [],
            };
        } catch (error) {
            return {
                status: "error",
                message: `Failed to get similar casts: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    }

    @Tool({
        name: "get_trending_feed",
        description: "Get trending content on Farcaster within a specified time window",
    })
    async getTrendingFeed(walletClient: WalletClientBase, parameters: GetTrendingFeedParameters) {
        try {
            // Get trending feed from MBD
            const mbdResponse = await this.mbdRequest<{ body: MBDResponseItem[] }>("/casts/feed/trending", "POST", {
                scoring: parameters.scoring,
                limit: parameters.limit,
            });

            // Extract cast IDs from response
            const castIds = mbdResponse.body.map((item: MBDResponseItem) => item.item_id);

            // Get cast details from Neynar
            const castsData = await this.neynarRequest<{ casts: NeynarCast[] }>("/casts", {
                casts: castIds.join(","),
            });

            return {
                status: "success",
                message: `Retrieved ${castIds.length} trending casts with ${parameters.scoring} scoring`,
                casts: castsData.casts || [],
            };
        } catch (error) {
            return {
                status: "error",
                message: `Failed to get trending feed: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    }

    @Tool({
        name: "get_user_interests",
        description: "Analyze a user's casts and engagement to determine their interests",
    })
    async getUserInterests(walletClient: WalletClientBase, parameters: GetUserInterestsParameters) {
        try {
            // Get recent casts from Neynar
            const userCasts = await this.neynarRequest<{ casts: NeynarCast[] }>(`/user/${parameters.fid}/casts`, {
                limit: "100",
            });

            // Extract cast IDs
            const castIds = userCasts.casts.map((cast: NeynarCast) => cast.hash);

            // Get semantic labels from MBD
            const semanticLabels = await this.mbdRequest<{ body: SemanticLabel[] }>("/casts/labels/for-items", "POST", {
                items_list: castIds,
                label_category: "semantic",
            });

            // Process and aggregate interests
            const interests: Record<string, number> = {};

            // Replace forEach with for...of
            for (const item of semanticLabels.body) {
                if (item.labels?.semantic) {
                    for (const [topic, score] of Object.entries(item.labels.semantic)) {
                        if (typeof score === "number" && score > 0.6) {
                            interests[topic] = (interests[topic] || 0) + score;
                        }
                    }
                }
            }

            // Sort interests by score
            const sortedInterests = Object.entries(interests)
                .sort(([, scoreA], [, scoreB]) => (scoreB as number) - (scoreA as number))
                .map(([topic, score]) => ({ topic, score }));

            return {
                status: "success",
                message: `Analyzed interests for user ${parameters.fid}`,
                interests: sortedInterests,
                topInterests: sortedInterests.slice(0, 5).map((i) => i.topic),
            };
        } catch (error) {
            return {
                status: "error",
                message: `Failed to analyze user interests: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    }

    @Tool({
        name: "get_content_recommendations",
        description: "Generate personalized content recommendations based on a user's interests",
    })
    async getContentRecommendations(walletClient: WalletClientBase, parameters: GetContentRecommendationsParameters) {
        try {
            // First get user interests
            const interestsResult = await this.getUserInterests(walletClient, {
                fid: parameters.fid,
            });

            if (interestsResult.status === "error") {
                throw new Error(interestsResult.message);
            }

            const topInterests = interestsResult.topInterests || [];

            // Get trending content in user's interest areas
            const recommendedContent: ContentRecommendation[] = [];

            for (const interest of topInterests.slice(0, 3)) {
                // Search for relevant content using Neynar
                const searchResults = await this.neynarRequest<{ casts: NeynarCast[] }>("/search/casts", {
                    q: interest,
                    limit: "5",
                });

                if (searchResults.casts && searchResults.casts.length > 0) {
                    recommendedContent.push({
                        interest,
                        casts: searchResults.casts,
                    });
                }
            }

            return {
                status: "success",
                message: `Generated content recommendations for user ${parameters.fid}`,
                topInterests,
                recommendedContent,
                contentType: parameters.contentType,
            };
        } catch (error) {
            return {
                status: "error",
                message: `Failed to generate content recommendations: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    }

    @Tool({
        name: "get_similar_users",
        description: "Find users with similar interests and engagement patterns",
    })
    async getSimilarUsers(walletClient: WalletClientBase, parameters: GetSimilarUsersParameters) {
        try {
            // First get user interests
            const interestsResult = await this.getUserInterests(walletClient, {
                fid: parameters.fid,
            });

            if (interestsResult.status === "error") {
                throw new Error(interestsResult.message);
            }

            const topInterests = interestsResult.topInterests || [];

            // Find users active in these interest areas
            const similarUsers: NeynarUser[] = [];

            for (const interest of topInterests.slice(0, 2)) {
                // Search for relevant users using Neynar
                const searchResults = await this.neynarRequest<{ users: NeynarUser[] }>("/search/users", {
                    q: interest,
                    limit: String(Math.ceil(parameters.limit / 2)),
                });

                if (searchResults.users && searchResults.users.length > 0) {
                    // Filter out the original user
                    const filteredUsers = searchResults.users.filter((user: NeynarUser) => user.fid !== parameters.fid);

                    similarUsers.push(...filteredUsers);
                }
            }

            // Deduplicate users by FID
            const uniqueUsers = Array.from(
                new Map(similarUsers.map((user: NeynarUser) => [user.fid, user])).values(),
            ).slice(0, parameters.limit);

            return {
                status: "success",
                message: `Found ${uniqueUsers.length} users similar to ${parameters.fid}`,
                users: uniqueUsers,
                basedOnInterests: topInterests.slice(0, 2),
            };
        } catch (error) {
            return {
                status: "error",
                message: `Failed to find similar users: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    }

    @Tool({
        name: "get_trend_analysis",
        description: "Analyze trends in user's network and interest areas",
    })
    async getTrendAnalysis(walletClient: WalletClientBase, parameters: GetTrendAnalysisParameters) {
        try {
            // First get user interests
            const interestsResult = await this.getUserInterests(walletClient, {
                fid: parameters.fid,
            });

            if (interestsResult.status === "error") {
                throw new Error(interestsResult.message);
            }

            const topInterests = interestsResult.topInterests || [];

            // Get trending content from MBD
            const trendingResponse = await this.mbdRequest<{ body: MBDResponseItem[] }>(
                "/casts/feed/trending",
                "POST",
                {
                    scoring: parameters.timeframe === "24h" ? "24h" : parameters.timeframe === "7d" ? "7d" : "30d",
                    limit: 50,
                },
            );

            // Extract cast IDs and get details from Neynar
            const castIds = trendingResponse.body.map((item: MBDResponseItem) => item.item_id);
            const castsData = await this.neynarRequest<{ casts: NeynarCast[] }>("/casts", {
                casts: castIds.join(","),
            });

            // Get moderation and sentiment labels from MBD
            const labelData = await this.mbdRequest<{ body: SemanticLabel[] }>("/casts/labels/for-items", "POST", {
                items_list: castIds,
                label_category: "sentiment",
            });

            // Analyze trends in user interest areas
            const interestTrends: Record<string, NeynarCast[]> = {};

            for (const interest of topInterests.slice(0, 3)) {
                // Find casts related to this interest
                const relatedCasts = castsData.casts.filter((cast: NeynarCast) =>
                    cast.text?.toLowerCase().includes(interest.toLowerCase()),
                );

                if (relatedCasts.length > 0) {
                    interestTrends[interest] = relatedCasts;
                }
            }

            // Calculate overall sentiment in trending content
            let positiveCount = 0;
            let negativeCount = 0;
            let neutralCount = 0;

            // Replace forEach with for...of
            for (const item of labelData.body) {
                if (item.labels?.sentiment) {
                    const sentiment = item.labels.sentiment;
                    if (sentiment.positive > 0.6) {
                        positiveCount++;
                    } else if (sentiment.negative > 0.6) {
                        negativeCount++;
                    } else {
                        neutralCount++;
                    }
                }
            }

            return {
                status: "success",
                message: `Analyzed trends for user ${parameters.fid} over ${parameters.timeframe}`,
                topInterests,
                interestTrends,
                sentimentAnalysis: {
                    positive: positiveCount,
                    negative: negativeCount,
                    neutral: neutralCount,
                    total: labelData.body.length,
                },
                timeframe: parameters.timeframe,
            };
        } catch (error) {
            return {
                status: "error",
                message: `Failed to analyze trends: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    }
}
