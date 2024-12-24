from typing import List

from goat_sdk.core.evm.methods import get_address, get_balance
from goat_sdk.core.evm.parameters import GetAddressParametersSchema, GetETHBalanceParametersSchema
from goat_sdk.core.tools import DeferredTool
from goat_sdk.core.wallets import EVMWalletClient


deferredEVMCoreTools: List[DeferredTool[EVMWalletClient]] = [
    DeferredTool[EVMWalletClient](
        **dict(
            {
                "name": "get_address",
                "description": "This {{tool}} returns the address of the EVM wallet.",
                "parameters": GetAddressParametersSchema,
                "method": get_address,
            }
        )
    ),
    DeferredTool[EVMWalletClient](
        **dict(
            {
                "name": "get_eth_balance",
                "description": "This {{tool}} returns the ETH balance of an EVM wallet.",
                "parameters": GetETHBalanceParametersSchema,
                "method": get_balance,
            }
        )
    ),
]
