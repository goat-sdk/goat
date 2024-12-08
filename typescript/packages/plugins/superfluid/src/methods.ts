import type { EVMWalletClient } from "@goat-sdk/core";
<<<<<<< HEAD
import type { z } from "zod";
import { CFA_FORWARDER_ABI } from "./abi";
import type {
    flowParametersSchema,
    getFlowrateParametersSchema,
    updateMemberUnitsParametersSchema,
    getUnitsParametersSchema,
    getMemberFlowRateParametersSchema,
    getTotalFlowRateParametersSchema,
} from "./parameters";
import { Abi } from "viem";
import { POOL_ABI } from "./abi";

export async function flow(
    walletClient: EVMWalletClient,
    parameters: z.infer<typeof flowParametersSchema>
): Promise<string> {
    try {
        const hash = await walletClient.sendTransaction({
            to: "0xcfA132E353cB4E398080B9700609bb008eceB125",
            abi: CFA_FORWARDER_ABI as Abi,
            functionName: "setFlowrate",
            args: [parameters.token, parameters.receiver, parameters.flowrate],
=======
import { formatUnits, parseUnits } from "viem";
import type { z } from "zod";
import { CFA_FORWARDER_ABI } from "./abi";
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
    parameters: z.infer<typeof getBalanceParametersSchema>
): Promise<string> {
    try {
        const resolvedWalletAddress = await walletClient.resolveAddress(
            parameters.wallet
        );

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
    parameters: z.infer<typeof transferParametersSchema>
): Promise<string> {
    try {
        const amountInBaseUnits = parseUnits(parameters.amount, token.decimals);

        const resolvedRecipientAddress = await walletClient.resolveAddress(
            parameters.to
        );

        const hash = await walletClient.sendTransaction({
            to: token.contractAddress,
            abi: ERC20_ABI,
            functionName: "transfer",
            args: [resolvedRecipientAddress, amountInBaseUnits],
>>>>>>> 906163d (start superfluid plugin)
        });

        return hash.hash;
    } catch (error) {
        throw Error(`Failed to transfer: ${error}`);
    }
}

<<<<<<< HEAD
export async function getFlowrate(
    walletClient: EVMWalletClient,
    parameters: z.infer<typeof getFlowrateParametersSchema>
): Promise<string> {
    const result = await walletClient.read({
        address: "0xcfA132E353cB4E398080B9700609bb008eceB125",
        abi: CFA_FORWARDER_ABI as Abi,
        functionName: "getFlowrate",
        args: [parameters.token, parameters.sender, parameters.receiver],
    });
    return result.value.toString();
}

export async function updateMemberUnits(
    walletClient: EVMWalletClient,
    parameters: z.infer<typeof updateMemberUnitsParametersSchema>
): Promise<string> {
    try {
        const hash = await walletClient.sendTransaction({
            to: parameters.poolAddress,
            abi: POOL_ABI as Abi,
            functionName: "updateMemberUnits",
            args: [parameters.memberAddr, BigInt(parameters.newUnits)],
=======
export async function totalSupply(
    walletClient: EVMWalletClient,
    token: ChainSpecificToken
): Promise<string> {
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
    parameters: z.infer<typeof allowanceParametersSchema>
): Promise<string> {
    try {
        const resolvedOwnerAddress = await walletClient.resolveAddress(
            parameters.owner
        );

        const resolvedSpenderAddress = await walletClient.resolveAddress(
            parameters.spender
        );

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
    parameters: z.infer<typeof approveParametersSchema>
): Promise<string> {
    try {
        const resolvedSpenderAddress = await walletClient.resolveAddress(
            parameters.spender
        );

        const amountInBaseUnits = parseUnits(parameters.amount, token.decimals);

        const hash = await walletClient.sendTransaction({
            to: token.contractAddress,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [resolvedSpenderAddress, amountInBaseUnits],
>>>>>>> 906163d (start superfluid plugin)
        });

        return hash.hash;
    } catch (error) {
<<<<<<< HEAD
        throw Error(`Failed to update member units: ${error}`);
    }
}

export async function getUnits(
    walletClient: EVMWalletClient,
    parameters: z.infer<typeof getUnitsParametersSchema>
): Promise<string> {
    const result = await walletClient.read({
        address: parameters.poolAddress,
        abi: POOL_ABI as Abi,
        functionName: "getUnits",
        args: [parameters.memberAddr],
    });
    return result.value.toString();
}

export async function getMemberFlowRate(
    walletClient: EVMWalletClient,
    parameters: z.infer<typeof getMemberFlowRateParametersSchema>
): Promise<string> {
    const result = await walletClient.read({
        address: parameters.poolAddress,
        abi: POOL_ABI as Abi,
        functionName: "getMemberFlowRate",
        args: [parameters.memberAddr],
    });
    return result.value.toString();
}

export async function getTotalFlowRate(
    walletClient: EVMWalletClient,
    parameters: z.infer<typeof getTotalFlowRateParametersSchema>
): Promise<string> {
    const result = await walletClient.read({
        address: parameters.poolAddress,
        abi: POOL_ABI as Abi,
        functionName: "getTotalFlowRate",
        args: [],
    });
    return result.value.toString();
=======
        throw Error(`Failed to approve: ${error}`);
    }
}

export async function transferFrom(
    walletClient: EVMWalletClient,
    token: ChainSpecificToken,
    parameters: z.infer<typeof transferFromParametersSchema>
): Promise<string> {
    try {
        const resolvedFromAddress = await walletClient.resolveAddress(
            parameters.from
        );

        const resolvedToAddress = await walletClient.resolveAddress(
            parameters.to
        );

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
>>>>>>> 906163d (start superfluid plugin)
}
