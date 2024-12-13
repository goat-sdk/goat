import type { EVMWalletClient } from "@goat-sdk/core";
<<<<<<< HEAD
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
=======
>>>>>>> 4e5c6e8 (add first commits)
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
<<<<<<< HEAD
            to: token.contractAddress,
            abi: ERC20_ABI,
            functionName: "transfer",
            args: [resolvedRecipientAddress, amountInBaseUnits],
>>>>>>> 906163d (start superfluid plugin)
=======
            to: "0xcfA132E353cB4E398080B9700609bb008eceB125",
            abi: CFA_FORWARDER_ABI as Abi,
            functionName: "setFlowrate",
            args: [parameters.token, parameters.receiver, parameters.flowrate],
>>>>>>> 4e5c6e8 (add first commits)
        });

        return hash.hash;
    } catch (error) {
        throw Error(`Failed to transfer: ${error}`);
    }
}

<<<<<<< HEAD
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
=======
export async function getFlowrate(
>>>>>>> 4e5c6e8 (add first commits)
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
<<<<<<< HEAD
            to: token.contractAddress,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [resolvedSpenderAddress, amountInBaseUnits],
>>>>>>> 906163d (start superfluid plugin)
=======
            to: parameters.poolAddress,
            abi: POOL_ABI as Abi,
            functionName: "updateMemberUnits",
            args: [parameters.memberAddr, BigInt(parameters.newUnits)],
>>>>>>> 4e5c6e8 (add first commits)
        });

        return hash.hash;
    } catch (error) {
<<<<<<< HEAD
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
=======
        throw Error(`Failed to update member units: ${error}`);
>>>>>>> 4e5c6e8 (add first commits)
    }
}

export async function getUnits(
    walletClient: EVMWalletClient,
    parameters: z.infer<typeof getUnitsParametersSchema>
): Promise<string> {
<<<<<<< HEAD
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
=======
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
>>>>>>> 4e5c6e8 (add first commits)
}
