import pytest
from unittest.mock import MagicMock
from pydantic import BaseModel, Field
from goat.decorators.tool import Tool
from goat.utils.get_tools import get_tools
from .mock_utils import MockWalletClient, create_tool_execution_spy
from .test_utils import create_mock_plugin

class SwapParameters(BaseModel):
    inputMint: str = Field(description="The token to swap from")
    outputMint: str = Field(description="The token to swap to")
    amount: float = Field(description="Amount to swap")
    slippageBps: int = Field(None, description="Slippage in basis points")

class TransferParameters(BaseModel):
    to: str = Field(description="Recipient address")
    amount: float = Field(description="Amount to transfer")
    token: str = Field(None, description="Token to transfer (default is SOL)")

class AirdropParameters(BaseModel):
    mint: str = Field(description="Token mint address")
    amount: int = Field(description="Amount to airdrop")
    recipients: list[str] = Field(description="Recipient addresses")
    enable_logs: bool = Field(default=False, description="Enable logs")

class JupiterService:
    def __init__(self):
        self.swap_tokens_spy = create_tool_execution_spy()
        
    @Tool({
        "description": "Swap tokens on Jupiter DEX",
        "parameters_schema": SwapParameters
    })
    async def swap_tokens(self, wallet_client: MockWalletClient, parameters: dict):
        return self.swap_tokens_spy(wallet_client, parameters)

class TransferService:
    def __init__(self):
        self.transfer_spy = create_tool_execution_spy()
        
    @Tool({
        "description": "Transfer tokens to an address",
        "parameters_schema": TransferParameters
    })
    async def transfer(self, wallet_client: MockWalletClient, parameters: dict):
        return self.transfer_spy(wallet_client, parameters)

class AirdropService:
    def __init__(self):
        self.compressed_airdrop_spy = create_tool_execution_spy()
        
    @Tool({
        "description": "Airdrop tokens to multiple recipients",
        "parameters_schema": AirdropParameters
    })
    async def compressed_airdrop(self, wallet_client: MockWalletClient, parameters: dict):
        return self.compressed_airdrop_spy(wallet_client, parameters)

@pytest.mark.asyncio
async def test_jupiter_swap_prompt_examples():
    # Set up
    wallet = MockWalletClient()
    jupiter_service = JupiterService()
    jupiter_service.swap_tokens_spy.return_value = {"hash": "0xtx123"}
    
    plugin = create_mock_plugin("jupiter", jupiter_service)
    tools = get_tools(wallet=wallet, plugins=[plugin])
    
    # Find swap tool
    swap_tool = next((t for t in tools if t.name == "swap_tokens"), None)
    assert swap_tool is not None
    
    # Test "I want to trade 5 USDC for SOL" prompt
    result = swap_tool.execute({
        "inputMint": "USDC",
        "outputMint": "SOL",
        "amount": 5
    })
    
    # Verify
    jupiter_service.swap_tokens_spy.assert_called_with(
        wallet,
        {
            "inputMint": "USDC",
            "outputMint": "SOL",
            "amount": 5,
            "slippageBps": None
        }
    )
    assert result == {"hash": "0xtx123"}
    
    # Test "Exchange 1 SOL for JUP tokens" prompt
    jupiter_service.swap_tokens_spy.reset_mock()
    result = swap_tool.execute({
        "inputMint": "SOL",
        "outputMint": "JUP",
        "amount": 1
    })
    
    # Verify
    jupiter_service.swap_tokens_spy.assert_called_with(
        wallet,
        {
            "inputMint": "SOL",
            "outputMint": "JUP",
            "amount": 1,
            "slippageBps": None
        }
    )
    
    # Test "Swap 10 USDC for JUP with 1% slippage" prompt
    jupiter_service.swap_tokens_spy.reset_mock()
    result = swap_tool.execute({
        "inputMint": "USDC",
        "outputMint": "JUP",
        "amount": 10,
        "slippageBps": 100  # 1% = 100 basis points
    })
    
    # Verify
    jupiter_service.swap_tokens_spy.assert_called_with(
        wallet,
        {
            "inputMint": "USDC",
            "outputMint": "JUP",
            "amount": 10,
            "slippageBps": 100
        }
    )

