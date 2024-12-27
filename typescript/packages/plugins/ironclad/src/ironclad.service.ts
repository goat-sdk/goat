import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { formatUnits, parseUnits } from "viem";
import type { Address } from "viem";
import { z } from "zod";
import { ERC20_ABI } from "./abi/erc20";
import { LENDING_POOL_ABI } from "./abi/lendingPool";
import { BORROWER_ABI } from "./abi/borrower";
import { PROTOCOL_DATA_PROVIDER_ABI } from "./abi/protocolDataProvider";
import { TROVE_MANAGER_ABI } from "./abi/troveManager";
import { HINT_HELPERS_ABI } from "./abi/hinthelper";
import { IC_VAULT_ABI } from "./abi/icVault";
import { LoopDepositParameters, LoopWithdrawParameters } from "./parameters";
import {
    BorrowIUSDParameters,
    RepayIUSDParameters,
    MonitorPositionParameters,
} from "./parameters";
import { CalculateMaxWithdrawableParameters } from "./parameters";
import { getVaultAddress } from "./vaultAddresses";

interface LoopPosition {
    borrowedAmounts: string[];
    totalDeposited: string;
    totalBorrowed: string;
}

const LENDING_POOL_ADDRESS = "0xB702cE183b4E1Faa574834715E5D4a6378D0eEd3";
const PROTOCOL_DATA_PROVIDER_ADDRESS =
    "0x29563f73De731Ae555093deb795ba4D1E584e42E";
const IUSD_ADDRESS = "0xA70266C8F8Cf33647dcFEE763961aFf418D9E1E4";
const BORROWER_ADDRESS = "0x9571873B4Df31D317d4ED4FE4689915A2F3fF7d4";
const TROVE_MANAGER_ADDRESS = "0x829746b34F624fdB03171AA4cF4D2675B0F2A2e6";
const HINT_HELPERS_ADDRESS = "0xBdAA7033f0A109A9777ee42a82799642a877Fc4b";
export class IroncladService {
    constructor() {}

