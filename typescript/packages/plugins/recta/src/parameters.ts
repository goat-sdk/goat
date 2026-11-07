import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

const destinationNetwork = z
    .string()
    .describe("Recta's name for the destination network, e.g. 'arbitrum', 'base', 'ethereum', 'optimism', 'polygon'");
const asset = z.string().optional().default("USDC").describe("The stablecoin to move, e.g. 'USDC' or 'USDT'");

export class RectaCorridorParameters extends createToolParameters(
    z.object({
        destinationNetwork,
        asset,
    }),
) {}

export class RectaCompareRouteParameters extends createToolParameters(
    z.object({
        destinationNetwork,
        asset,
        amount: z
            .string()
            .regex(/^\d+(\.\d{1,6})?$/, "Amount must be a decimal number of whole units, e.g. 6000 or 250.5")
            .describe("The amount to move in whole units, e.g. '6000' for 6,000 USDC"),
        baselineProvider: z
            .enum(["across", "stargate_v2", "usdt0", "usdg_oft", "debridge_dln", "lifi"])
            .describe("The route you would use without Recta. The saving is measured against it"),
        recipient: z
            .string()
            .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid address format")
            .optional()
            .describe("Who receives the funds on the destination network (defaults to the wallet address)"),
    }),
) {}
