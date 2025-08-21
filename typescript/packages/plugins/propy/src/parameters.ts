import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class GetStakingPowerParameters extends createToolParameters(
    z.object({
        ownWalletAddress: z.string().describe("The users own wallet address"),
        specifiedWalletAddress: z
            .string()
            .describe("A different wallet address to ownWalletAddress, explicitly specified within the user's prompt"),
        hasSpecifiedWalletAddress: z
            .boolean()
            .describe(
                "Whether or not the user has explicitly specified a wallet address, should be false if ownWalletAddress and specifiedWalletAddress match each other",
            ),
    }),
) {}

export class GetStakingRemainingLockupParameters extends createToolParameters(
    z.object({
        ownWalletAddress: z.string().describe("The users own wallet address"),
        specifiedWalletAddress: z
            .string()
            .describe("A different wallet address to ownWalletAddress, explicitly specified within the user's prompt"),
        hasSpecifiedWalletAddress: z
            .boolean()
            .describe(
                "Whether or not the user has explicitly specified a wallet address, should be false if ownWalletAddress and specifiedWalletAddress match each other",
            ),
        selectedStakingModules: z
            .array(
                z.object({
                    moduleName: z.enum(["PRO", "PropyKeys", "UniswapLPNFT"]),
                }),
            )
            .default([
                {
                    moduleName: "PRO",
                },
                {
                    moduleName: "PropyKeys",
                },
                {
                    moduleName: "UniswapLPNFT",
                },
            ])
            .describe(
                "The user-specified modules that they want to check the remaining lockup period of, usually we would check for all modules but if they ask about the lockup associated with a particular asset, we will just check for the lockups associated with the specified assets, multiple modules can be specified",
            ),
    }),
) {}
