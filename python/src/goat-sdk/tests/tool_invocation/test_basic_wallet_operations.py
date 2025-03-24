import pytest
from unittest.mock import MagicMock
from pydantic import BaseModel, Field
from goat.decorators.tool import Tool
from goat.utils.get_tools import get_tools
from .mock_utils import MockWalletClient, create_tool_execution_spy
from .test_utils import create_mock_plugin

class BalanceParameters(BaseModel):
    address: str = Field(description="Wallet address to check")

class TransferParameters(BaseModel):
    to: str = Field(description="Recipient address")
    amount: str = Field(description="Amount to transfer")

class BalanceService:
    def __init__(self):
        self.check_balance_spy = create_tool_execution_spy()
        
    @Tool({
        "description": "Check the balance of a wallet",
        "parameters_schema": BalanceParameters
    })
    async def check_balance(self, parameters: dict):
        return self.check_balance_spy(parameters)

class TransferService:
    def __init__(self):
        self.transfer_spy = create_tool_execution_spy()
        
    @Tool({
        "description": "Transfer tokens to an address",
        "parameters_schema": TransferParameters
    })
    async def transfer(self, wallet_client: MockWalletClient, parameters: dict):
        return self.transfer_spy(wallet_client, parameters)

@pytest.mark.asyncio
async def test_balance_check():
    # Set up
    wallet = MockWalletClient()
    balance_service = BalanceService()
    balance_service.check_balance_spy.return_value = {"balance": "100", "symbol": "SOL"}
    
    plugin = create_mock_plugin("balance", balance_service)
    tools = get_tools(wallet=wallet, plugins=[plugin])
    
    # Find balance check tool
    balance_tool = next((t for t in tools if t.name == "check_balance"), None)
    assert balance_tool is not None
    
    # Execute the tool
    result = balance_tool.execute({"address": "abc123"})
    
    # Verify
    balance_service.check_balance_spy.assert_called_with({"address": "abc123"})
    assert result == {"balance": "100", "symbol": "SOL"}

@pytest.mark.asyncio
async def test_transfer():
    # Set up
    wallet = MockWalletClient()
    transfer_service = TransferService()
    transfer_service.transfer_spy.return_value = {"hash": "0xtx123"}
    
    plugin = create_mock_plugin("transfer", transfer_service)
    tools = get_tools(wallet=wallet, plugins=[plugin])
    
    # Find transfer tool
    transfer_tool = next((t for t in tools if t.name == "transfer"), None)
    assert transfer_tool is not None
    
    # Execute the tool
    result = transfer_tool.execute({"to": "0xabc", "amount": "1.5"})
    
    # Verify
    transfer_service.transfer_spy.assert_called_with(wallet, {"to": "0xabc", "amount": "1.5"})
    assert result == {"hash": "0xtx123"}
