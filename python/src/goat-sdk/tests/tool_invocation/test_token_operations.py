import pytest
from unittest.mock import MagicMock
from pydantic import BaseModel, Field
from goat.decorators.tool import Tool
from goat.utils.get_tools import get_tools
from .mock_utils import MockWalletClient, create_tool_execution_spy
from .test_utils import create_mock_plugin

class SwapParameters(BaseModel):
    inputMint: str = Field(description="The token address to swap from")
    outputMint: str = Field(description="The token address to swap to")
    amount: float = Field(description="Amount to swap")
    slippage: float = Field(None, description="Slippage tolerance")

class TokenTransferParameters(BaseModel):
    tokenAddress: str = Field(description="The token contract address")
    to: str = Field(description="Recipient address")
    amount: float = Field(description="Amount to transfer")

class SwapService:
    def __init__(self):
        self.swap_spy = create_tool_execution_spy()
        
    @Tool({
        "description": "Swap one token for another",
        "parameters_schema": SwapParameters
    })
    async def swap(self, wallet_client: MockWalletClient, parameters: dict):
        return self.swap_spy(wallet_client, parameters)

class TokenTransferService:
    def __init__(self):
        self.transfer_token_spy = create_tool_execution_spy()
        
    @Tool({
        "description": "Transfer tokens to an address",
        "parameters_schema": TokenTransferParameters
    })
    async def transfer_token(self, wallet_client: MockWalletClient, parameters: dict):
        return self.transfer_token_spy(wallet_client, parameters)

@pytest.mark.asyncio
async def test_swap_with_slippage():
    # Set up
    wallet = MockWalletClient()
    swap_service = SwapService()
    swap_service.swap_spy.return_value = {"hash": "0xtx456", "outputAmount": "10"}
    
    plugin = create_mock_plugin("swap", swap_service)
    tools = get_tools(wallet=wallet, plugins=[plugin])
    
    # Find swap tool
    swap_tool = next((t for t in tools if t.name == "swap"), None)
    assert swap_tool is not None
    
    # Execute the tool
    result = swap_tool.execute({
        "inputMint": "USDC", 
        "outputMint": "SOL", 
        "amount": 5,
        "slippage": 1
    })
    
    # Verify
    swap_service.swap_spy.assert_called_with(wallet, {
        "inputMint": "USDC", 
        "outputMint": "SOL", 
        "amount": 5,
        "slippage": 1
    })
    assert result == {"hash": "0xtx456", "outputAmount": "10"}

@pytest.mark.asyncio
async def test_swap_without_slippage():
    # Set up
    wallet = MockWalletClient()
    swap_service = SwapService()
    swap_service.swap_spy.return_value = {"hash": "0xtx456", "outputAmount": "10"}
    
    plugin = create_mock_plugin("swap", swap_service)
    tools = get_tools(wallet=wallet, plugins=[plugin])
    
    # Find swap tool
    swap_tool = next((t for t in tools if t.name == "swap"), None)
    assert swap_tool is not None
    
    # Execute the tool
    result = swap_tool.execute({
        "inputMint": "SOL", 
        "outputMint": "JUP", 
        "amount": 1
    })
    
    # Verify
    swap_service.swap_spy.assert_called_with(wallet, {
        "inputMint": "SOL", 
        "outputMint": "JUP", 
        "amount": 1.0,
        "slippage": None
    })
    assert result == {"hash": "0xtx456", "outputAmount": "10"}

@pytest.mark.asyncio
async def test_token_transfer():
    # Set up
    wallet = MockWalletClient()
    token_transfer_service = TokenTransferService()
    token_transfer_service.transfer_token_spy.return_value = {"hash": "0xtx789"}
    
    plugin = create_mock_plugin("token", token_transfer_service)
    tools = get_tools(wallet=wallet, plugins=[plugin])
    
    # Find token transfer tool
    transfer_tool = next((t for t in tools if t.name == "transfer_token"), None)
    assert transfer_tool is not None
    
    # Execute the tool
    result = transfer_tool.execute({
        "tokenAddress": "0xtoken123", 
        "to": "0xrecipient456", 
        "amount": 10
    })
    
    # Verify
    token_transfer_service.transfer_token_spy.assert_called_with(wallet, {
        "tokenAddress": "0xtoken123", 
        "to": "0xrecipient456", 
        "amount": 10
    })
    assert result == {"hash": "0xtx789"}
