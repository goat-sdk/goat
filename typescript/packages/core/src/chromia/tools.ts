import type { DeferredTool } from "../tools";
import type { ChromiaWalletClient } from "../wallets";
import { getAddress, getBalance } from "./methods";
import { getAddressParametersSchema, getCHRBalanceParametersSchema } from "./parameters";

export const deferredChromiaTools: DeferredTool<ChromiaWalletClient>[] = [
    {
        name: "get_address",
        description: "This {{tool}} returns the address of the Chromia wallet.",
        parameters: getAddressParametersSchema,
        method: getAddress,
    },
    {
        name: "get_chr_balance",
        description: "This {{tool}} returns the CHR balance of a Chromia wallet.",
        parameters: getCHRBalanceParametersSchema,
        method: getBalance,
    },
];
