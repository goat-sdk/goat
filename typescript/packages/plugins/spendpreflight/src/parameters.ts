import { z } from "zod";

export const checkParameters = z
    .object({
        domain: z.string().max(2048).optional().describe("Merchant domain or URL"),
        address: z.string().max(128).optional().describe("Payee wallet address"),
        name: z.string().max(256).optional().describe("Merchant legal name"),
    })
    .refine((p) => Boolean(p.domain || p.address || p.name), "Provide domain, address or name");

export const preflightParameters = z
    .object({
        challenge: z
            .record(z.unknown())
            .optional()
            .describe("The x402 PaymentRequired body received from the merchant"),
        cart: z
            .object({
                merchant_domain: z.string().max(2048).optional(),
                total_usd: z.number().nonnegative().optional(),
                pay_to: z.string().max(128).optional(),
                merchant_name: z.string().max(256).optional(),
            })
            .optional(),
        resource_url: z.string().url().max(2048).optional(),
        rules: z.record(z.unknown()).optional().describe("Optional SpendPreflight spending rules"),
        spent_today_usd: z.number().nonnegative().optional(),
    })
    .refine((p) => Boolean(p.challenge || p.cart), "Provide an x402 challenge or a cart");

export const checkResult = z
    .object({
        risk: z.enum(["low", "medium", "high", "unknown"]),
        flags: z.array(z.string()),
        data_as_of: z.string(),
        disclaimer: z.string(),
    })
    .passthrough();
export const preflightResult = z
    .object({
        decision: z.enum(["allow", "hold", "block"]),
        reasons: z.array(z.string()),
        receipt: z.object({ id: z.string().min(1) }).passthrough(),
    })
    .passthrough();
