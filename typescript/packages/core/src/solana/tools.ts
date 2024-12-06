import type { DeferredTool } from "../tools";
import type { SolanaWalletClient } from "../wallets";
import { getAddress, getBalance } from "./methods";
import { getAddressParametersSchema, getSOLBalanceParametersSchema } from "./parameters";

export const deferredSolanaTools: DeferredTool<SolanaWalletClient>[] = [
    {
        name: "get_address",
        description: "This {{tool}} returns the address of the Solana wallet.",
        parameters: getAddressParametersSchema,
        method: getAddress,
    },
    {
        name: "get_sol_balance",
        description: "This {{tool}} returns the SOL balance of a Solana wallet.",
        parameters: getSOLBalanceParametersSchema,
        method: getBalance,
    },
];
