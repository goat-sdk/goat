# Import the evaluation datasets from the erc20 module
from goat_plugins.erc20.eval import (
    ERC20_GET_TOKEN_INFO_BY_SYMBOL_DATASET,
    ERC20_GET_TOKEN_BALANCE_DATASET,
    ERC20_TRANSFER_DATASET,
    ERC20_GET_TOKEN_TOTAL_SUPPLY_DATASET,
    ERC20_GET_TOKEN_ALLOWANCE_DATASET,
    ERC20_APPROVE_DATASET,
    ERC20_TRANSFER_FROM_DATASET,
    ERC20_CONVERT_TO_BASE_UNIT_DATASET,
    ERC20_CONVERT_FROM_BASE_UNIT_DATASET,
    ERC20_ALL_TOOLS_DATASET
)

# Re-export all datasets
__all__ = [
    "ERC20_GET_TOKEN_INFO_BY_SYMBOL_DATASET",
    "ERC20_GET_TOKEN_BALANCE_DATASET",
    "ERC20_TRANSFER_DATASET",
    "ERC20_GET_TOKEN_TOTAL_SUPPLY_DATASET",
    "ERC20_GET_TOKEN_ALLOWANCE_DATASET",
    "ERC20_APPROVE_DATASET",
    "ERC20_TRANSFER_FROM_DATASET",
    "ERC20_CONVERT_TO_BASE_UNIT_DATASET",
    "ERC20_CONVERT_FROM_BASE_UNIT_DATASET",
    "ERC20_ALL_TOOLS_DATASET"
]