    @Tool({
        name: "ironclad_loop_deposit",
        description:
            "Perform a looped deposit (recursive borrowing) on Ironclad. Send the amount of the asset (in base units) you want to deposit as the initial amount.",
    })
    async loopDeposit(
        walletClient: EVMWalletClient,
        parameters: LoopDepositParameters
    ): Promise<LoopPosition> {
        try {
            const position: LoopPosition = {
                borrowedAmounts: [],
                totalDeposited: "0",
                totalBorrowed: "0",
            };

            const asset = parameters.assetAddress;
            const allowanceResult = await walletClient.read({
                address: asset as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "allowance",
                args: [walletClient.getAddress(), LENDING_POOL_ADDRESS],
            });
            const allowance = (allowanceResult as { value: bigint }).value;

            if (Number(allowance) < Number(parameters.initialAmount)) {
                await walletClient.sendTransaction({
                    to: asset,
                    abi: ERC20_ABI,
                    functionName: "approve",
                    args: [LENDING_POOL_ADDRESS, parameters.initialAmount],
                });
            }

            // Initial deposit
            await walletClient.sendTransaction({
                to: LENDING_POOL_ADDRESS,
                abi: LENDING_POOL_ABI,
                functionName: "deposit",
                args: [
                    asset,
                    parameters.initialAmount,
                    walletClient.getAddress(),
                    parameters.referralCode,
                ],
            });

            position.totalDeposited = parameters.initialAmount;
            let currentAmount = parameters.initialAmount;

            // Execute loops
            for (let i = 0; i < parameters.numLoops; i++) {
                // Get reserve configuration
                const userReserveDataResult = await walletClient.read({
                    address: PROTOCOL_DATA_PROVIDER_ADDRESS as `0x${string}`,
                    abi: PROTOCOL_DATA_PROVIDER_ABI,
                    functionName: "getUserReserveData",
                    args: [asset, walletClient.getAddress()],
                });
                const userReserveData = (
                    userReserveDataResult as { value: any[] }
                ).value;

                const reserveConfigResult = await walletClient.read({
                    address: PROTOCOL_DATA_PROVIDER_ADDRESS as `0x${string}`,
                    abi: PROTOCOL_DATA_PROVIDER_ABI,
                    functionName: "getReserveConfigurationData",
                    args: [asset],
                });
                const reserveConfig = (reserveConfigResult as { value: any[] })
                    .value;

                const ltv = Number(reserveConfig[1]);

                const borrowAmount = (
                    (Number(currentAmount) * ltv) /
                    10000
                ).toString();

                // Borrow
                await walletClient.sendTransaction({
                    to: LENDING_POOL_ADDRESS,
                    abi: LENDING_POOL_ABI,
                    functionName: "borrow",
                    args: [
                        asset,
                        borrowAmount,
                        2, // Variable rate mode
                        parameters.referralCode,
                        walletClient.getAddress(),
                    ],
                });

                const loopAllowanceResult = await walletClient.read({
                    address: asset as `0x${string}`,
                    abi: ERC20_ABI,
                    functionName: "allowance",
                    args: [walletClient.getAddress(), LENDING_POOL_ADDRESS],
                });
                const loopAllowance = (loopAllowanceResult as { value: bigint })
                    .value;

                if (Number(loopAllowance) < Number(borrowAmount)) {
                    await walletClient.sendTransaction({
                        to: asset,
                        abi: ERC20_ABI,
                        functionName: "approve",
                        args: [LENDING_POOL_ADDRESS, borrowAmount],
                    });
                }

                // Deposit
                await walletClient.sendTransaction({
                    to: LENDING_POOL_ADDRESS,
                    abi: LENDING_POOL_ABI,
                    functionName: "deposit",
                    args: [
                        asset,
                        borrowAmount,
                        walletClient.getAddress(),
                        parameters.referralCode,
                    ],
                });

                // Update position tracking
                position.borrowedAmounts.push(borrowAmount);
                position.totalBorrowed = (
                    Number(position.totalBorrowed) + Number(borrowAmount)
                ).toString();
                position.totalDeposited = (
                    Number(position.totalDeposited) + Number(borrowAmount)
                ).toString();
                currentAmount = borrowAmount;
            }
            return position;
        } catch (error) {
            throw Error(`Failed to execute loop deposit: ${error}`);
        }
    }

