import { z } from "zod";

export const getAddressParametersSchema = z.object({});

export const getCHRBalanceParametersSchema = z.object({
    address: z
        .optional(z.string())
        .describe("The address to get the balance of, defaults to the address of the wallet"),
});
