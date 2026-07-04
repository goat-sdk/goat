import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class StakeSolParameters extends createToolParameters(
  z.object({
    amountInSol: z
      .string()
      .describe(
        "Amount of SOL to stake, as a decimal string (e.g. '1.5'). Minimum ~0.01 SOL. A small reserve (~0.005 SOL) is kept for transaction fees."
      ),
  })
) {}

export class UnstakeSolParameters extends createToolParameters(
  z.object({
    stakeAccountAddress: z
      .string()
      .describe(
        "The Solana stake account address to deactivate. Must be an active stake account owned by the connected wallet. After deactivation, funds become withdrawable at the end of the current epoch (~2-3 days)."
      ),
  })
) {}

export class WithdrawStakeParameters extends createToolParameters(
  z.object({
    stakeAccountAddress: z
      .string()
      .describe(
        "The Solana stake account address to withdraw from. The stake must be fully deactivated (inactive) before withdrawal is possible. Use checkWithdrawReady to verify."
      ),
  })
) {}

export class GetStakeAccountsParameters extends createToolParameters(
  z.object({
    walletAddress: z
      .string()
      .optional()
      .describe(
        "Wallet address to look up stake accounts for. If omitted, uses the connected wallet address."
      ),
  })
) {}

export class CheckWithdrawReadyParameters extends createToolParameters(
  z.object({
    walletAddress: z
      .string()
      .optional()
      .describe(
        "Wallet address to check withdrawal readiness for. If omitted, uses the connected wallet address."
      ),
  })
) {}

export class SimulateStakeParameters extends createToolParameters(
  z.object({
    amountInSol: z
      .string()
      .describe(
        "Amount of SOL to simulate staking, as a decimal string (e.g. '100')."
      ),
    durationDays: z
      .number()
      .optional()
      .describe(
        "Number of days to project staking returns for. Defaults to 365 if omitted."
      ),
  })
) {}

export class EmptyParameters extends createToolParameters(z.object({})) {}