    @Tool({
        name: "ironclad_loop_withdraw",
        description: "Withdraw a looped position on Ironclad",
    })
    async loopWithdraw(
        walletClient: EVMWalletClient,
        parameters: LoopWithdrawParameters
    ): Promise<string> {
        try {
            const userReserveDataResult = await walletClient.read({
                address: PROTOCOL_DATA_PROVIDER_ADDRESS as `0x${string}`,
                abi: PROTOCOL_DATA_PROVIDER_ABI,
                functionName: "getUserReserveData",
                args: [parameters.assetAddress, walletClient.getAddress()],
            });

            const userReserveData = (userReserveDataResult as { value: any[] })
                .value;
            let remainingDebt = userReserveData[2]; // currentVariableDebt

            let withdrawalCount = 1;
            while (remainingDebt > 0n) {
                const maxWithdrawable =
                    await this.calculateMaxWithdrawableAmount(walletClient, {
                        assetAddress: parameters.assetAddress,
                    });

                if (maxWithdrawable === 0n) {
                    throw new Error(
                        "Cannot withdraw any more funds while maintaining health factor"
                    );
                }

                // If this is the last withdrawal (no remaining debt), withdraw everything
                // Otherwise, use 99.5% of max withdrawable to account for any small changes
                const withdrawAmount =
                    remainingDebt === 0n
                        ? maxWithdrawable
                        : (maxWithdrawable * 995n) / 1000n;
                // Withdraw the calculated amount
                await walletClient.sendTransaction({
                    to: LENDING_POOL_ADDRESS,
                    abi: LENDING_POOL_ABI,
                    functionName: "withdraw",
                    args: [
                        parameters.assetAddress,
                        withdrawAmount,
                        walletClient.getAddress(),
                    ],
                });
                const allowanceResult = await walletClient.read({
                    address: parameters.assetAddress as `0x${string}`,
                    abi: ERC20_ABI,
                    functionName: "allowance",
                    args: [walletClient.getAddress(), LENDING_POOL_ADDRESS],
                });
                const allowance = (allowanceResult as { value: bigint }).value;

                if (allowance < withdrawAmount) {
                    await walletClient.sendTransaction({
                        to: parameters.assetAddress,
                        abi: ERC20_ABI,
                        functionName: "approve",
                        args: [LENDING_POOL_ADDRESS, withdrawAmount],
                    });
                }

                // Repay
                await walletClient.sendTransaction({
                    to: LENDING_POOL_ADDRESS,
                    abi: LENDING_POOL_ABI,
                    functionName: "repay",
                    args: [
                        parameters.assetAddress,
                        withdrawAmount,
                        2,
                        walletClient.getAddress(),
                    ],
                });

                // After repayment, get updated debt from protocol
                const updatedReserveData = await walletClient.read({
                    address: PROTOCOL_DATA_PROVIDER_ADDRESS as `0x${string}`,
                    abi: PROTOCOL_DATA_PROVIDER_ABI,
                    functionName: "getUserReserveData",
                    args: [parameters.assetAddress, walletClient.getAddress()],
                });
                remainingDebt = (updatedReserveData as { value: any[] })
                    .value[2];
                withdrawalCount++;
            }

            // After debt is cleared, withdraw any remaining deposited assets
            const finalReserveData = await walletClient.read({
                address: PROTOCOL_DATA_PROVIDER_ADDRESS as `0x${string}`,
                abi: PROTOCOL_DATA_PROVIDER_ABI,
                functionName: "getUserReserveData",
                args: [parameters.assetAddress, walletClient.getAddress()],
            });
            const remainingDeposit = (finalReserveData as { value: any[] })
                .value[0]; // aToken balance

            if (remainingDeposit > 0n) {
                // Withdraw all remaining deposits
                await walletClient.sendTransaction({
                    to: LENDING_POOL_ADDRESS,
                    abi: LENDING_POOL_ABI,
                    functionName: "withdraw",
                    args: [
                        parameters.assetAddress,
                        remainingDeposit,
                        walletClient.getAddress(),
                    ],
                });
            }
            return `Successfully unwound position in ${
                withdrawalCount - 1
            } loops`;
        } catch (error) {
            throw Error(`Failed to execute loop withdraw: ${error}`);
        }
    }

    @Tool({
        name: "ironclad_monitor_loop_position",
        description: "Monitor health of a looped position on Ironclad",
    })
    async monitorLoopPosition(
        walletClient: EVMWalletClient,
        parameters: MonitorPositionParameters
    ): Promise<{
        totalCollateral: string;
        totalBorrowed: string;
        currentLTV: string;
        healthFactor: string;
        liquidationThreshold: string;
    }> {
        try {
            const asset = parameters.tokenAddress;

            const decimalsResult = await walletClient.read({
                address: asset as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "decimals",
            });
            const decimals = (decimalsResult as { value: number }).value;

            // Get user's reserve data
            const userReserveDataResult = await walletClient.read({
                address: PROTOCOL_DATA_PROVIDER_ADDRESS as `0x${string}`,
                abi: PROTOCOL_DATA_PROVIDER_ABI,
                functionName: "getUserReserveData",
                args: [asset, walletClient.getAddress()],
            });
            const userReserveData = (userReserveDataResult as { value: any[] })
                .value;

            // Get reserve configuration
            const reserveConfigResult = await walletClient.read({
                address: PROTOCOL_DATA_PROVIDER_ADDRESS as `0x${string}`,
                abi: PROTOCOL_DATA_PROVIDER_ABI,
                functionName: "getReserveConfigurationData",
                args: [asset],
            });
            const reserveConfig = (reserveConfigResult as { value: any[] })
                .value;

            const totalCollateral = formatUnits(userReserveData[0], decimals);
            const totalBorrowed = formatUnits(userReserveData[2], decimals);
            const liquidationThreshold = Number(reserveConfig[2]) / 10000;

            // Calculate current LTV and health factor
            const currentLTV =
                totalBorrowed === "0"
                    ? "0"
                    : (
                          (Number(totalBorrowed) / Number(totalCollateral)) *
                          100
                      ).toFixed(2);

            const healthFactor =
                totalBorrowed === "0"
                    ? "∞"
                    : (
                          (Number(totalCollateral) * liquidationThreshold) /
                          Number(totalBorrowed)
                      ).toFixed(2);

            return {
                totalCollateral,
                totalBorrowed,
                currentLTV: `${currentLTV}%`,
                healthFactor,
                liquidationThreshold: `${(liquidationThreshold * 100).toFixed(
                    2
                )}%`,
            };
        } catch (error) {
            throw Error(`Failed to monitor loop position: ${error}`);
        }
    }

