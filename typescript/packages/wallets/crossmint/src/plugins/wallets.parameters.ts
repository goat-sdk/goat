import { z } from "zod";

import { createToolParameters } from "@goat-sdk/core";

export class CreateWalletForTwitterUserParameters extends createToolParameters(
    z.object({
        username: z.string().describe("The username of the Twitter / X user"),
        chain: z.enum(["evm", "solana", "aptos", "cardano", "sui"]).describe("The chain of the wallet"),
    }),
) {}

export class CreateWalletForEmailParameters extends createToolParameters(
    z.object({
        email: z.string().describe("The email address of the user"),
        chain: z.enum(["evm", "solana", "aptos", "cardano", "sui"]).describe("The chain of the wallet"),
    }),
) {}

export class GetWalletByTwitterUsernameParameters extends createToolParameters(
    z.object({
        username: z.string().describe("The username of the Twitter / X user"),
        chain: z.string().describe("The chain of the wallet"),
    }),
) {}

export class GetWalletByEmailParameters extends createToolParameters(
    z.object({
        email: z.string().describe("The email address of the user"),
        chain: z.string().describe("The chain of the wallet"),
    }),
) {}
