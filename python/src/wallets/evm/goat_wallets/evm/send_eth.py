from decimal import Decimal
from typing import Dict, List, cast

from pydantic import BaseModel, Field
from evmchains.chains import PUBLIC_CHAIN_META

from goat.classes.plugin_base import PluginBase
from goat.classes.tool_base import ToolBase, create_tool
from goat.types.chain import Chain

from .evm_smart_wallet_client import EVMWalletClient


class SendETHParameters(BaseModel):
    to: str = Field(description="The address to send ETH to")
    amount: str = Field(description="The amount of ETH to send")


class SendETHPlugin(PluginBase[EVMWalletClient]):
    def __init__(self):
        super().__init__("sendETH", [])

    def supports_chain(self, chain: Chain) -> bool:
        return chain["type"] == "evm"

    def get_tools(self, wallet_client: EVMWalletClient) -> List[ToolBase]:
        chain_token = get_chain_token(wallet_client.get_chain()["id"])
        send_tool = create_tool(
            config={
                "name": f"send_{chain_token['symbol']}",
                "description": f"Send {chain_token['symbol']} to an address.",
                "parameters": SendETHParameters,
            },
            execute_fn=lambda params: send_eth_method(
                wallet_client, cast(Dict[str, str], params)
            ),
        )
        return [send_tool]


def send_eth() -> SendETHPlugin:
    return SendETHPlugin()


def send_eth_method(wallet_client: EVMWalletClient, parameters: Dict[str, str]) -> str:
    try:
        # Convert amount to Wei (1 ETH = 10^18 Wei)
        amount = int(Decimal(parameters["amount"]) * Decimal("1e18"))
        tx = wallet_client.send_transaction(
            {
                "to": parameters["to"],
                "value": amount,
            }
        )
        return tx["hash"]
    except Exception as error:
        chain_token = get_chain_token(wallet_client.get_chain()["id"])
        raise Exception(f"Failed to send {chain_token['symbol']}: {str(error)}")


def get_chain_token(chain_id: int) -> Dict[str, str | int]:
    # Get chain info from evmchains library
    for chain_networks in PUBLIC_CHAIN_META.values():
        for network_info in chain_networks.values():
            if network_info["chainId"] == chain_id:
                native_currency = network_info["nativeCurrency"]
                return {
                    "symbol": native_currency["symbol"],
                    "name": native_currency["name"],
                    "decimals": native_currency["decimals"],
                }
    raise Exception(f"Unsupported EVM chain ID: {chain_id}")
