from goat.decorators.tool import Tool
from goat_wallets.evm import EVMWalletClient
from .abi import CFA_FORWARDER_ABI, POOL_ABI
from goat_plugins.erc20.abi import ERC20_ABI
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
        """Create, update, or delete a flow of tokens."""
        try:
            # Convert flowrate to int96 and validate bounds
            try:
                # Handle special case for flow deletion
                if parameters["flowrate"] == "0":
                    flowrate = 0
                else:
                    # Convert to integer, handling both decimal and hex strings
                    flowrate = int(parameters["flowrate"], 16 if parameters["flowrate"].startswith("0x") else 10)
                    
                    # Validate int96 bounds (-2^95 to 2^95-1)
                    if not (-2**95 <= flowrate <= 2**95 - 1):
                        raise ValueError("Flowrate must be within int96 bounds")
                    
                    # Ensure minimum positive flowrate for creation/updates (1000 wei/second)
                    if flowrate > 0 and flowrate < 1000:
                        raise ValueError("Minimum flowrate must be at least 1000 wei/second")
            except ValueError as e:
                raise Exception(f"Invalid flowrate value: {e}")

            # For non-zero flowrates, approve CFA_FORWARDER_ADDRESS to spend tokens
            if flowrate > 0:
                try:
                    # First check current allowance
                    allowance = wallet_client.read({
                        "address": parameters["token"],
                        "abi": ERC20_ABI,
                        "functionName": "allowance",
                        "args": [wallet_client.get_address(), self.CFA_FORWARDER_ADDRESS],
                    })

                    # Calculate required allowance (30 days worth of flow)
                    required_allowance = flowrate * 60 * 60 * 24 * 30

                    # If allowance is insufficient, approve max uint256
                    if int(allowance["value"]) < required_allowance:
                        approve_result = wallet_client.send_transaction({
                            "to": parameters["token"],
                            "abi": ERC20_ABI,
                            "functionName": "approve",
                            "args": [self.CFA_FORWARDER_ADDRESS, 2**256 - 1],  # Max uint256
                        })
                        # Wait for approval transaction to be mined
                        if not approve_result.get("hash"):
                            raise Exception("Approval transaction failed")
                except Exception as e:
                    raise Exception(f"Failed to approve token spending: {e}")

            # Create/update/delete flow with resolved addresses
            token = wallet_client.resolve_address(parameters["token"])
            receiver = wallet_client.resolve_address(parameters["receiver"])
            result = wallet_client.send_transaction(
                {
                    "to": self.CFA_FORWARDER_ADDRESS,
                    "abi": CFA_FORWARDER_ABI,
                    "functionName": "setFlowrate",
                    "args": [token, receiver, flowrate],
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