    @Tool({
        name: "ironclad_borrow_iusd",
        description: "Deposit collateral and borrow iUSD against it",
    })
    async borrowIUSD(
        walletClient: EVMWalletClient,
        parameters: BorrowIUSDParameters
    ): Promise<string> {
        try {
            const vaultAddress = getVaultAddress(parameters.tokenAddress);

            // Check USDC allowance for vault
            const usdcAllowanceResult = await walletClient.read({
                address: parameters.tokenAddress,
                abi: ERC20_ABI,
                functionName: "allowance",
                args: [walletClient.getAddress(), vaultAddress],
            });
            const usdcAllowance = (usdcAllowanceResult as { value: bigint })
                .value;

            // Approve USDC if needed
            if (Number(usdcAllowance) < Number(parameters.tokenAmount)) {
                await walletClient.sendTransaction({
                    to: parameters.tokenAddress,
                    abi: ERC20_ABI,
                    functionName: "approve",
                    args: [vaultAddress, parameters.tokenAmount],
                });
            }

            // Deposit USDC into vault
            await walletClient.sendTransaction({
                to: vaultAddress,
                abi: IC_VAULT_ABI,
                functionName: "deposit",
                args: [parameters.tokenAmount, walletClient.getAddress()],
            });

            // Step 2: Open Trove with ic-USDC

            // Check ic-USDC allowance for borrower
            const icUSDCAllowanceResult = await walletClient.read({
                address: vaultAddress,
                abi: ERC20_ABI,
                functionName: "allowance",
                args: [walletClient.getAddress(), BORROWER_ADDRESS],
            });
            const icUSDCAllowance = (icUSDCAllowanceResult as { value: bigint })
                .value;

            // Approve ic-USDC if needed
            if (Number(icUSDCAllowance) < Number(parameters.tokenAmount)) {
                await walletClient.sendTransaction({
                    to: vaultAddress,
                    abi: ERC20_ABI,
                    functionName: "approve",
                    args: [BORROWER_ADDRESS, parameters.tokenAmount],
                });
            }

            // Calculate hints first
            const { upperHint, lowerHint } = await this.getHints(
                walletClient,
                vaultAddress,
                BigInt(parameters.tokenAmount),
                BigInt(parameters.iUSDAmount)
            );
            // Prepare openTrove parameters
            const openTroveParams = {
                _collateral: vaultAddress,
                _collateralAmount: parameters.tokenAmount,
                _maxFeePercentage: BigInt("5000000000000000"),
                _iUSDAmount: BigInt(parameters.iUSDAmount),
                _upperHint: upperHint as `0x${string}`,
                _lowerHint: lowerHint as `0x${string}`,
            };

            // Execute openTrove transaction
            const txHash = await walletClient.sendTransaction({
                to: BORROWER_ADDRESS as `0x${string}`,
                abi: BORROWER_ABI,
                functionName: "openTrove",
                args: [
                    openTroveParams._collateral,
                    openTroveParams._collateralAmount,
                    openTroveParams._maxFeePercentage,
                    openTroveParams._iUSDAmount,
                    openTroveParams._upperHint,
                    openTroveParams._lowerHint,
                ],
            });

            return `Successfully deposited ${parameters.tokenAmount} USDC into ic-USDC vault and borrowed ${parameters.iUSDAmount} iUSD. Transaction: ${txHash.hash}`;
        } catch (error) {
            throw Error(`Failed to borrow iUSD: ${error}`);
        }
    }

