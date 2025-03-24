import pytest
from unittest.mock import MagicMock
from pydantic import BaseModel, Field
from goat.decorators.tool import Tool
from goat.utils.get_tools import get_tools
from .mock_utils import MockWalletClient, create_tool_execution_spy
from .test_utils import create_mock_plugin

class AirdropParameters(BaseModel):
    mint: str = Field(description="Token mint address")
    amount: int = Field(description="Amount to airdrop")
    recipients: list[str] = Field(description="Recipient addresses")
    enable_logs: bool = Field(default=False, description="Enable logs")

class JupiterSwapParameters(BaseModel):
    inputMint: str = Field(description="Input token mint address")
    outputMint: str = Field(description="Output token mint address")
    amount: float = Field(description="Amount to swap")
    slippage: float = Field(None, description="Slippage tolerance in percentage")

class CoinGeckoParameters(BaseModel):
    coinId: str = Field(description="CoinGecko coin ID")
    vsCurrency: str = Field(description="Currency to get price in")

class AirdropService:
    def __init__(self):
        self.airdrop_spy = create_tool_execution_spy()
        
    @Tool({
        "description": "Airdrop tokens to multiple recipients",
        "parameters_schema": AirdropParameters
    })
    async def airdrop(self, wallet_client: MockWalletClient, parameters: dict):
        return self.airdrop_spy(wallet_client, parameters)

class JupiterService:
    def __init__(self):
        self.jupiter_swap_spy = create_tool_execution_spy()
        
    @Tool({
        "description": "Swap tokens using Jupiter DEX",
        "parameters_schema": JupiterSwapParameters
    })
    async def jupiter_swap(self, wallet_client: MockWalletClient, parameters: dict):
        return self.jupiter_swap_spy(wallet_client, parameters)

class CoinGeckoService:
    def __init__(self):
        self.price_spy = create_tool_execution_spy()
        
    @Tool({
        "description": "Get cryptocurrency price from CoinGecko",
        "parameters_schema": CoinGeckoParameters
    })
    async def get_price(self, parameters: dict):
        return self.price_spy(parameters)

@pytest.mark.asyncio
async def test_airdrop():
    # Set up
    wallet = MockWalletClient()
    airdrop_service = AirdropService()
    airdrop_service.airdrop_spy.return_value = {"success": True, "txIds": ["tx1", "tx2"]}
    
    plugin = create_mock_plugin("airdrop", airdrop_service)
    tools = get_tools(wallet=wallet, plugins=[plugin])
    
    # Find airdrop tool
    airdrop_tool = next((t for t in tools if t.name == "airdrop"), None)
    assert airdrop_tool is not None
    
    # Execute the tool
    result = airdrop_tool.execute({
        "mint": "4h2cMlJ5byq4iqZ73rKRSz9rLmLjQvEDf9lm6JFgNu",
        "amount": 100,
        "recipients": ["9aUn5swQzUTRanaaTwmszxiv89cvFwUCjF"],
        "enable_logs": False
    })
    
    # Verify
    airdrop_service.airdrop_spy.assert_called_with(
        wallet,
        {
            "mint": "4h2cMlJ5byq4iqZ73rKRSz9rLmLjQvEDf9lm6JFgNu",
            "amount": 100,
            "recipients": ["9aUn5swQzUTRanaaTwmszxiv89cvFwUCjF"],
            "enable_logs": False
        }
    )
    assert result == {"success": True, "txIds": ["tx1", "tx2"]}

@pytest.mark.asyncio
async def test_jupiter_swap():
    # Set up
    wallet = MockWalletClient()
    jupiter_service = JupiterService()
    jupiter_service.jupiter_swap_spy.return_value = {"txId": "jupiterTx123", "outputAmount": "42.5"}
    
    plugin = create_mock_plugin("jupiter", jupiter_service)
    tools = get_tools(wallet=wallet, plugins=[plugin])
    
    # Find jupiter swap tool
    swap_tool = next((t for t in tools if t.name == "jupiter_swap"), None)
    assert swap_tool is not None
    
    # Execute the tool
    result = swap_tool.execute({
        "inputMint": "USDC",
        "outputMint": "SOL",
        "amount": 5,
        "slippage": 0.5
    })
    
    # Verify
    jupiter_service.jupiter_swap_spy.assert_called_with(
        wallet,
        {
            "inputMint": "USDC",
            "outputMint": "SOL",
            "amount": 5,
            "slippage": 0.5
        }
    )
    assert result == {"txId": "jupiterTx123", "outputAmount": "42.5"}

@pytest.mark.asyncio
async def test_coingecko_price():
    # Set up
    wallet = MockWalletClient()
    coingecko_service = CoinGeckoService()
    coingecko_service.price_spy.return_value = {"price": 30000, "lastUpdated": "2023-01-01T00:00:00Z"}
    
    plugin = create_mock_plugin("coingecko", coingecko_service)
    tools = get_tools(wallet=wallet, plugins=[plugin])
    
    # Find price tool
    price_tool = next((t for t in tools if t.name == "get_price"), None)
    assert price_tool is not None
    
    # Execute the tool
    result = price_tool.execute({
        "coinId": "bitcoin",
        "vsCurrency": "usd"
    })
    
    # Verify
    coingecko_service.price_spy.assert_called_with({
        "coinId": "bitcoin",
        "vsCurrency": "usd"
    })
    assert result == {"price": 30000, "lastUpdated": "2023-01-01T00:00:00Z"}
