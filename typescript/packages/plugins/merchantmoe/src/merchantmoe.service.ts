import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { parseUnits } from "viem";
import { MerchantMoePluginOptions } from "./merchantmoe.plugin";
import { erc20ABI, routerABI, factoryABI, stakingABI } from "./abi";
import {
    GetAmountsOutParams,
    GetBalanceParams,
    GetPairAtIndexParams,
    GetPairParams,
    StakeMoeParams,
    SwapParams,
    UnstakeMoeParams,
} from "./parameters";

// Contract addresses
const ADDRESSES = {
    MOE_TOKEN: "0x4515A45337F461A11Ff0FE8aBF3c606AE5dC00c9",
    MASTER_CHEF: "0xd4BD5e47548D8A6ba2a0Bf4cE073Cbf8fa523DcC",
    MOE_STAKING: "0xE92249760e1443FbBeA45B03f607Ba84471Fa793",
    SMOE: "0xb3938E6ee233E7847a5F17bb843E9bD0Aa07e116",
    MOE_FACTORY: "0x5bef015ca9424a7c07b68490616a4c1f094bedec",
    MOE_ROUTER: "0xeaEE7EE68874218c3558b40063c42B82D3E7232a",
    VEMOE: "0x240616e2448e078934863fB6eb5133834BF14Ef1",
    VEMOE_REWARDER: "0x151B82CA3a0c9dA9Dfde200F9C527cD89dd6aea8",
} as const;

export class MerchantMoeService {
    @Tool({
        name: "merchantmoe_get_moe_balance",
        description: "Get MOE token balance for a given address"
    })
    async getMoeBalance(walletClient: EVMWalletClient, parameters: GetBalanceParams) {
        const result = await walletClient.read({
            address: ADDRESSES.MOE_TOKEN,
            abi: erc20ABI,
            functionName: "balanceOf",
            args: [parameters.address as `0x${string}`],
        });
        return BigInt(result.toString());
    }

    @Tool({
        name: "merchantmoe_stake_moe",
        description: "Stake MOE tokens in the staking contract"
    })
    async stakeMoe(walletClient: EVMWalletClient, parameters: StakeMoeParams) {
        const amount = parseUnits(parameters.amount, 18);
        // First approve staking contract
        const approvalHash = await walletClient.sendTransaction({
            to: ADDRESSES.MOE_TOKEN,
            abi: erc20ABI,
            functionName: "approve",
            args: [ADDRESSES.MOE_STAKING, amount],
        });

        const hash = await walletClient.sendTransaction({
            to: ADDRESSES.MOE_STAKING,
            abi: stakingABI,
            functionName: "stake",
            args: [amount],
        });

        return hash.hash;
    }

    @Tool({
        name: "merchantmoe_unstake_moe",
        description: "Unstake MOE tokens from the staking contract"
    })
    async unstakeMoe(walletClient: EVMWalletClient, parameters: UnstakeMoeParams) {
        const amount = parseUnits(parameters.amount, 18);
        const hash = await walletClient.sendTransaction({
            to: ADDRESSES.MOE_STAKING,
            abi: stakingABI,
            functionName: "withdraw",
            args: [amount],
        });
        return hash.hash;
    }

    @Tool({
        name: "merchantmoe_get_earned_moe",
        description: "Get earned MOE rewards for a given address"
    })
    async getEarnedMoe(walletClient: EVMWalletClient, parameters: GetBalanceParams) {
        const result = await walletClient.read({
            address: ADDRESSES.MOE_STAKING,
            abi: stakingABI,
            functionName: "earned",
            args: [parameters.address as `0x${string}`],
        });
        return BigInt(result.toString());
    }

    @Tool({
        name: "merchantmoe_claim_rewards",
        description: "Claim earned MOE rewards from staking"
    })
    async claimRewards(walletClient: EVMWalletClient, parameters: GetBalanceParams) {
        const hash = await walletClient.sendTransaction({
            to: ADDRESSES.MOE_STAKING,
            abi: stakingABI,
            functionName: "getReward",
            args: [],
        });
        return hash.hash;
    }