    @Tool({
        name: "ironclad_repay_iusd",
        description: "Repay all iUSD and close the Trove position",
    })
    async repayIUSD(
        walletClient: EVMWalletClient,
        parameters: RepayIUSDParameters
    ): Promise<string> {
        try {
            const vaultAddress = getVaultAddress(parameters.tokenAddress);

            // First, we need to get the total debt of the Trove
            const troveDebtResult = await walletClient.read({
                address: TROVE_MANAGER_ADDRESS as `0x${string}`,
                abi: TROVE_MANAGER_ABI,
                functionName: "getTroveDebt",
                args: [walletClient.getAddress(), vaultAddress],
            });
            const totalDebt = (troveDebtResult as { value: bigint }).value;

            // LUSD_GAS_COMPENSATION is typically 10 * 10^18 (10 iUSD)
            const LUSD_GAS_COMPENSATION = BigInt("10000000000000000000"); // 10 iUSD in wei
            const actualDebt = totalDebt - LUSD_GAS_COMPENSATION;

            // Check and handle iUSD allowance
            const allowance = await walletClient.read({
                address: IUSD_ADDRESS as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "allowance",
                args: [walletClient.getAddress(), BORROWER_ADDRESS],
            });

            if (Number(allowance) < Number(actualDebt)) {
                await walletClient.sendTransaction({
                    to: IUSD_ADDRESS,
                    abi: ERC20_ABI,
                    functionName: "approve",
                    args: [BORROWER_ADDRESS, actualDebt],
                });
            }

            // Close Trove
            const txHash = await walletClient.sendTransaction({
                to: BORROWER_ADDRESS,
                abi: BORROWER_ABI,
                functionName: "closeTrove",
                args: [vaultAddress],
            });

            return txHash.hash;
        } catch (error) {
            throw Error(`Failed to close Trove: ${error}`);
        }
    }

    @Tool({
        name: "ironclad_monitor_position",
        description: "Monitor health of a Trove position",
    })
    async monitorPosition(
        walletClient: EVMWalletClient,
        parameters: MonitorPositionParameters
    ): Promise<{
        currentCollateral: string;
        currentDebt: string;
        troveStatus: string;
    }> {
        try {
            const vaultAddress = getVaultAddress(parameters.tokenAddress);

            // Get token decimals
            const decimals = Number(
                await walletClient.read({
                    address: parameters.tokenAddress as `0x${string}`,
                    abi: ERC20_ABI,
                    functionName: "decimals",
                })
            );

            // Get Trove status
            const statusResult = await walletClient.read({
                address: TROVE_MANAGER_ADDRESS as `0x${string}`,
                abi: TROVE_MANAGER_ABI,
                functionName: "getTroveStatus",
                args: [walletClient.getAddress(), vaultAddress],
            });
            const status = Number((statusResult as { value: bigint }).value);

            // Get Trove collateral
            const collateralResult = await walletClient.read({
                address: TROVE_MANAGER_ADDRESS as `0x${string}`,
                abi: TROVE_MANAGER_ABI,
                functionName: "getTroveColl",
                args: [walletClient.getAddress(), vaultAddress],
            });
            const collateral = (collateralResult as { value: bigint }).value;

            // Get Trove debt
            const debtResult = await walletClient.read({
                address: TROVE_MANAGER_ADDRESS as `0x${string}`,
                abi: TROVE_MANAGER_ABI,
                functionName: "getTroveDebt",
                args: [walletClient.getAddress(), vaultAddress],
            });
            const debt = (debtResult as { value: bigint }).value;

            // Map status number to string
            const statusMap = {
                0: "nonExistent",
                1: "active",
                2: "closedByOwner",
                3: "closedByLiquidation",
                4: "closedByRedemption",
            };

            return {
                currentCollateral: collateral.toString(),
                currentDebt: formatUnits(debt, 18),
                troveStatus:
                    statusMap[status as keyof typeof statusMap] || "unknown",
            };
        } catch (error) {
            throw Error(`Failed to monitor position: ${error}`);
        }
    }

