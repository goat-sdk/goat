import { z } from "zod";

export const DisperseEtherParameters = z.object({
    recipients: z
        .array(z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid address"))
        .nonempty(),
    amounts: z.array(z.string().regex(/^\d+$/, "Invalid amount")).nonempty(),
});

export const DisperseTokenParameters = z.object({
    token: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid token address"),
    recipients: z
        .array(z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid address"))
        .nonempty(),
    amounts: z.array(z.string().regex(/^\d+$/, "Invalid amount")).nonempty(),
});
