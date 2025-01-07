from goat.decorators.tool import Tool
from .parameters import (
    GetTokenInfoBySymbolParameters,
    GetTokenBalanceParameters,
    TransferParameters,
    GetTokenTotalSupplyParameters,
    GetTokenAllowanceParameters,
    ApproveParameters,
    TransferFromParameters,
    ConvertToBaseUnitParameters,
    ConvertFromBaseUnitParameters,
)
from .token import Token
from .abi import ERC20_ABI
from goat_wallets.evm import EVMWalletClient


class Erc20Service:
    def __init__(self, tokens: list[Token] = []):
        self.tokens = tokens

    @Tool(
        {
            "description": "Get the ERC20 token info by its symbol, including the contract address, decimals, and name",
            "parameters_schema": GetTokenInfoBySymbolParameters,
        }
    )
    def get_token_info_by_symbol(
        self, wallet_client: EVMWalletClient, parameters: dict
    ):
        token = next(
            (
                t
                for t in self.tokens
                if parameters["symbol"] in [t["symbol"], t["symbol"].lower()]
            ),
            None,
        )

        if not token:
            raise Exception(f"Token with symbol {parameters['symbol']} not found")

        chain = wallet_client.get_chain()
        chain_info = token["chains"].get(chain["id"])

        if not chain_info or not chain_info.get("contractAddress"):
            raise Exception(
                f"Token with symbol {parameters['symbol']} not found on chain {chain['id']}"
            )

        return {
            "symbol": token["symbol"],
            "contractAddress": chain_info["contractAddress"],
            "decimals": token["decimals"],
            "name": token["name"],
        }

    @Tool(
        {
            "description": "Get the balance of an ERC20 token in base units. Convert to decimal units before returning.",
            "parameters_schema": GetTokenBalanceParameters,
        }
    )
    def get_token_balance(self, wallet_client: EVMWalletClient, parameters: dict):
        try:
            resolved_wallet_address = wallet_client.resolve_address(
                parameters["wallet"]
            )

            raw_balance = wallet_client.read(
                {
                    "address": parameters["tokenAddress"],
                    "abi": ERC20_ABI,
                    "functionName": "balanceOf",
                    "args": [resolved_wallet_address],
                }
            )

            return int(raw_balance["value"])
        except Exception as error:
            raise Exception(f"Failed to fetch balance: {error}")

    @Tool(
        {
            "description": "Transfer an amount of an ERC20 token to an address",
            "parameters_schema": TransferParameters,
        }
    )
    def transfer(self, wallet_client: EVMWalletClient, parameters: dict):
        try:
            to_address = wallet_client.resolve_address(parameters["to"])

            hash_result = wallet_client.send_transaction(
                {
                    "to": parameters["tokenAddress"],
                    "abi": ERC20_ABI,
                    "functionName": "transfer",
                    "args": [to_address, parameters["amount"]],
                }
            )
            return hash_result["hash"]
        except Exception as error:
            raise Exception(f"Failed to transfer: {error}")

    @Tool(
        {
            "description": "Get the total supply of an ERC20 token",
            "parameters_schema": GetTokenTotalSupplyParameters,
        }
    )
    def get_token_total_supply(
        self, wallet_client: EVMWalletClient, parameters: dict
    ):
        try:
            raw_total_supply = wallet_client.read(
                {
                    "address": parameters["tokenAddress"],
                    "abi": ERC20_ABI,
                    "functionName": "totalSupply",
                }
            )

            return raw_total_supply["value"]
        except Exception as error:
            raise Exception(f"Failed to fetch total supply: {error}")

    @Tool(
        {
            "description": "Get the allowance of an ERC20 token",
            "parameters_schema": GetTokenAllowanceParameters,
        }
    )
    def get_token_allowance(self, wallet_client: EVMWalletClient, parameters: dict):
        try:
            owner = wallet_client.resolve_address(parameters["owner"])
            spender = wallet_client.resolve_address(parameters["spender"])

            raw_allowance = wallet_client.read(
                {
                    "address": parameters["tokenAddress"],
                    "abi": ERC20_ABI,
                    "functionName": "allowance",
                    "args": [owner, spender],
                }
            )
            return int(raw_allowance["value"])
        except Exception as error:
            raise Exception(f"Failed to fetch allowance: {error}")

    @Tool(
        {
            "description": "Approve an amount of an ERC20 token to an address",
            "parameters_schema": ApproveParameters,
        }
    )
    def approve(self, wallet_client: EVMWalletClient, parameters: dict):
        try:
            spender = wallet_client.resolve_address(parameters["spender"])

            hash_result = wallet_client.send_transaction(
                {
                    "to": parameters["tokenAddress"],
                    "abi": ERC20_ABI,
                    "functionName": "approve",
                    "args": [spender, parameters["amount"]],
                }
            )
            return hash_result["hash"]
        except Exception as error:
            raise Exception(f"Failed to approve: {error}")

    @Tool(
        {
            "description": "Transfer an amount of an ERC20 token from an address to another address",
            "parameters_schema": TransferFromParameters,
        }
    )
    def transfer_from(self, wallet_client: EVMWalletClient, parameters: dict):
        try:
            from_address = wallet_client.resolve_address(parameters["from"])
            to_address = wallet_client.resolve_address(parameters["to"])

            hash_result = wallet_client.send_transaction(
                {
                    "to": parameters["tokenAddress"],
                    "abi": ERC20_ABI,
                    "functionName": "transferFrom",
                    "args": [from_address, to_address, parameters["amount"]],
                }
            )
            return hash_result["hash"]
        except Exception as error:
            raise Exception(f"Failed to transfer from: {error}")

    @Tool(
        {
            "description": "Convert an amount of an ERC20 token to its base unit",
            "parameters_schema": ConvertToBaseUnitParameters,
        }
    )
    def convert_to_base_unit(self, parameters: dict):
        amount = parameters["amount"]
        decimals = parameters["decimals"]
        base_unit = amount * 10**decimals
        return int(base_unit)

    @Tool(
        {
            "description": "Convert an amount of an ERC20 token from its base unit to its decimal unit",
            "parameters_schema": ConvertFromBaseUnitParameters,
        }
    )
    def convert_from_base_unit(self, parameters: dict):
        amount = parameters["amount"]
        decimals = parameters["decimals"]
        decimal_unit = amount / 10**decimals
        return float(decimal_unit)
