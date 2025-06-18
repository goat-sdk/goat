import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import { STAKING_V3_ABI } from "./abi";
import { GetStakingPowerParameters, GetStakingRemainingLockupParameters } from "./parameters";
import { countdownToTimestamp } from "./utils";

BigNumber.config({ EXPONENTIAL_AT: [-1e9, 1e9] });

const CONTRACT_ADDRESSES: { [key: string]: { [key: string]: string } } = {
    PRONFTStakingCore: {
        1: "0x4e2f246042FC67d8173397c01775Fc29508c9aCe",
        11155111: "0xea6fFe0d13eca58CfF3427d65807338982BdC687",
    },
    PropyKeyStakingModule: {
        1: "0xBd0969813733df8f506611c204EEF540770CAB72",
        11155111: "0xBd0969813733df8f506611c204EEF540770CAB72",
    },
    ERC20StakingModule: {
        1: "0xF46464ad108B1CC7866DF2Cfa87688F7742BA623",
        11155111: "0xF46464ad108B1CC7866DF2Cfa87688F7742BA623",
    },
    LPStakingModule: {
        1: "0x8D020131832D8823846232031bD7EEee7A102F2F",
        11155111: "0x8D020131832D8823846232031bD7EEee7A102F2F",
    },
};

export class PropyService {
    constructor(
        private readonly provider: string | undefined,
        private readonly chainId: number | undefined,
    ) {}

