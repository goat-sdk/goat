import { Tool } from "@goat-sdk/core";
import type { SolanaWalletClient } from "@goat-sdk/wallet-solana";
import {
  StakeSolParameters,
  UnstakeSolParameters,
  WithdrawStakeParameters,
  GetStakeAccountsParameters,
  CheckWithdrawReadyParameters,
  SimulateStakeParameters,
  EmptyParameters,
} from "./parameters";

const DEFAULT_BASE_URL = "https://solentic.theblueprint.xyz";

export class SolenticService {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = (baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
  }

  private async fetch<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      let errorBody: string;
      try {
        errorBody = JSON.stringify(await response.json());
      } catch {
        errorBody = await response.text();
      }
      throw new Error(
        `Solentic API error (${response.status} ${response.statusText}): ${errorBody}`
      );
    }

    return response.json() as Promise<T>;
  }

  @Tool({
    description:
      "Get detailed information about the Blueprint Solana validator including commission, stake, rank, APY, performance metrics, and infrastructure details. Use this to answer questions about the validator before staking.",
  })
  async getValidatorInfo(parameters: EmptyParameters) {
    return this.fetch("/api/v1/validator");
  }

  @Tool({
    description:
      "Get the current staking APY breakdown for Blueprint validator, including base staking APY, Jito MEV APY, total combined APY, and commission rates. Use this to show users the expected return on staking.",
  })
  async getStakingApy(parameters: EmptyParameters) {
    return this.fetch("/api/v1/validator/apy");
  }

  @Tool({
    description:
      "Stake SOL with the Blueprint validator on Solana. Builds an unsigned staking transaction via the Solentic API, then signs and submits it through the connected wallet. Returns the transaction signature and new stake account address. The wallet must have sufficient SOL balance (amount + ~0.005 SOL for fees).",
  })
  async stakeSol(
    walletClient: SolanaWalletClient,
    parameters: StakeSolParameters
  ) {
    const walletAddress = walletClient.getAddress();
    const amountSol = parseFloat(parameters.amountInSol);

    if (isNaN(amountSol) || amountSol <= 0) {
      throw new Error(
        `Invalid stake amount: "${parameters.amountInSol}". Must be a positive number.`
      );
    }

    const data = await this.fetch<{
      transaction: string;
      stakeAccountAddress: string;
      message: string;
      rewardsEstimate?: {
        estimatedAnnualSol: number;
        estimatedPerEpochSol: number;
        basedOnApy: string;
      };
    }>("/api/v1/stake/transaction", {
      method: "POST",
      body: JSON.stringify({ walletAddress, amountSol }),
    });

    const { hash } = await walletClient.sendRawTransaction(data.transaction);

    return {
      hash,
      stakeAccountAddress: data.stakeAccountAddress,
      amountSol,
      message: data.message,
      rewardsEstimate: data.rewardsEstimate,
    };
  }

  @Tool({
    description:
      "Unstake (deactivate) a stake account from Blueprint validator. This begins the cooldown process. After the current epoch ends (~2-3 days), the SOL becomes withdrawable. The stake account must be active and owned by the connected wallet.",
  })
  async unstakeSol(
    walletClient: SolanaWalletClient,
    parameters: UnstakeSolParameters
  ) {
    const walletAddress = walletClient.getAddress();

    const data = await this.fetch<{
      transaction: string;
      message: string;
      epochTiming?: {
        currentEpoch: number;
        estimatedSecondsRemaining: number;
        estimatedEpochEnd: string;
      };
    }>("/api/v1/unstake/transaction", {
      method: "POST",
      body: JSON.stringify({
        walletAddress,
        stakeAccountAddress: parameters.stakeAccountAddress,
      }),
    });

    const { hash } = await walletClient.sendRawTransaction(data.transaction);

    return {
      hash,
      stakeAccountAddress: parameters.stakeAccountAddress,
      message: data.message,
      epochTiming: data.epochTiming,
    };
  }

  @Tool({
    description:
      "Withdraw SOL from a fully deactivated (inactive) stake account back to the wallet. The stake account must have completed the cooldown period after unstaking. Use checkWithdrawReady first to verify the account is ready for withdrawal.",
  })
  async withdrawStake(
    walletClient: SolanaWalletClient,
    parameters: WithdrawStakeParameters
  ) {
    const walletAddress = walletClient.getAddress();

    const data = await this.fetch<{
      transaction: string;
      message: string;
    }>("/api/v1/withdraw/transaction", {
      method: "POST",
      body: JSON.stringify({
        walletAddress,
        stakeAccountAddress: parameters.stakeAccountAddress,
      }),
    });

    const { hash } = await walletClient.sendRawTransaction(data.transaction);

    return {
      hash,
      stakeAccountAddress: parameters.stakeAccountAddress,
      message: data.message,
    };
  }

  @Tool({
    description:
      "List all stake accounts delegated to Blueprint validator for a given wallet. Shows each account's address, staked SOL amount, status (activating/active/deactivating/inactive), and available actions. If no walletAddress is provided, uses the connected wallet.",
  })
  async getStakeAccounts(
    walletClient: SolanaWalletClient,
    parameters: GetStakeAccountsParameters
  ) {
    const wallet = parameters.walletAddress ?? walletClient.getAddress();
    return this.fetch(`/api/v1/stake/accounts/${wallet}`);
  }

  @Tool({
    description:
      "Check if any stake accounts for a wallet are ready for withdrawal. Returns which accounts are withdrawable and which are still in cooldown, along with epoch timing information. Use this before calling withdrawStake to confirm readiness.",
  })
  async checkWithdrawReady(
    walletClient: SolanaWalletClient,
    parameters: CheckWithdrawReadyParameters
  ) {
    const wallet = parameters.walletAddress ?? walletClient.getAddress();
    return this.fetch(`/api/v1/check-withdraw-ready/${wallet}`);
  }

  @Tool({
    description:
      "Simulate staking returns for a given SOL amount and duration. Shows projected rewards based on current Blueprint validator APY without making any transactions. Useful for helping users decide how much to stake.",
  })
  async simulateStake(parameters: SimulateStakeParameters) {
    const amountSol = parseFloat(parameters.amountInSol);

    if (isNaN(amountSol) || amountSol <= 0) {
      throw new Error(
        `Invalid simulation amount: "${parameters.amountInSol}". Must be a positive number.`
      );
    }

    return this.fetch("/api/v1/stake/simulate", {
      method: "POST",
      body: JSON.stringify({
        amountSol,
        durationDays: parameters.durationDays,
      }),
    });
  }
}