@pytest.mark.asyncio
async def test_solana_transfer_prompt_examples():
    # Set up
    wallet = MockWalletClient()
    transfer_service = TransferService()
    transfer_service.transfer_spy.return_value = {"hash": "0xtx456"}
    
    plugin = create_mock_plugin("transfer", transfer_service)
    tools = get_tools(wallet=wallet, plugins=[plugin])
    
    # Find transfer tool
    transfer_tool = next((t for t in tools if t.name == "transfer"), None)
    assert transfer_tool is not None
    
    # Test "Can you transfer 0.0001 sol to GZbQmKY7zwjP3nbdqRWpLN98iApin9w5eXMGp7bmZbGB?" prompt
    result = transfer_tool.execute({
        "to": "GZbQmKY7zwjP3nbdqRWpLN98iApin9w5eXMGp7bmZbGB",
        "amount": 0.0001
    })
    
    # Verify
    transfer_service.transfer_spy.assert_called_with(
        wallet,
        {
            "to": "GZbQmKY7zwjP3nbdqRWpLN98iApin9w5eXMGp7bmZbGB",
            "amount": 0.0001,
            "token": None
        }
    )
    
    # Test "Can you transfer like two sol to GZbQmKY7zwjP3nbdqRWpLN98iApin9w5eXMGp7bmZbGB for testing?" prompt
    transfer_service.transfer_spy.reset_mock()
    result = transfer_tool.execute({
        "to": "GZbQmKY7zwjP3nbdqRWpLN98iApin9w5eXMGp7bmZbGB",
        "amount": 2
    })
    
    # Verify
    transfer_service.transfer_spy.assert_called_with(
        wallet,
        {
            "to": "GZbQmKY7zwjP3nbdqRWpLN98iApin9w5eXMGp7bmZbGB",
            "amount": 2,
            "token": None
        }
    )
    
    # Test "Send 250 USDC to GZbQmKY7zwjP3nbdqRWpLN98iApin9w5eXMGp7bmZbGB" prompt
    transfer_service.transfer_spy.reset_mock()
    result = transfer_tool.execute({
        "to": "GZbQmKY7zwjP3nbdqRWpLN98iApin9w5eXMGp7bmZbGB",
        "amount": 250,
        "token": "USDC"
    })
    
    # Verify
    transfer_service.transfer_spy.assert_called_with(
        wallet,
        {
            "to": "GZbQmKY7zwjP3nbdqRWpLN98iApin9w5eXMGp7bmZbGB",
            "amount": 250,
            "token": "USDC"
        }
    )

@pytest.mark.asyncio
async def test_solana_compressed_airdrop_examples():
    # Set up
    wallet = MockWalletClient()
    airdrop_service = AirdropService()
    airdrop_service.compressed_airdrop_spy.return_value = {"success": True, "txIds": ["tx1", "tx2"]}
    
    plugin = create_mock_plugin("airdrop", airdrop_service)
    tools = get_tools(wallet=wallet, plugins=[plugin])
    
    # Find airdrop tool
    airdrop_tool = next((t for t in tools if t.name == "compressed_airdrop"), None)
    assert airdrop_tool is not None
    
    # Test "Airdrop 100 tokens of mint 4h2cMlJ5byq4iqZ73rKRSz9rLmLjQvEDf9lm6JFgNu to [9aUn5swQzUTRanaaTwmszxiv89cvFwUCjF" prompt
    result = airdrop_tool.execute({
        "mint": "4h2cMlJ5byq4iqZ73rKRSz9rLmLjQvEDf9lm6JFgNu",
        "amount": 100,
        "recipients": ["9aUn5swQzUTRanaaTwmszxiv89cvFwUCjF"]
    })
    
    # Verify
    airdrop_service.compressed_airdrop_spy.assert_called_with(
        wallet,
        {
            "mint": "4h2cMlJ5byq4iqZ73rKRSz9rLmLjQvEDf9lm6JFgNu",
            "amount": 100,
            "recipients": ["9aUn5swQzUTRanaaTwmszxiv89cvFwUCjF"],
            "enable_logs": False
        }
    )
    
    # Test "Send 50 tokens from E5fU1X4TTq3XdVXz1wdYzbUYBzYQu5YnvLalwa0e2d1t to 2 recipients, each gets 50, with no logs." prompt
    airdrop_service.compressed_airdrop_spy.reset_mock()
    result = airdrop_tool.execute({
        "mint": "E5fU1X4TTq3XdVXz1wdYzbUYBzYQu5YnvLalwa0e2d1t",
        "amount": 50,
        "recipients": ["recipient1", "recipient2"],
        "enable_logs": False
    })
    
    # Verify
    airdrop_service.compressed_airdrop_spy.assert_called_with(
        wallet,
        {
            "mint": "E5fU1X4TTq3XdVXz1wdYzbUYBzYQu5YnvLalwa0e2d1t",
            "amount": 50,
            "recipients": ["recipient1", "recipient2"],
            "enable_logs": False
        }
    )
