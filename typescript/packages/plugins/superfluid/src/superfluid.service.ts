import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { CFA_FORWARDER_ABI, POOL_ABI } from "./abi";
import {
    FlowParameters,
    GetFlowrateParameters,
    GetMemberFlowRateParameters,
    GetTotalFlowRateParameters,
    GetUnitsParameters,
    UpdateMemberUnitsParameters,
} from "./parameters";

export class SuperfluidService {
    private readonly CFA_FORWARDER_ADDRESS = "0xcfA132E353cB4E398080B9700609bb008eceB125";

    @Tool({
        name: "create_or_update_or_delete_flow",
        description: "Create, update, or delete a flow of tokens from sender to receiver",
    })
    async flow(walletClient: EVMWalletClient, parameters: FlowParameters) {
        try {
            const hash = await walletClient.sendTransaction({
                to: this.CFA_FORWARDER_ADDRESS,
                abi: CFA_FORWARDER_ABI,
                functionName: "setFlowrate",
                args: [parameters.token, parameters.receiver, parameters.flowrate],
            });
            return hash.hash;
        } catch (error) {
            throw Error(`Failed to set flow: ${error}`);
        }
    }

    @Tool({
        name: "get_flow_rate",
        description: "Get the current flowrate between a sender and receiver for a specific token",
    })
    async getFlowrate(walletClient: EVMWalletClient, parameters: GetFlowrateParameters) {
        const result = await walletClient.read({
            address: this.CFA_FORWARDER_ADDRESS,
            abi: CFA_FORWARDER_ABI,
            functionName: "getFlowrate",
            args: [parameters.token, parameters.sender, parameters.receiver],
        });
        return result.value;
    }

    @Tool({
        name: "update_member_units",
        description: "Update the units for a member in a Superfluid Pool",
    })
    async updateMemberUnits(walletClient: EVMWalletClient, parameters: UpdateMemberUnitsParameters) {
        try {
            const hash = await walletClient.sendTransaction({
                to: parameters.poolAddress,
                abi: POOL_ABI,
                functionName: "updateMemberUnits",
                args: [parameters.memberAddr, parameters.newUnits],
            });
            return hash.hash;
        } catch (error) {
            throw Error(`Failed to update member units: ${error}`);
        }
    }

    @Tool({
        name: "get_member_units",
        description: "Get the units of a member in a Superfluid Pool",
    })
    async getUnits(walletClient: EVMWalletClient, parameters: GetUnitsParameters) {
        const result = await walletClient.read({
            address: parameters.poolAddress,
            abi: POOL_ABI,
            functionName: "getUnits",
            args: [parameters.memberAddr],
        });
        return result.value;
    }

    @Tool({
        name: "get_member_flow_rate",
        description: "Get the flow rate of a member in a Superfluid Pool",
    })
    async getMemberFlowRate(walletClient: EVMWalletClient, parameters: GetMemberFlowRateParameters) {
        const result = await walletClient.read({
            address: parameters.poolAddress,
            abi: POOL_ABI,
            functionName: "getMemberFlowRate",
            args: [parameters.memberAddr],
        });
        return result.value;
    }

    @Tool({
        name: "get_total_flow_rate",
        description: "Get the total flow rate of a Superfluid Pool",
    })
    async getTotalFlowRate(walletClient: EVMWalletClient, parameters: GetTotalFlowRateParameters) {
        const result = await walletClient.read({
            address: parameters.poolAddress,
            abi: POOL_ABI,
            functionName: "getTotalFlowRate",
            args: [],
        });
        return result.value;
    }
}
