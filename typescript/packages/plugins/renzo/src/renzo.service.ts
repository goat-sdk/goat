import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { RENZO_ABI } from "./abi/renzo";
import { EZETH_ABI } from "./abi/ezeth";
import { ERC20_ABI } from "./abi/erc20";
import { getRenzoAddresses } from "./types/ChainSpecifications";
import {
    DepositParams,
    DepositETHParams,
    BalanceOfParams,
    ApproveDepositParams,
    GetDepositAddressParams,
} from "./parameters";
import { parseUnits, formatUnits } from "viem";

export class RenzoService {
    @Tool({
        name: "renzo_deposit_erc20",
        description:
            "Deposit ERC20 LST tokens into Renzo, approve the ERC20 contract to spend the tokens before calling this",
    })
    async depositERC20(
        walletClient: EVMWalletClient,
        parameters: DepositParams
    ) {
        try {
            console.log(
                `[Renzo] Starting ERC20 deposit with parameters:`,
                parameters
            );

            // if (!walletClient) {
            //     throw new Error("[Renzo] WalletClient is undefined");
            // }

            console.log("[Renzo] WalletClient:", walletClient);
            console.log("[Renzo] Chain:", walletClient.getChain());

            const { renzoDepositAddress } = getRenzoAddresses(
                walletClient.getChain().id
            );
            console.log(
                `[Renzo] Using deposit address: ${renzoDepositAddress}`
            );

            console.log(`[Renzo] Reading deposit token from contract...`);
            const depositToken = await walletClient.read({
                address: renzoDepositAddress,
                abi: RENZO_ABI,
                functionName: "depositToken",
            });

            console.log(`[Renzo] Deposit token type:`, typeof depositToken);
            console.log(
                `[Renzo] Deposit token value:`,
                JSON.stringify(depositToken)
            );

            const depositTokenAddress = (
                depositToken as { value: `0x${string}` }
            ).value;

            console.log(
                `[Renzo] Contract deposit token: ${depositTokenAddress}`
            );

            if (
                parameters._token.toLowerCase() !==
                depositTokenAddress.toLowerCase() // Now we can safely call toLowerCase()
            ) {
                console.error(`[Renzo] Token mismatch:
                    Provided: ${parameters._token}
                    Expected: ${depositTokenAddress}`);
                throw new Error(
                    `Invalid token: ${parameters._token}. Expected deposit token: ${depositTokenAddress}`
                );
            }
            console.log(`[Renzo] Token validation successful`);

            console.log(`[Renzo] Initiating deposit transaction with:
                Amount In: ${parameters._amountIn}
                Min Out: ${parameters._minOut}
                Deadline: ${parameters._deadline}`);

            const deadline = BigInt(Math.floor(Date.now() / 1000) + 300); // current time + 5 minutes

            const hash = await walletClient.sendTransaction({
                to: renzoDepositAddress,
                abi: RENZO_ABI,
                functionName: "deposit",
                args: [
                    parameters._amountIn,
                    parameters._minOut,
                    deadline, // Use the calculated deadline
                ],
            });
            console.log(
                `[Renzo] Deposit transaction successful. Hash: ${hash.hash}`
            );

            return hash.hash;
        } catch (error) {
            console.error(`[Renzo] Deposit failed with error:`, error);
            throw Error(`Failed to deposit ERC20: ${error}`);
        }
    }

    @Tool({
        name: "renzo_deposit_eth",
        description: "Deposit ETH into Renzo",
    })
    async depositETH(
        walletClient: EVMWalletClient,
        parameters: DepositETHParams
    ): Promise<string> {
        try {
            console.log(
                `[Renzo] Starting ETH deposit with parameters:`,
                parameters
            );

            const { renzoDepositAddress } = getRenzoAddresses(
                walletClient.getChain().id
            );
            console.log(
                `[Renzo] Using deposit address: ${renzoDepositAddress}`
            );

            const _minOut = parseUnits(parameters._minOut, 18);
            const value = parseUnits(parameters._value, 18);

            console.log(`[Renzo] Initiating ETH deposit transaction with:
                Value: ${parameters._value} ETH
                Min Out: ${parameters._minOut}
                Deadline: ${parameters._deadline}`);

            const deadline = BigInt(Math.floor(Date.now() / 1000) + 300); // 5 minutes from now

            const hash = await walletClient.sendTransaction({
                to: renzoDepositAddress,
                abi: RENZO_ABI,
                functionName: "depositETH",
                args: [_minOut, deadline],
                value,
            });

            console.log(
                `[Renzo] ETH deposit transaction successful. Hash: ${hash.hash}`
            );

            return hash.hash;
        } catch (error) {
            console.error(`[Renzo] ETH deposit failed with error:`, error);
            throw Error(`Failed to deposit ETH: ${error}`);
        }
    }

    @Tool({
        name: "renzo_check_ezeth_balance",
        description: "Check the ezETH balance of an address",
    })
    async getEzEthBalance(
        walletClient: EVMWalletClient,
        parameters: BalanceOfParams
    ): Promise<string> {
        try {
            console.log(
                `[Renzo] Checking ezETH balance for address:`,
                parameters._address
            );

            const { l2EzEthAddress } = getRenzoAddresses(
                walletClient.getChain().id
            );
            console.log(
                `[Renzo] Using ezETH contract address: ${l2EzEthAddress}`
            );

            const balanceResult = await walletClient.read({
                address: l2EzEthAddress,
                abi: EZETH_ABI,
                functionName: "balanceOf",
                args: [parameters._address],
            });

            console.log(`[Renzo] Balance result type:`, typeof balanceResult);
            console.log(
                `[Renzo] Balance result value:`,
                JSON.stringify(balanceResult, (_, value) =>
                    typeof value === "bigint" ? value.toString() : value
                )
            );

            const balance = (balanceResult as { value: bigint }).value;
            const formattedBalance = formatUnits(balance, 18);
            console.log(
                `[Renzo] ezETH balance for ${parameters._address}: ${formattedBalance}`
            );

            return formattedBalance;
        } catch (error) {
            console.error(`[Renzo] Failed to get ezETH balance:`, error);
            throw Error(`Failed to get ezETH balance: ${error}`);
        }
    }

    @Tool({
        name: "renzo_approve_deposit",
        description:
            "Approve Renzo deposit contract to spend tokens. Call this before calling erc20 deposit function.",
    })
    async approveDeposit(
        walletClient: EVMWalletClient,
        parameters: ApproveDepositParams
    ): Promise<string> {
        const { renzoDepositAddress } = getRenzoAddresses(
            walletClient.getChain().id
        );

        const hash = await walletClient.sendTransaction({
            to: parameters._token,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [renzoDepositAddress, parameters._amount],
        });

        return hash.hash;
    }

    @Tool({
        name: "renzo_get_deposit_address",
        description:
            "Get the Renzo deposit contract address for the current chain. Call this to get the address to send ETH to, not needed for ERC20 deposits.",
    })
    async getRenzoDepositAddress(
        walletClient: EVMWalletClient,
        parameters: GetDepositAddressParams
    ): Promise<string> {
        try {
            const { renzoDepositAddress } = getRenzoAddresses(
                walletClient.getChain().id
            );
            console.log(
                `[Renzo] Deposit address for chain ${
                    walletClient.getChain().id
                }: ${renzoDepositAddress}`
            );
            return renzoDepositAddress;
        } catch (error) {
            console.error(`[Renzo] Failed to get deposit address:`, error);
            throw Error(`Failed to get Renzo deposit address: ${error}`);
        }
    }
}
