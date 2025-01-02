import { z } from "zod";

/**
 * Parameters schema for depositing tokens into a Steer Smart Pool
 */
export const depositParametersSchema = z.object({
    // Pool address where liquidity will be deposited
    poolAddress: z.string().describe("The address of the Steer Smart Pool"),

    // Amount of token0 to deposit
    amount0Desired: z.string().describe("The desired amount of token0 to deposit in its base unit"),

    // Amount of token1 to deposit
    amount1Desired: z.string().describe("The desired amount of token1 to deposit in its base unit"),

    // Minimum amount of token0 to accept (slippage protection)
    amount0Min: z
        .string()
        .describe(
            "The minimum amount of token0 to deposit, in base units (e.g. wei, not ether). Used for slippage protection.",
        )
        .default("0"),

    // Minimum amount of token1 to accept (slippage protection)
    amount1Min: z
        .string()
        .describe(
            "The minimum amount of token1 to deposit, in base units (e.g. wei, not ether). Used for slippage protection.",
        )
        .default("0"),

    // Optional deadline for the transaction
    deadline: z
        .number()
        .optional()
        .default(60 * 60 * 24)
        .describe("Optional deadline for the transaction"),
});

/**
 * Parameters schema for withdrawing tokens from a Steer Smart Pool
 */
export const withdrawParametersSchema = z.object({
    // Pool address to withdraw from
    poolAddress: z.string().describe("The address of the Steer Smart Pool"),

    // Number of LP shares to withdraw
    shares: z.string().describe("The number of pool shares to withdraw"),

    // Minimum amount of token0 to receive (slippage protection)
    amount0Min: z
        .string()
        .describe(
            "The minimum amount of token0 to deposit, in base units (e.g. wei, not ether). Used for slippage protection.",
        )
        .default("0"),

    // Minimum amount of token1 to receive (slippage protection)
    amount1Min: z
        .string()
        .describe(
            "The minimum amount of token1 to deposit, in base units (e.g. wei, not ether). Used for slippage protection.",
        )
        .default("0"),
});

/**
 * Parameters schema for checking pool information
 */
export const getPoolInfoParametersSchema = z.object({
    poolAddress: z.string().describe("The address of the Steer Smart Pool"),
});

/**
 * Parameters schema for checking user's pool position
 */
export const getUserPositionParametersSchema = z.object({
    poolAddress: z.string().describe("The address of the Steer Smart Pool"),

    userAddress: z.string().describe("The address of the user to check"),
});

// Export all parameter types
export type DepositParameters = z.infer<typeof depositParametersSchema>;
export type WithdrawParameters = z.infer<typeof withdrawParametersSchema>;
export type GetPoolInfoParameters = z.infer<typeof getPoolInfoParametersSchema>;
export type GetUserPositionParameters = z.infer<typeof getUserPositionParametersSchema>;
