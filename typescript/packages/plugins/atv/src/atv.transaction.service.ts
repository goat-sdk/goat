import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import type { ATVAPI } from "./api";
import {
    DepositParameters,
    QueueWithdrawParameters,
    RedeemWithdrawParameters,
    StakeParameters,
    UnqueueWithdrawParameters,
    UnstakeParameters,
    WithdrawParameters,
} from "./parameters";

interface TxStep {
    to: string;
    data: string;
    value?: string;
}

export class ATVTransactionService {
    constructor(private readonly api: ATVAPI) {}

    @Tool({
        name: "atv_deposit",
        description:
            "Deposit tokens into an ATV vault. Fetches the required approve + deposit transaction steps from the API and executes them in order. Returns the transaction hashes.",
    })
    async deposit(walletClient: EVMWalletClient, parameters: DepositParameters) {
        const userAddress = walletClient.getAddress();
        const steps: TxStep[] = await this.api.post("/vaults/deposit/build", {
            userAddress,
            vaultAddress: parameters.vaultAddress,
            depositTokenAddress: parameters.depositTokenAddress,
            depositAmount: parameters.depositAmount,
        });

        return this.executeSteps(walletClient, steps);
    }

    @Tool({
        name: "atv_stake",
        description:
            "Stake vault tokens into a timelock contract for boosted rewards. Executes approve + stake steps in order. Returns the transaction hashes.",
    })
    async stake(walletClient: EVMWalletClient, parameters: StakeParameters) {
        const userAddress = walletClient.getAddress();
        const steps: TxStep[] = await this.api.post("/vaults/stake/build", {
            userAddress,
            vaultAddress: parameters.vaultAddress,
            lockPeriodIndex: parameters.lockPeriodIndex,
            stakeAmount: parameters.stakeAmount,
        });

        return this.executeSteps(walletClient, steps);
    }

    @Tool({
        name: "atv_unstake",
        description:
            "Unstake vault tokens from a timelock contract. Returns the transaction hash.",
    })
    async unstake(walletClient: EVMWalletClient, parameters: UnstakeParameters) {
        const userAddress = walletClient.getAddress();
        const steps: TxStep[] = await this.api.post("/vaults/unstake/build", {
            userAddress,
            vaultAddress: parameters.vaultAddress,
            stakeIndex: parameters.stakeIndex,
            unstakeAmount: parameters.unstakeAmount,
        });

        return this.executeSteps(walletClient, steps);
    }

    @Tool({
        name: "atv_withdraw",
        description:
            "Withdraw vault shares from an ATV vault and receive an output token. Executes all required steps in order. Returns the transaction hashes.",
    })
    async withdraw(walletClient: EVMWalletClient, parameters: WithdrawParameters) {
        const userAddress = walletClient.getAddress();
        const steps: TxStep[] = await this.api.post("/vaults/withdraw/build", {
            userAddress,
            vaultAddress: parameters.vaultAddress,
            oTokenAddress: parameters.oTokenAddress,
            sharesToWithdraw: parameters.sharesToWithdraw,
            slippage: parameters.slippage,
        });

        return this.executeSteps(walletClient, steps);
    }

    @Tool({
        name: "atv_queue_withdraw",
        description:
            "Initiate a queued (delayed) withdrawal from an ATV vault. The withdrawal must be redeemed later once processed. Returns the transaction hash.",
    })
    async queueWithdraw(walletClient: EVMWalletClient, parameters: QueueWithdrawParameters) {
        const userAddress = walletClient.getAddress();
        const steps: TxStep[] = await this.api.post("/vaults/withdraw/queue/build", {
            userAddress,
            vaultAddress: parameters.vaultAddress,
            withdrawTokenAddress: parameters.withdrawTokenAddress,
            tokensToWithdraw: parameters.tokensToWithdraw,
        });

        return this.executeSteps(walletClient, steps);
    }

    @Tool({
        name: "atv_unqueue_withdraw",
        description:
            "Cancel a pending queued withdrawal request from an ATV vault. Returns the transaction hash.",
    })
    async unqueueWithdraw(walletClient: EVMWalletClient, parameters: UnqueueWithdrawParameters) {
        const userAddress = walletClient.getAddress();
        const steps: TxStep[] = await this.api.post("/vaults/withdraw/unqueue/build", {
            userAddress,
            vaultAddress: parameters.vaultAddress,
            oTokenAddress: parameters.oTokenAddress,
            requestId: parameters.requestId,
        });

        return this.executeSteps(walletClient, steps);
    }

    @Tool({
        name: "atv_redeem_withdraw",
        description:
            "Claim (redeem) a completed queued withdrawal from an ATV vault. Returns the transaction hash.",
    })
    async redeemWithdraw(walletClient: EVMWalletClient, parameters: RedeemWithdrawParameters) {
        const userAddress = walletClient.getAddress();
        const steps: TxStep[] = await this.api.post("/vaults/withdraw/redeem/build", {
            userAddress,
            vaultAddress: parameters.vaultAddress,
            oTokens: parameters.oTokens,
            batchCounter: parameters.batchCounter,
        });

        return this.executeSteps(walletClient, steps);
    }

    private async executeSteps(walletClient: EVMWalletClient, steps: TxStep[]) {
        const hashes: string[] = [];

        for (const step of steps) {
            const tx = await walletClient.sendTransaction({
                to: step.to as `0x${string}`,
                data: step.data as `0x${string}`,
                value: step.value ? BigInt(step.value) : undefined,
            });
            hashes.push(tx.hash);
        }

        return { transactionHashes: hashes };
    }
}
