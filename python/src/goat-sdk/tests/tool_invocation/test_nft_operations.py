import pytest
from unittest.mock import MagicMock
from pydantic import BaseModel, Field
from goat.decorators.tool import Tool
from goat.utils.get_tools import get_tools
from .mock_utils import MockWalletClient, create_tool_execution_spy
from .test_utils import create_mock_plugin

class MintParameters(BaseModel):
    name: str = Field(description="NFT name")
    description: str = Field(description="NFT description")
    image: str = Field(description="NFT image URL")
    recipient: str = Field(None, description="Recipient address")

class NFTTransferParameters(BaseModel):
    tokenId: str = Field(description="NFT token ID")
    contractAddress: str = Field(description="NFT contract address")
    to: str = Field(description="Recipient address")

class NFTService:
    def __init__(self):
        self.mint_nft_spy = create_tool_execution_spy()
        
    @Tool({
        "description": "Mint a new NFT",
        "parameters_schema": MintParameters
    })
    async def mint_nft(self, wallet_client: MockWalletClient, parameters: dict):
        return self.mint_nft_spy(wallet_client, parameters)

class NFTTransferService:
    def __init__(self):
        self.transfer_nft_spy = create_tool_execution_spy()
        
    @Tool({
        "description": "Transfer an NFT to another address",
        "parameters_schema": NFTTransferParameters
    })
    async def transfer_nft(self, wallet_client: MockWalletClient, parameters: dict):
        return self.transfer_nft_spy(wallet_client, parameters)

@pytest.mark.asyncio
async def test_nft_mint():
    # Set up
    wallet = MockWalletClient()
    nft_service = NFTService()
    nft_service.mint_nft_spy.return_value = {"tokenId": "123", "hash": "0xtx789"}
    
    plugin = create_mock_plugin("nft", nft_service)
    tools = get_tools(wallet=wallet, plugins=[plugin])
    
    # Find mint NFT tool
    mint_tool = next((t for t in tools if t.name == "mint_nft"), None)
    assert mint_tool is not None
    
    # Execute the tool
    result = mint_tool.execute({
        "name": "Test NFT",
        "description": "A test NFT",
        "image": "https://example.com/image.png",
        "recipient": "0xdef"
    })
    
    # Verify
    nft_service.mint_nft_spy.assert_called_with(
        wallet,
        {
            "name": "Test NFT",
            "description": "A test NFT",
            "image": "https://example.com/image.png",
            "recipient": "0xdef"
        }
    )
    assert result == {"tokenId": "123", "hash": "0xtx789"}

@pytest.mark.asyncio
async def test_nft_transfer():
    # Set up
    wallet = MockWalletClient()
    nft_transfer_service = NFTTransferService()
    nft_transfer_service.transfer_nft_spy.return_value = {"hash": "0xtx456"}
    
    plugin = create_mock_plugin("nft-transfer", nft_transfer_service)
    tools = get_tools(wallet=wallet, plugins=[plugin])
    
    # Find NFT transfer tool
    transfer_tool = next((t for t in tools if t.name == "transfer_nft"), None)
    assert transfer_tool is not None
    
    # Execute the tool
    result = transfer_tool.execute({
        "tokenId": "123",
        "contractAddress": "0xnft789",
        "to": "0xrecipient456"
    })
    
    # Verify
    nft_transfer_service.transfer_nft_spy.assert_called_with(
        wallet,
        {
            "tokenId": "123",
            "contractAddress": "0xnft789",
            "to": "0xrecipient456"
        }
    )
    assert result == {"hash": "0xtx456"}
