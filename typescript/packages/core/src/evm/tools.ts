import type { DeferredTool } from "../tools";
import type { AnyEVMWalletClient } from "../wallets";
import { getAddress, getBalance } from "./methods";
import { getAddressParametersSchema, getETHBalanceParametersSchema } from "./parameters";

export const deferredEVMCoreTools: DeferredTool<AnyEVMWalletClient>[] = [
    {
        name: "get_address",
        description: "This {{tool}} returns the address of the EVM wallet.",
        parameters: getAddressParametersSchema,
        method: getAddress,
    },
    {
        name: "get_eth_balance",
        description: "This {{tool}} returns the ETH balance of an EVM wallet.",
        parameters: getETHBalanceParametersSchema,
        method: getBalance,
    },
];
