"""
Utility module for importing Crossmint headless checkout functionality.
This avoids relative import issues from the original plugin.
"""
import os
import base58
import json
import logging
import aiohttp
from dataclasses import dataclass
from typing import Dict, Any, List

from goat.decorators.tool import Tool
from goat.classes.plugin_base import PluginBase
from goat_wallets.evm import EVMWalletClient
from goat_wallets.solana import SolanaWalletClient

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Union


# Copied from parameters.py
class PhysicalAddress(BaseModel):
    name: str = Field(description="Full name of the recipient")
    line1: str = Field(description="Street address, P.O. box, company name, c/o")
    line2: Optional[str] = Field(None, description="Apartment, suite, unit, building, floor, etc.")
    city: str = Field(description="City, district, suburb, town, or village")
    state: Optional[str] = Field(None, description="State, county, province, or region. Required for US addresses.")
    postalCode: str = Field(description="ZIP or postal code")
    country: str = Field(description="Two-letter country code (ISO 3166-1 alpha-2). Currently only US is supported.")

    @validator('country')
    def validate_country(cls, v):
        if v != "US":
            raise ValueError("Only 'US' country code is supported at this time")
        return v.upper()
    
    @validator('state')
    def validate_state(cls, v, values):
        if values.get('country') == "US" and not v:
            raise ValueError("State is required for US physical address")
        return v


class Recipient(BaseModel):
    email: str = Field(description="Email address for the recipient")
    physicalAddress: Optional[PhysicalAddress] = Field(
        None, 
        description="Physical shipping address for the recipient. Required when purchasing physical products."
    )


class Payment(BaseModel):
    method: str = Field(
        description="The blockchain network to use for the transaction (e.g., 'ethereum', 'ethereum-sepolia', 'base', 'base-sepolia', 'polygon', 'polygon-amoy', 'solana')"
    )
    currency: str = Field(
        description="The currency to use for payment (e.g., 'usdc')"
    )
    payerAddress: str = Field(
        description="The address that will pay for the transaction"
    )
    receiptEmail: Optional[str] = Field(
        None,
        description="Optional email to send payment receipt to"
    )

    @validator('method')
    def validate_method(cls, v):
        allowed_methods = ["ethereum", "ethereum-sepolia", "base", "base-sepolia", "polygon", "polygon-amoy", "solana"]
        if v not in allowed_methods:
            raise ValueError(f"Method must be one of: {', '.join(allowed_methods)}")
        return v

    @validator('currency')
    def validate_currency(cls, v):
        allowed_currencies = ["usdc"]
        if v not in allowed_currencies:
            raise ValueError(f"Currency must be one of: {', '.join(allowed_currencies)}")
        return v


class CollectionLineItem(BaseModel):
    collectionLocator: str = Field(
        description="The collection locator. Ex: 'crossmint:<crossmint_collection_id>', '<chain>:<contract_address>'"
    )
    callData: Optional[Dict[str, Any]] = None


class ProductLineItem(BaseModel):
    productLocator: str = Field(
        description="The product locator. Ex: 'amazon:<amazon_product_id>', 'amazon:<asin>'"
    )
    callData: Optional[Dict[str, Any]] = None


class BuyTokenParameters(BaseModel):
    recipient: Recipient = Field(
        description="Where the tokens will be sent to - either a wallet address or email, if email is provided a Crossmint wallet will be created and associated with the email"
    )
    payment: Payment = Field(
        description="Payment configuration - the desired blockchain, currency and address of the payer - optional receipt email, if an email recipient was not provided"
    )
    lineItems: List[Union[CollectionLineItem, ProductLineItem]] = Field(
        description="Array of items to purchase"
    )


