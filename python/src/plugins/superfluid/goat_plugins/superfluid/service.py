from goat.decorators.tool import Tool
from goat_wallets.evm import EVMWalletClient
from .abi import CFA_FORWARDER_ABI, POOL_ABI
from .parameters import (
    FlowParameters,
    GetFlowrateParameters,
    UpdateMemberUnitsParameters,
    GetUnitsParameters,
    GetMemberFlowRateParameters,
    GetTotalFlowRateParameters,
)


class SuperfluidService:
    CFA_FORWARDER_ADDRESS = "0xcfA132E353cB4E398080B9700609bb008eceB125"

    @Tool(
        {
            "name": "create_or_update_or_delete_flow",
            "description": "Create, update, or delete a flow of tokens from sender to receiver",
            "parameters_schema": FlowParameters,
        }
    )
    def flow(self, wallet_client: EVMWalletClient, parameters: dict) -> str:
        try:
            result = wallet_client.send_transaction(
                {
                    "to": self.CFA_FORWARDER_ADDRESS,
                    "abi": CFA_FORWARDER_ABI,
                    "functionName": "setFlowrate",
                    "args": [parameters["token"], parameters["receiver"], parameters["flowrate"]],
                }
            )
            return result["hash"]
        except Exception as error:
            raise Exception(f"Failed to set flow: {error}")

    @Tool(
        {
            "name": "get_flow_rate",
            "description": "Get the current flowrate between a sender and receiver for a specific token",
            "parameters_schema": GetFlowrateParameters,
        }
    )
    def get_flowrate(self, wallet_client: EVMWalletClient, parameters: dict):
        result = wallet_client.read(
            {
                "address": self.CFA_FORWARDER_ADDRESS,
                "abi": CFA_FORWARDER_ABI,
                "functionName": "getFlowrate",
                "args": [parameters["token"], parameters["sender"], parameters["receiver"]],
            }
        )
        return result["value"]

    @Tool(
        {
            "name": "update_member_units",
            "description": "Update the units for a member in a Superfluid Pool",
            "parameters_schema": UpdateMemberUnitsParameters,
        }
    )
    def update_member_units(self, wallet_client: EVMWalletClient, parameters: dict):
        try:
            hash_result = wallet_client.send_transaction(
                {
                    "to": parameters["poolAddress"],
                    "abi": POOL_ABI,
                    "functionName": "updateMemberUnits",
                    "args": [parameters["memberAddr"], parameters["newUnits"]],
                }
            )
            return hash_result["hash"]
        except Exception as error:
            raise Exception(f"Failed to update member units: {error}")

    @Tool(
        {
            "name": "get_member_units",
            "description": "Get the units of a member in a Superfluid Pool",
            "parameters_schema": GetUnitsParameters,
        }
    )
    def get_units(self, wallet_client: EVMWalletClient, parameters: dict):
        result = wallet_client.read(
            {
                "address": parameters["poolAddress"],
                "abi": POOL_ABI,
                "functionName": "getUnits",
                "args": [parameters["memberAddr"]],
            }
        )
        return result["value"]

    @Tool(
        {
            "name": "get_member_flow_rate",
            "description": "Get the flow rate of a member in a Superfluid Pool",
            "parameters_schema": GetMemberFlowRateParameters,
        }
    )
    def get_member_flow_rate(self, wallet_client: EVMWalletClient, parameters: dict):
        result = wallet_client.read(
            {
                "address": parameters["poolAddress"],
                "abi": POOL_ABI,
                "functionName": "getMemberFlowRate",
                "args": [parameters["memberAddr"]],
            }
        )
        return result["value"]

    @Tool(
        {
            "name": "get_total_flow_rate",
            "description": "Get the total flow rate of a Superfluid Pool",
            "parameters_schema": GetTotalFlowRateParameters,
        }
    )
    def get_total_flow_rate(self, wallet_client: EVMWalletClient, parameters: dict):
        result = wallet_client.read(
            {
                "address": parameters["poolAddress"],
                "abi": POOL_ABI,
                "functionName": "getTotalFlowRate",
                "args": [],
            }
        )
        return result["value"]
