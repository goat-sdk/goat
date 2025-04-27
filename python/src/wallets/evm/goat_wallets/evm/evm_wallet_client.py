from abc import ABC, abstractmethod
from typing import Dict, Optional, TypedDict, List, Any, Tuple, Union
from decimal import Decimal
import re

from goat.classes.wallet_client_base import Balance, Signature, WalletClientBase
from goat.types.chain import EvmChain
from goat.classes.tool_base import ToolBase, create_tool

from .abi import ERC20_ABI
from .tokens import PREDEFINED_TOKENS, Token
from .params import (
    GetBalanceParameters,
    GetTokenInfoByTickerParameters,
    ConvertToBaseUnitsParameters,
    ConvertFromBaseUnitsParameters,
    SendTokenParameters,
    GetTokenAllowanceParameters,
    ApproveParameters,
    RevokeApprovalParameters,
    TransferFromParameters,
    SignTypedDataParameters,
)

class EVMTransaction(TypedDict, total=False):
    """Transaction parameters for EVM transactions."""
    to: str
    value: Optional[int]
    data: Optional[str]
    abi: Optional[List[Dict[str, Any]]]
    functionName: Optional[str]
    args: Optional[List[Any]]
    options: Optional[Dict[str, Any]]

class EVMReadRequest(TypedDict):
    """Read request parameters for EVM contracts."""
    address: str
    abi: List[Dict[str, Any]]
    functionName: str
    args: Optional[List[Any]]

class EVMReadResult(TypedDict):
    """Result of an EVM contract read."""
    value: Any

class EVMTypedData(TypedDict):
    """EIP-712 typed data."""
    types: Dict[str, List[Dict[str, str]]]
    primaryType: str
    domain: Dict[str, Any]
    message: Dict[str, Any]

class EVMOptions:
    """Configuration options for EVM wallet clients."""
    def __init__(self):
        pass