    @Tool({
        name: "ironclad_calculate_max_withdrawable",
        description:
            "Calculate maximum withdrawable amount while maintaining health factor",
    })
    async calculateMaxWithdrawableAmount(
        walletClient: EVMWalletClient,
        parameters: CalculateMaxWithdrawableParameters
    ): Promise<bigint> {
        const asset = parameters.assetAddress;
        // Get user's reserve data
        const userReserveDataResult = await walletClient.read({
            address: PROTOCOL_DATA_PROVIDER_ADDRESS as `0x${string}`,
            abi: PROTOCOL_DATA_PROVIDER_ABI,
            functionName: "getUserReserveData",
            args: [asset, walletClient.getAddress()],
        });
        const userReserveData = (userReserveDataResult as { value: any[] })
            .value;

        // Get reserve configuration
        const reserveConfigResult = await walletClient.read({
            address: PROTOCOL_DATA_PROVIDER_ADDRESS as `0x${string}`,
            abi: PROTOCOL_DATA_PROVIDER_ABI,
            functionName: "getReserveConfigurationData",
            args: [asset],
        });
        const reserveConfig = (reserveConfigResult as { value: any[] }).value;

        const currentATokenBalance = userReserveData[0]; // Current collateral
        const currentVariableDebt = userReserveData[2]; // Current debt
        const liquidationThreshold = reserveConfig[2]; // In basis points (e.g., 8500 = 85%)

        let remainingDebt: bigint;
        // Update remaining debt from protocol data
        remainingDebt = currentVariableDebt;

        if (remainingDebt === 0n) {
            return currentATokenBalance; // Can withdraw everything if no debt
        }

        // To maintain HF >= 1, we need:
        // (collateral * liquidationThreshold) / debt >= 1
        // So: collateral >= debt / (liquidationThreshold)
        // Therefore, maximum withdrawable = currentCollateral - (debt / liquidationThreshold)

        const minRequiredCollateral =
            (currentVariableDebt * 10000n) / liquidationThreshold;

        if (currentATokenBalance <= minRequiredCollateral) {
            return 0n; // Cannot withdraw anything
        }

        return currentATokenBalance - minRequiredCollateral;
    }

    private async getHints(
        walletClient: EVMWalletClient,
        collateral: string,
        collateralAmount: bigint,
        debt: bigint
    ): Promise<{ upperHint: string; lowerHint: string }> {
        const decimals = (
            await walletClient.read({
                address: collateral,
                abi: ERC20_ABI,
                functionName: "decimals",
            })
        ).value;

        const troveCount = (
            await walletClient.read({
                address: TROVE_MANAGER_ADDRESS,
                abi: TROVE_MANAGER_ABI,
                functionName: "getTroveOwnersCount",
                args: [collateral],
            })
        ).value;

        const numTrials = Math.ceil(15 * Math.sqrt(Number(troveCount)));
        const NICR = (
            await walletClient.read({
                address: HINT_HELPERS_ADDRESS,
                abi: HINT_HELPERS_ABI,
                functionName: "computeNominalCR",
                args: [collateralAmount, debt, decimals],
            })
        ).value;

        const randomSeed = Math.floor(Math.random() * 1000000);

        const result = await walletClient.read({
            address: HINT_HELPERS_ADDRESS,
            abi: HINT_HELPERS_ABI,
            functionName: "getApproxHint",
            args: [collateral, NICR, numTrials, randomSeed],
        });

        // The function returns (address hintAddress, uint diff, uint latestRandomSeed)
        const [hintAddress] = (
            result as { value: [`0x${string}`, bigint, bigint] }
        ).value;

        return {
            upperHint: hintAddress,
            lowerHint: "0x0000000000000000000000000000000000000000", // zero address
        };
    }
}