    @Tool({
        name: "get_staking_power",
        description:
            "Get the current staking power (pSTAKE balance) of the current wallet address, and it's share of incoming rewards",
    })
    async getStakingPower(walletClient: EVMWalletClient, parameters: GetStakingPowerParameters) {
        let chainId = walletClient.getChain().id;

        if (this.chainId) {
            chainId = this.chainId;
        }

        const contractAddress = CONTRACT_ADDRESSES?.PRONFTStakingCore?.[chainId];

        if (!contractAddress) {
            throw Error("Failed to fetch balance, unable to detect staking contract address");
        }

        const { ownWalletAddress, specifiedWalletAddress } = parameters;

        let useWalletAddress = ownWalletAddress;
        if (specifiedWalletAddress !== ownWalletAddress) {
            useWalletAddress = specifiedWalletAddress;
        }

        if (!useWalletAddress) {
            throw Error("Failed to fetch balance, unable to detect wallet address");
        }

        try {
            const rawBalance = await walletClient.read({
                address: contractAddress,
                abi: STAKING_V3_ABI,
                functionName: "balanceOf",
                args: [useWalletAddress],
            });

            if (Number(rawBalance.value) > 0) {
                const rawSupply = await walletClient.read({
                    address: contractAddress,
                    abi: STAKING_V3_ABI,
                    functionName: "totalSupply",
                    args: [],
                });

                const percentageShare = new BigNumber(`${rawBalance.value}`)
                    .multipliedBy(100)
                    .dividedBy(new BigNumber(`${rawSupply.value}`))
                    .toFixed(2);
                return {
                    stakingPower: `${Number(ethers.utils.formatUnits(`${rawBalance.value}`, 8)).toFixed(2)} pSTAKE`,
                    percentageShareOfIncomingRewards: `${percentageShare} %`,
                };
            }
            return {
                stakingPower: `${Number(ethers.utils.formatUnits(`${rawBalance.value}`, 8)).toFixed(2)} pSTAKE`,
                percentageShareOfIncomingRewards: "0 %",
            };
        } catch (error) {
            throw Error(`Failed to fetch balance: ${error}`);
        }
    }
    @Tool({
        name: "get_staking_remaining_lockup_period",
        description:
            "Get the remaining staking lockup periods of the current wallet address, support the following staking modules: PropyKey Staking, PRO staking & Uniswap Liquidity Provider NFT (LP NFT) staking",
    })
    async getStakingRemainingLockupPeriod(
        walletClient: EVMWalletClient,
        parameters: GetStakingRemainingLockupParameters,
    ) {
        let chainId = walletClient.getChain().id;

        if (this.chainId) {
            chainId = this.chainId;
        }

        const { ownWalletAddress, specifiedWalletAddress, selectedStakingModules } = parameters;

        const checkModuleConfigs = [];
        for (const moduleType of selectedStakingModules) {
            if (moduleType.moduleName === "PRO") {
                checkModuleConfigs.push({
                    assetType: moduleType.moduleName,
                    contractAddress: CONTRACT_ADDRESSES?.PRONFTStakingCore?.[chainId],
                    moduleId: "0x1eacf06e77941a18f9bc3eb0852750ba87d1f812f0c2df2907082d9904d39335",
                    abi: STAKING_V3_ABI,
                });
            } else if (moduleType.moduleName === "PropyKeys") {
                checkModuleConfigs.push({
                    assetType: moduleType.moduleName,
                    contractAddress: CONTRACT_ADDRESSES?.PRONFTStakingCore?.[chainId],
                    moduleId: "0x45078117f79b3fdef93038946c01157f589c320a33e8da6a836521d757382476",
                    abi: STAKING_V3_ABI,
                });
            } else if (moduleType.moduleName === "UniswapLPNFT") {
                checkModuleConfigs.push({
                    assetType: moduleType.moduleName,
                    contractAddress: CONTRACT_ADDRESSES?.PRONFTStakingCore?.[chainId],
                    moduleId: "0xc857a6e7be06cf7940500da1c03716d761f264c09e870f16bef249a1d84f00ac",
                    abi: STAKING_V3_ABI,
                });
            }
        }

        if (checkModuleConfigs.length === 0) {
            throw Error("Failed to remaining staking time, unable to detect staking module contract addresses");
        }

        let useWalletAddress = ownWalletAddress;
        if (specifiedWalletAddress !== ownWalletAddress) {
            useWalletAddress = specifiedWalletAddress;
        }

        if (!useWalletAddress) {
            throw Error("Failed to remaining staking time, unable to detect staker's wallet address");
        }

        try {
            const response: { [key: string]: string | Date }[] = [];

            for (const moduleConfig of checkModuleConfigs) {
                const lockedAt = await walletClient.read({
                    address: moduleConfig.contractAddress,
                    abi: moduleConfig.abi,
                    functionName: "lockedAt",
                    args: [useWalletAddress, moduleConfig.moduleId],
                });

                const lockedUntil = await walletClient.read({
                    address: moduleConfig.contractAddress,
                    abi: moduleConfig.abi,
                    functionName: "locked",
                    args: [useWalletAddress, moduleConfig.moduleId],
                });

                if (Number(lockedAt?.value) > 0 && Number(lockedUntil?.value) > 0) {
                    response.push({
                        stakedAssetType: moduleConfig.assetType,
                        // "unixTimestampLockedAt": new Date(Number(lockedAt?.value) * 1000),
                        dateLockedUntil: new Date(Number(lockedUntil?.value) * 1000),
                        // "currentDate": new Date(),
                        timeRemainingOnLockup: countdownToTimestamp(
                            Number(lockedUntil?.value),
                            "Lockup period is complete",
                            false,
                        ),
                        meta: "Include an intuitive amount of time left for the staking (e.g. in days/hours/minutes, use appropriate values), also mention the start and end date of the staking",
                    });
                } else {
                    response.push({
                        stakedAssetType: moduleConfig.assetType,
                        unixTimestampLockedAt: `No stake "locked at" time, this indicates that the current wallet address doesn't have an active staking position for ${moduleConfig.assetType}`,
                        unixTimestampLockedUntil: `No stake "locked until" time, this indicates that the current wallet address doesn't have an active staking position for ${moduleConfig.assetType}`,
                    });
                }
            }

            if (response.length > 0) {
                return response;
            }
            return "Unable to find results";
        } catch (error) {
            throw Error(`Failed to fetch balance: ${error}`);
        }
    }
}