class EVMWalletClient(WalletClientBase, ABC):
    """Base class for EVM wallet implementations."""

    def __init__(self, tokens=None, enable_send=True):
        """Initialize the EVM wallet client.
        
        Args:
            tokens: List of token configurations
            enable_send: Whether to enable send functionality
        """
        super().__init__()
        self.tokens = tokens or PREDEFINED_TOKENS
        self.enable_send = enable_send

    def get_chain(self) -> EvmChain:
        """Get the chain type for EVM."""
        chain_id = self.get_chain_id()
        return {
            "type": "evm",
            "id": chain_id,
            "nativeCurrency": {
                "name": "Ether",  # Default, may be overridden in subclasses
                "symbol": "ETH",  # Default, may be overridden in subclasses
                "decimals": 18    # Default, may be overridden in subclasses
            }
        }

    @abstractmethod
    def get_address(self) -> str:
        """Get the wallet's public address."""
        pass

    @abstractmethod
    def get_chain_id(self) -> int:
        """Get the chain ID."""
        pass

    @abstractmethod
    def sign_message(self, message: str) -> Signature:
        """Sign a message with the wallet's private key."""
        pass

    @abstractmethod
    def sign_typed_data(self, data: EVMTypedData) -> Signature:
        """Sign EIP-712 typed data with the wallet's private key."""
        pass

    @abstractmethod
    def send_transaction(self, transaction: EVMTransaction) -> Dict[str, str]:
        """Send a transaction on the EVM chain."""
        pass

    @abstractmethod
    def read(self, request: EVMReadRequest) -> EVMReadResult:
        """Read data from a smart contract."""
        pass

    @abstractmethod
    def get_native_balance(self) -> int:
        """Get the native balance of the wallet in wei."""
        pass

    async def balance_of(self, params: Union[Dict[str, Any], str], token_address: Optional[str] = None) -> Balance:
        """Get the balance of an address for native or ERC20 tokens.
        
        Args:
            params: Either an address string or a dict with address and optional tokenAddress
            token_address: The token address, if None checks native balance (used when params is a string)
            
        Returns:
            Balance information
        """
        chain = self.get_chain()
        
        if isinstance(params, dict):
            address = params["address"]
            token_address = params.get("tokenAddress")
        else:
            address = params
        
        if token_address:
            try:
                balance_result = self.read({
                    "address": token_address,
                    "abi": ERC20_ABI,
                    "functionName": "balanceOf",
                    "args": [address],
                })
                
                decimals_result = self.read({
                    "address": token_address,
                    "abi": ERC20_ABI,
                    "functionName": "decimals",
                    "args": []
                })
                
                name_result = self.read({
                    "address": token_address,
                    "abi": ERC20_ABI,
                    "functionName": "name",
                    "args": []
                })
                
                symbol_result = self.read({
                    "address": token_address,
                    "abi": ERC20_ABI,
                    "functionName": "symbol",
                    "args": []
                })
                
                balance_in_base_units = str(balance_result["value"])
                token_decimals = int(decimals_result["value"])
                token_name = str(name_result["value"])
                token_symbol = str(symbol_result["value"])
                
                balance_value = str(Decimal(balance_in_base_units) / (10 ** token_decimals))
                
                return {
                    "decimals": token_decimals,
                    "symbol": token_symbol,
                    "name": token_name,
                    "value": balance_value,
                    "in_base_units": balance_in_base_units,
                }
            except Exception as e:
                raise ValueError(f"Failed to fetch token balance: {str(e)}")
        else:
            try:
                balance_in_wei = self.get_native_balance()
                decimals = chain["nativeCurrency"]["decimals"]
                balance_value = str(Decimal(balance_in_wei) / (10 ** decimals))
                
                return {
                    "decimals": decimals,
                    "symbol": chain["nativeCurrency"]["symbol"],
                    "name": chain["nativeCurrency"]["name"],
                    "value": balance_value,
                    "in_base_units": str(balance_in_wei),
                }
            except Exception as e:
                raise ValueError(f"Failed to fetch native balance: {str(e)}")

    async def get_token_info_by_ticker(self, ticker: str) -> Dict[str, Any]:
        """Get token information by ticker symbol.
        
        Args:
            ticker: The token ticker symbol (e.g., USDC, PEPE)
            
        Returns:
            Token information
        """
        chain = self.get_chain()
        chain_id = chain["id"]
        upper_ticker = ticker.upper()
        
        for token in self.tokens:
            if token["symbol"].upper() == upper_ticker:
                if str(chain_id) in token["chains"]:
                    return {
                        "symbol": token["symbol"],
                        "contractAddress": token["chains"][chain_id]["contractAddress"],
                        "decimals": token["decimals"],
                        "name": token["name"],
                    }
                raise ValueError(f"Token {ticker} not configured for chain {chain_id}")
        
        if upper_ticker == chain["nativeCurrency"]["symbol"].upper():
            return {
                "symbol": chain["nativeCurrency"]["symbol"],
                "contractAddress": "",  # Native currency has no contract
                "decimals": chain["nativeCurrency"]["decimals"],
                "name": chain["nativeCurrency"]["name"],
            }
            
        raise ValueError(f"Token with ticker {ticker} not found")

    async def _get_token_decimals(self, token_address: Optional[str] = None) -> int:
        """Get the decimals for a token.
        
        Args:
            token_address: The token address, or None for native currency
            
        Returns:
            Number of decimals
        """
        if token_address:
            try:
                decimals_result = self.read({
                    "address": token_address,
                    "abi": ERC20_ABI,
                    "functionName": "decimals",
                    "args": []
                })
                return int(decimals_result["value"])
            except Exception as e:
                raise ValueError(f"Failed to fetch token decimals: {str(e)}")
        
        return self.get_chain()["nativeCurrency"]["decimals"]

    async def convert_to_base_units(self, params: Dict[str, Any]) -> str:
        """Convert a token amount to base units.
        
        Args:
            params: Parameters including amount and optional token address
            
        Returns:
            Amount in base units
        """
        amount = params["amount"]
        token_address = params.get("tokenAddress")
        
        try:
            if not re.match(r'^[0-9]*\.?[0-9]+$', amount):
                raise ValueError(f"Invalid amount format: {amount}")
            
            decimals = await self._get_token_decimals(token_address)
            base_units = int(Decimal(amount) * (10 ** decimals))
            return str(base_units)
        except Exception as e:
            raise ValueError(f"Failed to convert to base units: {str(e)}")

    async def convert_from_base_units(self, params: Dict[str, Any]) -> str:
        """Convert a token amount from base units to decimal.
        
        Args:
            params: Parameters including amount and optional token address
            
        Returns:
            Human-readable amount
        """
        amount = params["amount"]
        token_address = params.get("tokenAddress")
        
        try:
            if not re.match(r'^[0-9]+$', amount):
                raise ValueError(f"Invalid base unit amount format: {amount}")
            
            decimals = await self._get_token_decimals(token_address)
            decimal_amount = Decimal(amount) / (10 ** decimals)
            return str(decimal_amount)
        except Exception as e:
            raise ValueError(f"Failed to convert from base units: {str(e)}")

    async def send_token(self, params: Dict[str, Any]) -> Dict[str, str]:
        """Send tokens (native or ERC20).
        
        Args:
            params: Parameters including recipient, amount, and optional token address
            
        Returns:
            Transaction receipt
        """
        if not self.enable_send:
            raise ValueError("Sending tokens is disabled for this wallet")
            
        recipient = params["recipient"]
        amount_in_base_units = params["amountInBaseUnits"]
        token_address = params.get("tokenAddress")
        
        try:
            if token_address:
                return self.send_transaction({
                    "to": token_address,
                    "abi": ERC20_ABI,
                    "functionName": "transfer",
                    "args": [recipient, int(amount_in_base_units)],
                })
            else:
                return self.send_transaction({
                    "to": recipient,
                    "value": int(amount_in_base_units),
                })
        except Exception as e:
            raise ValueError(f"Failed to send token: {str(e)}")

    async def get_token_allowance(self, params: Dict[str, Any]) -> str:
        """Get the allowance of an ERC20 token for a spender.
        
        Args:
            params: Parameters including token address, owner, and spender
            
        Returns:
            Allowance in base units
        """
        token_address = params["tokenAddress"]
        owner = params["owner"]
        spender = params["spender"]
        
        try:
            allowance_result = self.read({
                "address": token_address,
                "abi": ERC20_ABI,
                "functionName": "allowance",
                "args": [owner, spender],
            })
            return str(allowance_result["value"])
        except Exception as e:
            raise ValueError(f"Failed to fetch allowance: {str(e)}")

    async def approve(self, params: Dict[str, Any]) -> Dict[str, str]:
        """Approve a spender to spend ERC20 tokens.
        
        Args:
            params: Parameters including token address, spender, and amount
            
        Returns:
            Transaction receipt
        """
        if not self.enable_send:
            raise ValueError("Approval operations are disabled for this wallet")
            
        token_address = params["tokenAddress"]
        spender = params["spender"]
        amount = params["amount"]
        
        try:
            if not re.match(r'^[0-9]+$', amount):
                raise ValueError(f"Invalid base unit amount format: {amount}")
                
            return self.send_transaction({
                "to": token_address,
                "abi": ERC20_ABI,
                "functionName": "approve",
                "args": [spender, int(amount)],
            })
        except Exception as e:
            raise ValueError(f"Failed to approve: {str(e)}")

    async def revoke_approval(self, params: Dict[str, Any]) -> Dict[str, str]:
        """Revoke approval for an ERC20 token from a spender.
        
        Args:
            params: Parameters including token address and spender
            
        Returns:
            Transaction receipt
        """
        return await self.approve({
            "tokenAddress": params["tokenAddress"],
            "spender": params["spender"],
            "amount": "0",
        })

    async def transfer_from(self, params: Dict[str, Any]) -> Dict[str, str]:
        """Transfer ERC20 tokens from one address to another using allowance.
        
        Args:
            params: Parameters including token address, from, to, and amount
            
        Returns:
            Transaction receipt
        """
        if not self.enable_send:
            raise ValueError("Sending tokens is disabled for this wallet")
            
        token_address = params["tokenAddress"]
        from_address = params["from"]
        to_address = params["to"]
        amount = params["amount"]
        
        try:
            if not re.match(r'^[0-9]+$', amount):
                raise ValueError(f"Invalid base unit amount format: {amount}")
                
            return self.send_transaction({
                "to": token_address,
                "abi": ERC20_ABI,
                "functionName": "transferFrom",
                "args": [from_address, to_address, int(amount)],
            })
        except Exception as e:
            raise ValueError(f"Failed to transfer from: {str(e)}")

    def get_core_tools(self) -> List[ToolBase]:
        """Get the core tools for this wallet client.
        
        Returns:
            List of tool definitions
        """
        import asyncio
        
        def balance_of_sync(params):
            return asyncio.run(self.balance_of(params))
            
        def get_token_info_by_ticker_sync(params):
            return asyncio.run(self.get_token_info_by_ticker(params))
            
        def convert_to_base_units_sync(params):
            return asyncio.run(self.convert_to_base_units(params))
            
        def convert_from_base_units_sync(params):
            return asyncio.run(self.convert_from_base_units(params))
            
        def get_token_allowance_sync(params):
            return asyncio.run(self.get_token_allowance(params))
            
        def send_token_sync(params):
            return asyncio.run(self.send_token(params))
            
        def approve_sync(params):
            return asyncio.run(self.approve(params))
            
        def revoke_approval_sync(params):
            return asyncio.run(self.revoke_approval(params))
            
        def transfer_from_sync(params):
            return asyncio.run(self.transfer_from(params))
        
        base_tools = [tool for tool in super().get_core_tools() 
                      if tool.name != "get_balance"]
        
        common_evm_tools = [
            create_tool(
                {
                    "name": "get_balance",
                    "description": "Get the balance of the wallet for native currency or a specific ERC20 token.",
                    "parameters": GetBalanceParameters
                },
                balance_of_sync
            ),
            create_tool(
                {
                    "name": "get_token_info_by_ticker",
                    "description": "Get information about a token by its ticker symbol.",
                    "parameters": GetTokenInfoByTickerParameters
                },
                get_token_info_by_ticker_sync
            ),
            create_tool(
                {
                    "name": "convert_to_base_units",
                    "description": "Convert a token amount from human-readable units to base units.",
                    "parameters": ConvertToBaseUnitsParameters
                },
                convert_to_base_units_sync
            ),
            create_tool(
                {
                    "name": "convert_from_base_units",
                    "description": "Convert a token amount from base units to human-readable units.",
                    "parameters": ConvertFromBaseUnitsParameters
                },
                convert_from_base_units_sync
            ),
            create_tool(
                {
                    "name": "get_token_allowance_evm",
                    "description": "Get the allowance of an ERC20 token for a spender.",
                    "parameters": GetTokenAllowanceParameters
                },
                get_token_allowance_sync
            ),
            create_tool(
                {
                    "name": "sign_typed_data_evm",
                    "description": "Sign an EIP-712 typed data structure.",
                    "parameters": SignTypedDataParameters
                },
                self.sign_typed_data
            ),
        ]
        
        sending_evm_tools = []
        if self.enable_send:
            sending_evm_tools = [
                create_tool(
                    {
                        "name": "send_token",
                        "description": "Send native currency or an ERC20 token to a recipient.",
                        "parameters": SendTokenParameters
                    },
                    send_token_sync
                ),
                create_tool(
                    {
                        "name": "approve_token_evm",
                        "description": "Approve an amount of an ERC20 token for a spender.",
                        "parameters": ApproveParameters
                    },
                    approve_sync
                ),
                create_tool(
                    {
                        "name": "revoke_token_approval_evm",
                        "description": "Revoke approval for an ERC20 token from a spender.",
                        "parameters": RevokeApprovalParameters
                    },
                    revoke_approval_sync
                ),
                create_tool(
                    {
                        "name": "transfer_token_from_evm",
                        "description": "Transfer an ERC20 token from one address to another using allowance.",
                        "parameters": TransferFromParameters
                    },
                    transfer_from_sync
                ),
            ]
        
        return base_tools + common_evm_tools + sending_evm_tools