# Copied from service.py (CrossmintApiClient)
class CrossmintApiClient:
    BASE_URL = "https://www.crossmint.com"
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        
    async def post(self, path: str, body: Dict[str, Any]):
        """Make a POST request to the Crossmint API"""
        headers = {
            "x-api-key": self.api_key,
            "Content-Type": "application/json",
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{self.BASE_URL}{path}", headers=headers, json=body) as response:
                return response


# Copied from service.py (CrossmintHeadlessCheckoutService)
class CrossmintHeadlessCheckoutService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.api_client = CrossmintApiClient(api_key)

    @Tool({
        "description": "Buy a token such as an NFT, SFT or item tokenized by them, listed on any blockchain",
        "parameters_schema": BuyTokenParameters
    })
    async def buy_token(self, wallet_client, parameters: dict):
        """Purchase a token or product via the Crossmint API."""
        try:
            # Convert parameters to JSON-serializable dict if needed
            api_request = parameters
            
            # Call the Crossmint API to create the order
            response = await self.api_client.post("/api/2022-06-09/orders", api_request)
            
            if response.status != 200:
                error_message = f"Failed to create buy order: {response.status} {response.reason}"
                try:
                    error_data = await response.json()
                    error_message += f"\n\n{json.dumps(error_data, indent=2)}"
                except Exception as e:
                    logging.error(f"Failed to parse error response: {e}")
                
                raise Exception(error_message)
                
            # Parse the response
            response_data = await response.json()
            order = response_data.get("order")
            
            logging.info(f"Created order: {order.get('orderId')}")
            
            # Check for insufficient funds
            if order.get("payment", {}).get("status") == "crypto-payer-insufficient-funds":
                raise Exception("Insufficient funds")
                
            # Check if physical address is required
            if order.get("quote", {}).get("status") == "requires-physical-address":
                raise Exception("recipient.physicalAddress is required")
                
            # Get the serialized transaction
            serialized_transaction = None
            payment_preparation = order.get("payment", {}).get("preparation", {})
            if payment_preparation and "serializedTransaction" in payment_preparation:
                serialized_transaction = payment_preparation["serializedTransaction"]
                
            if not serialized_transaction:
                raise Exception(
                    f"No serialized transaction found for order, this item may not be available for purchase:\n\n"
                    f"{json.dumps(order, indent=2)}"
                )
                
            # Process based on payment method
            payment_method = order.get("payment", {}).get("method")
            
            # Handle Solana transactions
            if payment_method == "solana":
                if not isinstance(wallet_client, SolanaWalletClient):
                    raise Exception(
                        "Solana wallet client required. Use a solana wallet client, or change the payment method to one supported by your wallet client"
                    )
                    
                # Decode the serialized transaction
                transaction_bytes = base58.b58decode(serialized_transaction)
                
                # Send the transaction using the wallet
                result = await wallet_client.send_transaction(
                    transaction_bytes=transaction_bytes
                )
                
                return {"order": order, "txId": result["signature"]}
                
            # Handle EVM transactions
            if self._is_evm_blockchain(payment_method):
                if not isinstance(wallet_client, EVMWalletClient):
                    raise Exception(
                        "EVM wallet client required. Use an evm wallet client, or change the payment method to one supported by your wallet client"
                    )
                    
                # Parse the transaction - assuming serialized_transaction is already in hex format
                # In a real implementation, you might need to parse the transaction more carefully
                if not serialized_transaction.startswith("0x"):
                    serialized_transaction = f"0x{serialized_transaction}"
                    
                # Assuming transaction parsing happens in the wallet implementation
                # or we have access to a web3 library to parse it
                
                # Here we'd ideally parse the transaction to get 'to', 'data', and 'value'
                # For now, we'll make some assumptions based on the TypeScript implementation
                
                logging.info(f"Paying order: {order.get('orderId')}")
                
                # Send the transaction
                result = await wallet_client.send_transaction(
                    serialized_transaction=serialized_transaction
                )
                
                return {"order": order, "txId": result["hash"]}
                
            # Unsupported payment method    
            raise Exception(f"Unsupported payment method: {payment_method}")
            
        except Exception as error:
            raise Exception(f"Failed to buy token: {str(error)}")
            
    def _is_evm_blockchain(self, method: str) -> bool:
        """Check if the payment method is an EVM blockchain."""
        evm_chains = ["ethereum", "ethereum-sepolia", "base", "base-sepolia", "polygon", "polygon-amoy"]
        return method in evm_chains 


# Copied from __init__.py - Plugin classes
@dataclass
class CrossmintHeadlessCheckoutPluginOptions:
    """Options for the CrossmintHeadlessCheckoutPlugin."""
    api_key: str  # API key for external service integration


class CrossmintHeadlessCheckoutPlugin(PluginBase):
    """
    Plugin for Crossmint's Headless Checkout API.
    
    This plugin allows purchasing of various items (NFTs, physical products, etc.)
    through Crossmint's APIs using cryptocurrency.
    """
    def __init__(self, options: CrossmintHeadlessCheckoutPluginOptions):
        super().__init__("crossmint-headless-checkout", [CrossmintHeadlessCheckoutService(options.api_key)])

    def supports_chain(self, chain) -> bool:
        """
        This plugin supports all chains, since Crossmint can facilitate transactions on various chains.
        
        Args:
            chain: The chain to check support for
            
        Returns:
            bool: Always True, as Crossmint supports multiple chains
        """
        # Support all chains, just like in the TypeScript implementation
        return True


def crossmint_headless_checkout(options: CrossmintHeadlessCheckoutPluginOptions) -> CrossmintHeadlessCheckoutPlugin:
    """
    Create a new instance of the CrossmintHeadlessCheckoutPlugin.
    
    Args:
        options: Configuration options for the plugin
        
    Returns:
        An instance of CrossmintHeadlessCheckoutPlugin
    """
    return CrossmintHeadlessCheckoutPlugin(options) 