    @Tool({
        name: "merchantmoe_exit_staking",
        description: "Withdraw all staked MOE and claim rewards"
    })
    async exitStaking(walletClient: EVMWalletClient, parameters: GetBalanceParams) {
        const hash = await walletClient.sendTransaction({
            to: ADDRESSES.MOE_STAKING,
            abi: stakingABI,
            functionName: "exit",
            args: [],
        });
        return hash.hash;
    }

    @Tool({
        name: "merchantmoe_get_vemoe_balance",
        description: "Get veMOE balance for a given address"
    })
    async getVeMoeBalance(walletClient: EVMWalletClient, parameters: GetBalanceParams) {
        const result = await walletClient.read({
            address: ADDRESSES.VEMOE,
            abi: erc20ABI,
            functionName: "balanceOf",
            args: [parameters.address as `0x${string}`],
        });
        return BigInt(result.toString());
    }

    @Tool({
        name: "merchantmoe_get_amounts_out",
        description: "Calculate output amounts for a given input amount and path"
    })
    async getAmountsOut(walletClient: EVMWalletClient, parameters: GetAmountsOutParams) {
        const amountIn = parseUnits(parameters.amountIn, 18);
        const result = await walletClient.read({
            address: ADDRESSES.MOE_ROUTER,
            abi: routerABI,
            functionName: "getAmountsOut",
            args: [amountIn, parameters.path as `0x${string}`[]],
        });
        return ((result as unknown) as bigint[]).map(r => BigInt(r.toString()));
    }

    @Tool({
        name: "merchantmoe_swap_tokens",
        description: "Swap an exact amount of input tokens for output tokens"
    })
    async swapExactTokensForTokens(walletClient: EVMWalletClient, parameters: SwapParams) {
        const amountIn = parseUnits(parameters.amountIn, 18);
        const amountOutMin = parseUnits(parameters.amountOutMin, 18);
        const deadline = BigInt(Math.floor(Date.now() / 1000) + parameters.deadline);

        // First approve router
        const approvalHash = await walletClient.sendTransaction({
            to: parameters.path[0] as `0x${string}`,
            abi: erc20ABI,
            functionName: "approve",
            args: [ADDRESSES.MOE_ROUTER, amountIn],
        });

        const hash = await walletClient.sendTransaction({
            to: ADDRESSES.MOE_ROUTER,
            abi: routerABI,
            functionName: "swapExactTokensForTokens",
            args: [
                amountIn,
                amountOutMin,
                parameters.path as `0x${string}`[],
                parameters.to as `0x${string}`,
                deadline,
            ],
        });

        return hash.hash;
    }

    @Tool({
        name: "merchantmoe_get_pair",
        description: "Get the address of a liquidity pair for two tokens"
    })
    async getPair(walletClient: EVMWalletClient, parameters: GetPairParams) {
        const result = await walletClient.read({
            address: ADDRESSES.MOE_FACTORY,
            abi: factoryABI,
            functionName: "getPair",
            args: [parameters.tokenA as `0x${string}`, parameters.tokenB as `0x${string}`],
        });
        return ((result as unknown) as `0x${string}`);
    }

    @Tool({
        name: "merchantmoe_get_pairs_length",
        description: "Get the total number of liquidity pairs"
    })
    async getAllPairsLength(walletClient: EVMWalletClient, parameters: GetBalanceParams) {
        const result = await walletClient.read({
            address: ADDRESSES.MOE_FACTORY,
            abi: factoryABI,
            functionName: "allPairsLength",
            args: [],
        });
        return BigInt(result.toString());
    }

    @Tool({
        name: "merchantmoe_get_pair_at_index",
        description: "Get the address of a liquidity pair by its index"
    })
    async getPairAtIndex(walletClient: EVMWalletClient, parameters: GetPairAtIndexParams) {
        const result = await walletClient.read({
            address: ADDRESSES.MOE_FACTORY,
            abi: factoryABI,
            functionName: "allPairs",
            args: [parameters.index],
        });
        return ((result as unknown) as `0x${string}`);
    }
} 