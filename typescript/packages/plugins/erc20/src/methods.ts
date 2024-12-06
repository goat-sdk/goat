import type { EVMWalletClient } from "@goat-sdk/core";
import { formatUnits, parseUnits } from "viem";
import type { z } from "zod";
import { ERC20_ABI } from "./abi";
import type {
    allowanceParametersSchema,
    approveParametersSchema,
    getBalanceParametersSchema,
    transferFromParametersSchema,
    transferParametersSchema,
} from "./parameters";
import type { ChainSpecificToken } from "./token";

export async function balanceOf(
    walletClient: EVMWalletClient,
    token: ChainSpecificToken,
    parameters: z.infer<typeof getBalanceParametersSchema>,
): Promise<string> {
    try {
        const resolvedWalletAddress = await walletClient.resolveAddress(parameters.wallet);

        const rawBalance = await walletClient.read({
            address: token.contractAddress,
            abi: ERC20_ABI,
            functionName: "balanceOf",
            args: [resolvedWalletAddress],
        });

        return formatUnits(rawBalance.value as bigint, token.decimals);
    } catch (error) {
        throw Error(`Failed to fetch balance: ${error}`);
    }
}

export async function transfer(
    walletClient: EVMWalletClient,
    token: ChainSpecificToken,
    parameters: z.infer<typeof transferParametersSchema>,
): Promise<string> {
    try {
        const amountInBaseUnits = parseUnits(parameters.amount, token.decimals);

        const resolvedRecipientAddress = await walletClient.resolveAddress(parameters.to);

        const hash = await walletClient.sendTransaction({
            to: token.contractAddress,
            abi: ERC20_ABI,
            functionName: "transfer",
            args: [resolvedRecipientAddress, amountInBaseUnits],
        });

        return hash.hash;
    } catch (error) {
        throw Error(`Failed to transfer: ${error}`);
    }
}

export async function totalSupply(walletClient: EVMWalletClient, token: ChainSpecificToken): Promise<string> {
    try {
        const rawTotalSupply = await walletClient.read({
            address: token.contractAddress,
            abi: ERC20_ABI,
            functionName: "totalSupply",
        });

        return formatUnits(rawTotalSupply.value as bigint, token.decimals);
    } catch (error) {
        throw Error(`Failed to fetch total supply: ${error}`);
    }
}

export async function allowance(
    walletClient: EVMWalletClient,
    token: ChainSpecificToken,
    parameters: z.infer<typeof allowanceParametersSchema>,
): Promise<string> {
    try {
        const resolvedOwnerAddress = await walletClient.resolveAddress(parameters.owner);

        const resolvedSpenderAddress = await walletClient.resolveAddress(parameters.spender);

        const rawAllowance = await walletClient.read({
            address: token.contractAddress,
            abi: ERC20_ABI,
            functionName: "allowance",
            args: [resolvedOwnerAddress, resolvedSpenderAddress],
        });

        return formatUnits(rawAllowance.value as bigint, token.decimals);
    } catch (error) {
        throw Error(`Failed to fetch allowance: ${error}`);
    }
}

export async function approve(
    walletClient: EVMWalletClient,
    token: ChainSpecificToken,
    parameters: z.infer<typeof approveParametersSchema>,
): Promise<string> {
    try {
        const resolvedSpenderAddress = await walletClient.resolveAddress(parameters.spender);

        const amountInBaseUnits = parseUnits(parameters.amount, token.decimals);

        const hash = await walletClient.sendTransaction({
            to: token.contractAddress,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [resolvedSpenderAddress, amountInBaseUnits],
        });

        return hash.hash;
    } catch (error) {
        throw Error(`Failed to approve: ${error}`);
    }
}

export async function transferFrom(
    walletClient: EVMWalletClient,
    token: ChainSpecificToken,
    parameters: z.infer<typeof transferFromParametersSchema>,
): Promise<string> {
    try {
        const resolvedFromAddress = await walletClient.resolveAddress(parameters.from);

        const resolvedToAddress = await walletClient.resolveAddress(parameters.to);

        const amountInBaseUnits = parseUnits(parameters.amount, token.decimals);

        const hash = await walletClient.sendTransaction({
            to: token.contractAddress,
            abi: ERC20_ABI,
            functionName: "transferFrom",
            args: [resolvedFromAddress, resolvedToAddress, amountInBaseUnits],
        });

        return hash.hash;
    } catch (error) {
        throw Error(`Failed to transfer from: ${error}`);
    }
}
