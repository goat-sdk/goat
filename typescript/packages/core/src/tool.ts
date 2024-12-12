import type { z } from "zod";
import type { WalletClient } from "./wallets";

// biome-ignore lint/suspicious/noExplicitAny: Tools can return any type
export type Tool<TResult = any> = {
    name: string;
    description: string;
    parameters: z.ZodSchema;
    method: (parameters: z.infer<z.ZodSchema>) => TResult | Promise<TResult>;
};

export type UnwrappedTool<TWalletClient extends WalletClient> = {
    name: string;
    description: string;
    parameters: z.ZodSchema;
    method: (walletClient: TWalletClient, parameters: z.infer<z.ZodSchema>) => string | Promise<string>;
};
