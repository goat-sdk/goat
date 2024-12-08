<<<<<<< HEAD
import {
    flow,
    getFlowrate,
    updateMemberUnits,
    getUnits,
    getMemberFlowRate,
    getTotalFlowRate,
} from "./methods";
import {
    flowParametersSchema,
    getFlowrateParametersSchema,
    updateMemberUnitsParametersSchema,
    getUnitsParametersSchema,
    getMemberFlowRateParametersSchema,
    getTotalFlowRateParametersSchema,
} from "./parameters";
import type { DeferredTool, EVMWalletClient } from "@goat-sdk/core";
import type { z } from "zod";

export function getTools(): DeferredTool<EVMWalletClient>[] {
    const tools: DeferredTool<EVMWalletClient>[] = [];
    const flowTool: DeferredTool<EVMWalletClient> = {
        name: `start_flow_to_a_receiver`,
        description: `This {{tool}} starts a flow of tokens to a receiver`,
        parameters: flowParametersSchema,
        method: (
            walletClient: EVMWalletClient,
            parameters: z.infer<typeof flowParametersSchema>
        ) => flow(walletClient, parameters),
    };

    const getFlowrateTool: DeferredTool<EVMWalletClient> = {
        name: `get_flowrate`,
        description: `This {{tool}} gets the flowrate of a flow from a specific sender to a specific receiver`,
        parameters: getFlowrateParametersSchema,
        method: (
            walletClient: EVMWalletClient,
            parameters: z.infer<typeof getFlowrateParametersSchema>
        ) => getFlowrate(walletClient, parameters),
    };

    const updateMemberUnitsTool: DeferredTool<EVMWalletClient> = {
        name: `update_member_units`,
        description: `This {{tool}} updates the units of a member in a Superfluid Pool`,
        parameters: updateMemberUnitsParametersSchema,
        method: (
            walletClient: EVMWalletClient,
            parameters: z.infer<typeof updateMemberUnitsParametersSchema>
        ) => updateMemberUnits(walletClient, parameters),
    };

    const getUnitsTool: DeferredTool<EVMWalletClient> = {
        name: `get_member_units`,
        description: `This {{tool}} gets the units of a member in a Superfluid Pool`,
        parameters: getUnitsParametersSchema,
        method: (
            walletClient: EVMWalletClient,
            parameters: z.infer<typeof getUnitsParametersSchema>
        ) => getUnits(walletClient, parameters),
    };

    const getMemberFlowRateTool: DeferredTool<EVMWalletClient> = {
        name: `get_member_flow_rate`,
        description: `This {{tool}} gets the flow rate of a member in a Superfluid Pool`,
        parameters: getMemberFlowRateParametersSchema,
        method: (
            walletClient: EVMWalletClient,
            parameters: z.infer<typeof getMemberFlowRateParametersSchema>
        ) => getMemberFlowRate(walletClient, parameters),
    };

    const getTotalFlowRateTool: DeferredTool<EVMWalletClient> = {
        name: `get_total_flow_rate`,
        description: `This {{tool}} gets the total flow rate of a Superfluid Pool`,
        parameters: getTotalFlowRateParametersSchema,
        method: (
            walletClient: EVMWalletClient,
            parameters: z.infer<typeof getTotalFlowRateParametersSchema>
        ) => getTotalFlowRate(walletClient, parameters),
    };

    tools.push(
        flowTool,
        getFlowrateTool,
        updateMemberUnitsTool,
        getUnitsTool,
        getMemberFlowRateTool,
        getTotalFlowRateTool
    );
=======
import { allowance, approve, balanceOf, totalSupply, transfer, transferFrom } from "./methods";
import {
    allowanceParametersSchema,
    approveParametersSchema,
    getBalanceParametersSchema,
    totalSupplyParametersSchema,
    transferFromParametersSchema,
    transferParametersSchema,
} from "./parameters";

import type { DeferredTool, EVMWalletClient } from "@goat-sdk/core";
import type { z } from "zod";
import type { ChainSpecificToken } from "./token";

export function getTools(tokenList: ChainSpecificToken[]): DeferredTool<EVMWalletClient>[] {
    const tools: DeferredTool<EVMWalletClient>[] = [];

    for (const token of tokenList) {
        const balanceTool: DeferredTool<EVMWalletClient> = {
            name: `get_${token.symbol}_balance`,
            description: `This {{tool}} gets the balance of ${token.symbol}`,
            parameters: getBalanceParametersSchema,
            method: (walletClient: EVMWalletClient, parameters: z.infer<typeof getBalanceParametersSchema>) =>
                balanceOf(walletClient, token, parameters),
        };

        const transferTool: DeferredTool<EVMWalletClient> = {
            name: `transfer_${token.symbol}`,
            description: `This {{tool}} transfers ${token.symbol} to the specified address`,
            parameters: transferParametersSchema,
            method: (walletClient: EVMWalletClient, parameters: z.infer<typeof transferParametersSchema>) =>
                transfer(walletClient, token, parameters),
        };

        const totalSupplyTool: DeferredTool<EVMWalletClient> = {
            name: `get_${token.symbol}_total_supply`,
            description: `This {{tool}} gets the total supply of ${token.symbol}`,
            parameters: totalSupplyParametersSchema,
            method: (walletClient: EVMWalletClient, parameters: z.infer<typeof totalSupplyParametersSchema>) =>
                totalSupply(walletClient, token),
        };

        const allowanceTool: DeferredTool<EVMWalletClient> = {
            name: `get_${token.symbol}_allowance`,
            description: `This {{tool}} gets the allowance of ${token.symbol}`,
            parameters: allowanceParametersSchema,
            method: (walletClient: EVMWalletClient, parameters: z.infer<typeof allowanceParametersSchema>) =>
                allowance(walletClient, token, parameters),
        };

        const approveTool: DeferredTool<EVMWalletClient> = {
            name: `approve_${token.symbol}`,
            description: `This {{tool}} approves the allowance of ${token.symbol}`,
            parameters: approveParametersSchema,
            method: (walletClient: EVMWalletClient, parameters: z.infer<typeof approveParametersSchema>) =>
                approve(walletClient, token, parameters),
        };

        const transferFromTool: DeferredTool<EVMWalletClient> = {
            name: `transfer_${token.symbol}_from`,
            description: `This {{tool}} transfers ${token.symbol} from the specified address`,
            parameters: transferFromParametersSchema,
            method: (walletClient: EVMWalletClient, parameters: z.infer<typeof transferFromParametersSchema>) =>
                transferFrom(walletClient, token, parameters),
        };

        tools.push(balanceTool, transferTool, totalSupplyTool, allowanceTool, approveTool, transferFromTool);
    }

>>>>>>> 906163d (start superfluid plugin)
    return tools;
}
