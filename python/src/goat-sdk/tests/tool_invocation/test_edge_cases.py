import pytest
from unittest.mock import MagicMock
from pydantic import BaseModel, Field, ValidationError
from goat.decorators.tool import Tool
from goat.utils.get_tools import get_tools
from .mock_utils import MockWalletClient, create_tool_execution_spy
from .test_utils import create_mock_plugin

class TransferParameters(BaseModel):
    to: str = Field(description="Recipient address")
    amount: float = Field(description="Amount to transfer", gt=0)

class SwapParameters(BaseModel):
    inputMint: str = Field(description="The token address to swap from")
    outputMint: str = Field(description="The token address to swap to")
    amount: float = Field(description="Amount to swap")

class MintParameters(BaseModel):
    name: str = Field(description="Token name")
    supply: int = Field(description="Token supply")
    decimals: int = Field(description="Token decimals", ge=0, le=9)

class TransferService:
    def __init__(self):
        self.transfer_spy = create_tool_execution_spy()
        
    @Tool({
        "description": "Transfer tokens to an address",
        "parameters_schema": TransferParameters
    })
    async def transfer(self, wallet_client: MockWalletClient, parameters: dict):
        return self.transfer_spy(wallet_client, parameters)

class SwapService:
    def __init__(self):
        self.swap_spy = create_tool_execution_spy()
        
    @Tool({
        "description": "Swap one token for another",
        "parameters_schema": SwapParameters
    })
    async def swap(self, wallet_client: MockWalletClient, parameters: dict):
        return self.swap_spy(wallet_client, parameters)

class MintService:
    def __init__(self):
        self.mint_token_spy = create_tool_execution_spy()
        
    @Tool({
        "description": "Mint a new token",
        "parameters_schema": MintParameters
    })
    async def mint_token(self, wallet_client: MockWalletClient, parameters: dict):
        return self.mint_token_spy(wallet_client, parameters)

@pytest.mark.asyncio
async def test_parameter_validation():
    # Set up
    wallet = MockWalletClient()
    transfer_service = TransferService()
    transfer_service.transfer_spy.return_value = {"hash": "0xtx123"}
    
    plugin = create_mock_plugin("transfer", transfer_service)
    tools = get_tools(wallet=wallet, plugins=[plugin])
    
    # Find transfer tool
    transfer_tool = next((t for t in tools if t.name == "transfer"), None)
    assert transfer_tool is not None
    
    # Execute the tool with invalid parameters (negative amount)
    with pytest.raises(ValidationError):
        transfer_tool.execute({"to": "0xabc", "amount": -10})
    
    # Verify the tool was not called
    transfer_service.transfer_spy.assert_not_called()

@pytest.mark.asyncio
async def test_missing_required_parameters():
    # Set up
    wallet = MockWalletClient()
    swap_service = SwapService()
    swap_service.swap_spy.return_value = {"hash": "0xtx456"}
    
    plugin = create_mock_plugin("swap", swap_service)
    tools = get_tools(wallet=wallet, plugins=[plugin])
    
    # Find swap tool
    swap_tool = next((t for t in tools if t.name == "swap"), None)
    assert swap_tool is not None
    
    # Execute the tool with missing required parameter (outputMint)
    with pytest.raises(ValidationError):
        swap_tool.execute({"inputMint": "USDC", "amount": 5})
    
    # Verify the tool was not called
    swap_service.swap_spy.assert_not_called()

@pytest.mark.asyncio
async def test_parameter_type_validation():
    # Set up
    wallet = MockWalletClient()
    mint_service = MintService()
    mint_service.mint_token_spy.return_value = {"tokenAddress": "0xtoken123"}
    
    plugin = create_mock_plugin("mint", mint_service)
    tools = get_tools(wallet=wallet, plugins=[plugin])
    
    # Find mint tool
    mint_tool = next((t for t in tools if t.name == "mint_token"), None)
    assert mint_tool is not None
    
    # Test with decimals out of range
    with pytest.raises(ValidationError):
        mint_tool.execute({"name": "Test Token", "supply": 1000000, "decimals": 10})
    
    # Test with non-integer supply
    with pytest.raises(ValidationError):
        mint_tool.execute({"name": "Test Token", "supply": 1000.5, "decimals": 6})
    
    # Verify the tool was not called
    mint_service.mint_token_spy.assert_not_called()
