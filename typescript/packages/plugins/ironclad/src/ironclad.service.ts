import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { formatUnits, parseUnits } from "viem";
import type { Address } from "viem";
import { z } from "zod";
import { ERC20_ABI } from "./abi/erc20";
import { LENDING_POOL_ABI } from "./abi/lendingPool";
import { PROTOCOL_DATA_PROVIDER_ABI } from "./abi/protocolDataProvider";
import { LoopDepositParameters, LoopWithdrawParameters } from "./parameters";
import {
    BorrowIUSDParameters,
    RepayIUSDParameters,
    MonitorPositionParameters,
} from "./parameters";
import { CalculateMaxWithdrawableParameters } from "./parameters";

interface LoopPosition {
    borrowedAmounts: string[];
    totalDeposited: string;
    totalBorrowed: string;
}

const LENDING_POOL_ADDRESS = "0xB702cE183b4E1Faa574834715E5D4a6378D0eEd3";
const PROTOCOL_DATA_PROVIDER_ADDRESS =
    "0x29563f73De731Ae555093deb795ba4D1E584e42E";
const IUSD_ADDRESS = "0xA70266C8F8Cf33647dcFEE763961aFf418D9E1E4";

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
            console.log(
                `[Ironclad] ====== Starting Loop Deposit Operation ======`
            );
            console.log(`[Ironclad] Asset Address: ${parameters.assetAddress}`);
            console.log(
                `[Ironclad] Initial Amount: ${parameters.initialAmount}`
            );
            console.log(`[Ironclad] Number of Loops: ${parameters.numLoops}`);
            console.log(
                `[Ironclad] User Address: ${walletClient.getAddress()}`
            );

            const position: LoopPosition = {
                borrowedAmounts: [],
                totalDeposited: "0",
                totalBorrowed: "0",
            };

            const asset = parameters.assetAddress;
            console.log(`[Ironclad] Checking allowance for initial deposit...`);
            const allowanceResult = await walletClient.read({
                address: asset as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "allowance",
                args: [walletClient.getAddress(), LENDING_POOL_ADDRESS],
            });
            const allowance = (allowanceResult as { value: bigint }).value;

            console.log(`[Ironclad] Current allowance: ${allowance}`);
            console.log(
                `[Ironclad] Required allowance: ${parameters.initialAmount}`
            );

            if (Number(allowance) < Number(parameters.initialAmount)) {
                console.log(`[Ironclad] Insufficient allowance, approving...`);
                await walletClient.sendTransaction({
                    to: asset,
                    abi: ERC20_ABI,
                    functionName: "approve",
                    args: [LENDING_POOL_ADDRESS, parameters.initialAmount],
                });
                console.log(`[Ironclad] Approval transaction successful`);
            } else {
                console.log(`[Ironclad] Sufficient allowance already exists`);
            }

            console.log(
                `[Ironclad] Performing initial deposit of ${parameters.initialAmount}`
            );
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

            console.log(`[Ironclad] Initial deposit successful`);

            position.totalDeposited = parameters.initialAmount;
            let currentAmount = parameters.initialAmount;

            // Execute loops
            for (let i = 0; i < parameters.numLoops; i++) {
                console.log(
                    `\n[Ironclad] ====== Starting Loop ${i + 1}/${
                        parameters.numLoops
                    } ======`
                );

                // Get reserve configuration
                console.log(`[Ironclad] Fetching reserve configuration...`);
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
                console.log(`[Ironclad] LTV from protocol: ${ltv / 100}%`);

                const borrowAmount = (
                    (Number(currentAmount) * ltv) /
                    10000
                ).toString();
                console.log(
                    `[Ironclad] Calculated borrow amount: ${borrowAmount}`
                );

                // Borrow
                console.log(`[Ironclad] Executing borrow transaction...`);
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
                console.log(`[Ironclad] Borrow successful`);

                // Allowance check
                console.log(
                    `[Ironclad] Checking allowance for subsequent deposit...`
                );
                const loopAllowanceResult = await walletClient.read({
                    address: asset as `0x${string}`,
                    abi: ERC20_ABI,
                    functionName: "allowance",
                    args: [walletClient.getAddress(), LENDING_POOL_ADDRESS],
                });
                const loopAllowance = (loopAllowanceResult as { value: bigint })
                    .value;

                if (Number(loopAllowance) < Number(borrowAmount)) {
                    console.log(
                        `[Ironclad] Insufficient allowance, approving...`
                    );
                    await walletClient.sendTransaction({
                        to: asset,
                        abi: ERC20_ABI,
                        functionName: "approve",
                        args: [LENDING_POOL_ADDRESS, borrowAmount],
                    });
                    console.log(`[Ironclad] Approval successful`);
                }

                // Deposit
                console.log(`[Ironclad] Depositing borrowed amount...`);
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
                console.log(`[Ironclad] Deposit successful`);

                // Update position tracking
                position.borrowedAmounts.push(borrowAmount);
                position.totalBorrowed = (
                    Number(position.totalBorrowed) + Number(borrowAmount)
                ).toString();
                position.totalDeposited = (
                    Number(position.totalDeposited) + Number(borrowAmount)
                ).toString();
                currentAmount = borrowAmount;

                console.log(`[Ironclad] Loop ${i + 1} Summary:`);
                console.log(`  - Amount Borrowed: ${borrowAmount}`);
                console.log(`  - Total Borrowed: ${position.totalBorrowed}`);
                console.log(`  - Total Deposited: ${position.totalDeposited}`);
                console.log(
                    `[Ironclad] ====== Loop ${i + 1} Complete ======\n`
                );
            }

            console.log(
                `\n[Ironclad] ====== Loop Deposit Operation Complete ======`
            );
            console.log(`[Ironclad] Final Position Summary:`);
            console.log(`  - Total Deposited: ${position.totalDeposited}`);
            console.log(`  - Total Borrowed: ${position.totalBorrowed}`);
            console.log(
                `  - Number of Loops Completed: ${parameters.numLoops}`
            );
            console.log(
                `[Ironclad] ==========================================\n`
            );

            return position;
        } catch (error) {
            console.error(`[Ironclad] ❌ Error in loop deposit operation:`);
            console.error(`[Ironclad] ${error}`);
            console.error(`[Ironclad] Stack trace:`, error);
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
            console.log(`[Ironclad] ====== Starting Loop Withdrawal ======`);
            console.log(`[Ironclad] Asset Address: ${parameters.assetAddress}`);
            console.log(
                `[Ironclad] User Address: ${walletClient.getAddress()}`
            );

            // Get initial debt position
            console.log(`[Ironclad] Fetching initial position data...`);
            const userReserveDataResult = await walletClient.read({
                address: PROTOCOL_DATA_PROVIDER_ADDRESS as `0x${string}`,
                abi: PROTOCOL_DATA_PROVIDER_ABI,
                functionName: "getUserReserveData",
                args: [parameters.assetAddress, walletClient.getAddress()],
            });

            const userReserveData = (userReserveDataResult as { value: any[] })
                .value;
            let remainingDebt = userReserveData[2]; // currentVariableDebt
            console.log(`[Ironclad] Initial variable debt: ${remainingDebt}`);

            let withdrawalCount = 1;
            while (remainingDebt > 0n) {
                console.log(
                    `\n[Ironclad] === Withdrawal Loop ${withdrawalCount} ===`
                );
                console.log(`[Ironclad] Remaining debt: ${remainingDebt}`);

                // Calculate max withdrawable amount
                console.log(
                    `[Ironclad] Calculating maximum withdrawable amount...`
                );
                const maxWithdrawable =
                    await this.calculateMaxWithdrawableAmount(walletClient, {
                        assetAddress: parameters.assetAddress,
                    });
                console.log(
                    `[Ironclad] Max withdrawable amount: ${maxWithdrawable}`
                );

                if (maxWithdrawable === 0n) {
                    console.error(
                        `[Ironclad] ❌ Cannot proceed: Zero withdrawable amount`
                    );
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
                console.log(
                    `[Ironclad] Adjusted withdrawal amount: ${withdrawAmount}`
                );
                console.log(
                    `[Ironclad] Using full amount: ${remainingDebt === 0n}`
                );

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
                console.log(`[Ironclad] ✅ Withdrawal successful`);

                // Check and handle allowance
                console.log(`[Ironclad] Checking repayment allowance...`);
                const allowanceResult = await walletClient.read({
                    address: parameters.assetAddress as `0x${string}`,
                    abi: ERC20_ABI,
                    functionName: "allowance",
                    args: [walletClient.getAddress(), LENDING_POOL_ADDRESS],
                });
                const allowance = (allowanceResult as { value: bigint }).value;

                if (allowance < withdrawAmount) {
                    console.log(
                        `[Ironclad] Insufficient allowance, approving...`
                    );
                    await walletClient.sendTransaction({
                        to: parameters.assetAddress,
                        abi: ERC20_ABI,
                        functionName: "approve",
                        args: [LENDING_POOL_ADDRESS, withdrawAmount],
                    });
                    console.log(`[Ironclad] ✅ Approval successful`);
                } else {
                    console.log(`[Ironclad] Sufficient allowance exists`);
                }

                // Repay
                console.log(`[Ironclad] Executing repayment transaction...`);
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
                console.log(`[Ironclad] ✅ Repayment successful`);

                // After repayment, get updated debt from protocol
                const updatedReserveData = await walletClient.read({
                    address: PROTOCOL_DATA_PROVIDER_ADDRESS as `0x${string}`,
                    abi: PROTOCOL_DATA_PROVIDER_ABI,
                    functionName: "getUserReserveData",
                    args: [parameters.assetAddress, walletClient.getAddress()],
                });
                remainingDebt = (updatedReserveData as { value: any[] })
                    .value[2];
                console.log(
                    `[Ironclad] Updated remaining debt from protocol: ${remainingDebt}`
                );
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
                console.log(`\n[Ironclad] === Final Withdrawal ===`);
                console.log(
                    `[Ironclad] Remaining deposit to withdraw: ${remainingDeposit}`
                );

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
                console.log(`[Ironclad] ✅ Final withdrawal successful`);
            }

            console.log(`\n[Ironclad] ====== Loop Withdrawal Complete ======`);
            console.log(
                `[Ironclad] Total withdrawal loops: ${withdrawalCount - 1}`
            );
            console.log(`[Ironclad] Final debt: ${remainingDebt}`);

            return `Successfully unwound position in ${
                withdrawalCount - 1
            } loops`;
        } catch (error) {
            console.error(`[Ironclad] ❌ Error in loop withdraw:`, error);
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
            console.log(`[Ironclad] ====== Monitoring Loop Position ======`);
            const asset = parameters.collateralToken;
            console.log(`[Ironclad] Asset Address: ${asset}`);

            const decimalsResult = await walletClient.read({
                address: asset as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "decimals",
            });
            const decimals = (decimalsResult as { value: number }).value;
            console.log(`[Ironclad] Asset Decimals: ${decimals}`);

            // Get user's reserve data
            console.log(`[Ironclad] Fetching user reserve data...`);
            const userReserveDataResult = await walletClient.read({
                address: PROTOCOL_DATA_PROVIDER_ADDRESS as `0x${string}`,
                abi: PROTOCOL_DATA_PROVIDER_ABI,
                functionName: "getUserReserveData",
                args: [asset, walletClient.getAddress()],
            });
            const userReserveData = (userReserveDataResult as { value: any[] })
                .value;

            // Get reserve configuration
            console.log(`[Ironclad] Fetching reserve configuration...`);
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

            console.log(`[Ironclad] Position Details:`);
            console.log(`  - Total Collateral: ${totalCollateral}`);
            console.log(`  - Total Borrowed: ${totalBorrowed}`);
            console.log(
                `  - Liquidation Threshold: ${(
                    liquidationThreshold * 100
                ).toFixed(2)}%`
            );

            // Calculate current LTV and health factor
            const currentLTV =
                totalBorrowed === "0"
                    ? "0"
                    : (
                          (Number(totalBorrowed) / Number(totalCollateral)) *
                          100
                      ).toFixed(2);
            console.log(`  - Current LTV: ${currentLTV}%`);

            const healthFactor =
                totalBorrowed === "0"
                    ? "∞"
                    : (
                          (Number(totalCollateral) * liquidationThreshold) /
                          Number(totalBorrowed)
                      ).toFixed(2);
            console.log(`  - Health Factor: ${healthFactor}`);

            console.log(`[Ironclad] ====== Monitoring Complete ======\n`);

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
            console.error(`[Ironclad] ❌ Error monitoring position:`, error);
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
            console.log(
                `[Ironclad] ====== Starting iUSD Borrow Operation ======`
            );
            console.log(
                `[Ironclad] Collateral Token: ${parameters.collateralTokenAddress}`
            );
            console.log(
                `[Ironclad] Collateral Amount: ${parameters.collateralAmount}`
            );
            console.log(
                `[Ironclad] iUSD Borrow Raw Amount: ${parameters.iusdAmount}`
            );
            console.log(
                `[Ironclad] User Address: ${walletClient.getAddress()}`
            );

            // Get iUSD decimals
            console.log(`[Ironclad] Fetching iUSD decimals...`);
            const iusdDecimalsResult = await walletClient.read({
                address: IUSD_ADDRESS as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "decimals",
            });
            const iusdDecimals = Number(
                (iusdDecimalsResult as { value: number }).value
            );
            console.log(`[Ironclad] iUSD decimals: ${iusdDecimals}`);

            // Check and handle collateral allowance
            console.log(`[Ironclad] Checking collateral allowance...`);
            const allowanceResult = await walletClient.read({
                address: parameters.collateralTokenAddress as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "allowance",
                args: [walletClient.getAddress(), LENDING_POOL_ADDRESS],
            });
            const allowance = (allowanceResult as { value: bigint }).value;
            console.log(
                `[Ironclad] Current allowance: ${allowance.toString()}`
            );

            if (Number(allowance) < Number(parameters.collateralAmount)) {
                console.log(
                    `[Ironclad] Insufficient allowance, approving collateral...`
                );
                await walletClient.sendTransaction({
                    to: parameters.collateralTokenAddress,
                    abi: ERC20_ABI,
                    functionName: "approve",
                    args: [LENDING_POOL_ADDRESS, parameters.collateralAmount],
                });
                console.log(`[Ironclad] ✅ Approval successful`);
            } else {
                console.log(`[Ironclad] Sufficient allowance exists`);
            }

            // Deposit collateral
            console.log(`[Ironclad] Depositing collateral...`);
            await walletClient.sendTransaction({
                to: LENDING_POOL_ADDRESS,
                abi: LENDING_POOL_ABI,
                functionName: "deposit",
                args: [
                    parameters.collateralTokenAddress,
                    parameters.collateralAmount,
                    walletClient.getAddress(),
                    parameters.referralCode,
                ],
            });
            console.log(`[Ironclad] ✅ Collateral deposit successful`);

            // Borrow iUSD
            console.log(`[Ironclad] Borrowing iUSD...`);
            const txHash = await walletClient.sendTransaction({
                to: LENDING_POOL_ADDRESS,
                abi: LENDING_POOL_ABI,
                functionName: "borrow",
                args: [
                    IUSD_ADDRESS,
                    parseUnits(parameters.iusdAmount, iusdDecimals),
                    2, // Variable rate
                    parameters.referralCode,
                    walletClient.getAddress(),
                ],
            });
            console.log(`[Ironclad] ✅ iUSD borrow successful`);

            console.log(`\n[Ironclad] ====== Borrow Operation Complete ======`);
            console.log(`[Ironclad] Transaction hash: ${txHash.hash}`);

            return txHash.hash;
        } catch (error) {
            console.error(`[Ironclad] ❌ Error in borrow operation:`, error);
            throw Error(`Failed to borrow iUSD: ${error}`);
        }
    }

    @Tool({
        name: "ironclad_repay_iusd",
        description: "Repay borrowed iUSD",
    })
    async repayIUSD(
        walletClient: EVMWalletClient,
        parameters: RepayIUSDParameters
    ): Promise<string> {
        try {
            // Get iUSD decimals
            const iusdDecimals = Number(
                await walletClient.read({
                    address: IUSD_ADDRESS as `0x${string}`,
                    abi: ERC20_ABI,
                    functionName: "decimals",
                })
            );

            // Check and handle iUSD allowance
            const allowance = await walletClient.read({
                address: IUSD_ADDRESS as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "allowance",
                args: [walletClient.getAddress(), LENDING_POOL_ADDRESS],
            });

            if (Number(allowance) < Number(parameters.repayAmount)) {
                await walletClient.sendTransaction({
                    to: IUSD_ADDRESS,
                    abi: ERC20_ABI,
                    functionName: "approve",
                    args: [
                        LENDING_POOL_ADDRESS,
                        parseUnits(parameters.repayAmount, iusdDecimals),
                    ],
                });
            }

            // Repay iUSD
            const txHash = await walletClient.sendTransaction({
                to: LENDING_POOL_ADDRESS,
                abi: LENDING_POOL_ABI,
                functionName: "repay",
                args: [
                    IUSD_ADDRESS,
                    parseUnits(parameters.repayAmount, iusdDecimals),
                    2, // Variable rate
                    walletClient.getAddress(),
                ],
            });

            return txHash.hash;
        } catch (error) {
            throw Error(`Failed to repay iUSD: ${error}`);
        }
    }

    @Tool({
        name: "ironclad_monitor_position",
        description: "Monitor health of an iUSD position",
    })
    async monitorPosition(
        walletClient: EVMWalletClient,
        parameters: MonitorPositionParameters
    ): Promise<{
        currentCollateral: string;
        currentBorrow: string;
        currentRate: string;
    }> {
        try {
            const collateralToken = await walletClient.resolveAddress(
                parameters.collateralToken
            );

            // Get token decimals
            const decimals = Number(
                await walletClient.read({
                    address: collateralToken as `0x${string}`,
                    abi: ERC20_ABI,
                    functionName: "decimals",
                })
            );

            const userReserveDataResult = await walletClient.read({
                address: PROTOCOL_DATA_PROVIDER_ADDRESS as `0x${string}`,
                abi: PROTOCOL_DATA_PROVIDER_ABI,
                functionName: "getUserReserveData",
                args: [collateralToken, walletClient.getAddress()],
            });
            const userReserveData = (userReserveDataResult as { value: any[] })
                .value;

            return {
                currentCollateral: formatUnits(userReserveData[0], decimals), // currentATokenBalance
                currentBorrow: formatUnits(userReserveData[2], 6), // currentVariableDebt (iUSD is 6 decimals)
                currentRate: formatUnits(userReserveData[4], 27), // variableBorrowRate
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

        console.log(
            `[Ironclad] Current aToken balance: ${currentATokenBalance}`
        );
        console.log(`[Ironclad] Current variable debt: ${currentVariableDebt}`);

        let remainingDebt: bigint;
        // Update remaining debt from protocol data
        remainingDebt = currentVariableDebt;

        if (remainingDebt === 0n) {
            console.log(`[Ironclad] No remaining debt, exiting loop`);
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
}
