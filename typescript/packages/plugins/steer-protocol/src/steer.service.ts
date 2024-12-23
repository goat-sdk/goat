import { Tool } from "@goat-sdk/core";
import type { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { z } from "zod";
import { STEER_POOL_ABI } from "./abi/pool_abi";
import { depositParametersSchema, withdrawParametersSchema } from "./parameters";

export class SteerService {
    @Tool({
        name: "deposit_steer_pool",
        description: "Deposit tokens into a Steer Smart Pool",
        parameters: depositParametersSchema,
    })
    async deposit(walletClient: EVMWalletClient, parameters: z.infer<typeof depositParamsSchema>) {
        const hash = await walletClient.sendTransaction({
            to: parameters.poolAddress,
            abi: STEER_POOL_ABI,
            functionName: "deposit",
            args: [
                parameters.amount0Desired,
                parameters.amount1Desired,
                parameters.amount0Min,
                parameters.amount1Min,
                await walletClient.getAddress(),
            ],
        });

        return hash.hash;
    }

    @Tool({
        name: "withdraw_steer_pool",
        description: "Withdraw tokens from a Steer Smart Pool",
        parameters: withdrawParametersSchema,
    })
    async withdraw(walletClient: EVMWalletClient, parameters: z.infer<typeof withdrawParamsSchema>) {
        const hash = await walletClient.sendTransaction({
            to: parameters.poolAddress,
            abi: STEER_POOL_ABI,
            functionName: "withdraw",
            args: [parameters.shares, parameters.amount0Min, parameters.amount1Min, await walletClient.getAddress()],
        });

        return hash.hash;
    }
}
