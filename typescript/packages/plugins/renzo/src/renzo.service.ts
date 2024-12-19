import { Tool } from "@goat-sdk/core";
import type { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { RENZO_ABI } from "./abi/renzo";
import { EZETH_ABI } from "./abi/ezeth";
import type { ChainSpecifications } from "./types/ChainSpecifications";
import { depositSchema, depositETHSchema, balanceOfSchema } from "./parameters";
import { parseUnits, formatUnits } from "viem";
import { z } from "zod";

export class RenzoService {
    constructor(private readonly chainSpecifications: ChainSpecifications) {}

    @Tool({
        name: "renzo_deposit_erc20",
        description: "Deposit ERC20 LST tokens into Renzo",
    })
    async depositERC20(
        walletClient: EVMWalletClient,
        spec: ChainSpecifications,
        parameters: z.infer<typeof depositSchema>
    ): Promise<string> {
        try {
            const depositToken = await walletClient.read({
                address: spec[walletClient.getChain().id].renzoDepositAddress,
                abi: RENZO_ABI,
                functionName: "depositToken",
            });

            if (
                parameters._token.toLowerCase() !==
                (depositToken as unknown as string).toLowerCase()
            ) {
                throw new Error(
                    `Invalid token: ${parameters._token}. Expected deposit token: ${depositToken}`
                );
            }

            const depositAmount = parseUnits(parameters._amountIn, 18);
            const _minOut = parseUnits(parameters._minOut, 18);

            const hash = await walletClient.sendTransaction({
                to: spec[walletClient.getChain().id].renzoDepositAddress,
                abi: RENZO_ABI,
                functionName: "deposit",
                args: [depositAmount, _minOut, parameters._deadline],
            });

            return hash.hash;
        } catch (error) {
            throw Error(`Failed to deposit ERC20: ${error}`);
        }
    }

    @Tool({
        name: "renzo_deposit_eth",
        description: "Deposit ETH into Renzo",
    })
    async depositETH(
        walletClient: EVMWalletClient,
        spec: ChainSpecifications,
        parameters: z.infer<typeof depositETHSchema>
    ): Promise<string> {
        try {
            const _minOut = parseUnits(parameters._minOut, 18);

            const hash = await walletClient.sendTransaction({
                to: spec[walletClient.getChain().id].renzoDepositAddress,
                abi: RENZO_ABI,
                functionName: "depositETH",
                args: [_minOut, parameters._deadline],
                value: parseUnits(parameters._value, 18),
            });

            return hash.hash;
        } catch (error) {
            throw Error(`Failed to deposit ETH: ${error}`);
        }
    }

    @Tool({
        name: "renzo_check_ezeth_balance",
        description: "Check the ezETH balance of an address",
    })
    async getEzEthBalance(
        walletClient: EVMWalletClient,
        spec: ChainSpecifications,
        parameters: z.infer<typeof balanceOfSchema>
    ): Promise<string> {
        try {
            const balance = await walletClient.read({
                address: spec[walletClient.getChain().id].l2EzEthAddress,
                abi: EZETH_ABI,
                functionName: "balanceOf",
                args: [parameters._address],
            });

            return formatUnits(balance as unknown as bigint, 18);
        } catch (error) {
            throw Error(`Failed to get ezETH balance: ${error}`);
        }
    }
}
