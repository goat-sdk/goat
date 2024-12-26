import type { EVMWalletClient } from "@goat-sdk/wallet-evm";
import type { z } from "zod";
import { ERC721_ABI } from "./abi";
import type {
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
            abi: ERC721_ABI,
            functionName: "balanceOf",
            args: [resolvedWalletAddress],
        });

        return (rawBalance.value as bigint).toString();
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
        const resolvedRecipientAddress = await walletClient.resolveAddress(parameters.to);

        const hash = await walletClient.sendTransaction({
            to: token.contractAddress,
            abi: ERC721_ABI,
            functionName: "safeTransferFrom",
            args: [await walletClient.getAddress(), resolvedRecipientAddress, parameters.tokenId],
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
            abi: ERC721_ABI,
            functionName: "totalSupply",
        });

        return (rawTotalSupply.value as bigint).toString();
    } catch (error) {
        throw Error(`Failed to fetch total supply: ${error}`);
    }
}

export async function approve(
    walletClient: EVMWalletClient,
    token: ChainSpecificToken,
    parameters: z.infer<typeof approveParametersSchema>,
): Promise<string> {
    try {
        const resolvedSpenderAddress = await walletClient.resolveAddress(parameters.spender);

        const hash = await walletClient.sendTransaction({
            to: token.contractAddress,
            abi: ERC721_ABI,
            functionName: "approve",
            args: [resolvedSpenderAddress, parameters.tokenId],
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

        const hash = await walletClient.sendTransaction({
            to: token.contractAddress,
            abi: ERC721_ABI,
            functionName: "safeTransferFrom",
            args: [resolvedFromAddress, resolvedToAddress, parameters.tokenId],
        });

        return hash.hash;
    } catch (error) {
        throw Error(`Failed to transfer from: ${error}`);
    }
}
