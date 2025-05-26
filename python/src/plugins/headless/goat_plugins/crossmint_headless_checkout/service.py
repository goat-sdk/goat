import aiohttp
import base58
import json
import logging
import ssl
import certifi
from typing import Dict, Any

from goat.decorators.tool import Tool
from .parameters import BuyTokenParameters
from goat_wallets.evm import EVMWalletClient
from goat_wallets.solana import SolanaWalletClient


logger = logging.getLogger(__name__)


class CrossmintApiClient:
    PRODUCTION_URL = "https://www.crossmint.com"
    STAGING_URL = "https://staging.crossmint.com"
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = self._get_base_url(api_key)
        logger.info(f"Crossmint API Client initialized with base URL: {self.base_url}")
        
    def _get_base_url(self, api_key: str) -> str:
        """Determine the base URL based on the API key format"""
        if api_key.startswith("sk_staging_"):
            logger.info("Detected staging API key, using staging environment")
            return self.STAGING_URL
        else:
            logger.info("Using production environment")
            return self.PRODUCTION_URL
        
    async def post(self, path: str, body: Dict[str, Any]):
        """Make a POST request to the Crossmint API"""
        headers = {
            "x-api-key": self.api_key,
            "Content-Type": "application/json",
        }
        
        # Create SSL context with proper certificates
        ssl_context = ssl.create_default_context(cafile=certifi.where())
        
        logger.info(f"Making POST request to: {self.base_url}{path}")
        logger.debug(f"Request payload: {json.dumps(body, indent=2)}")
        
        async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
            async with session.post(f"{self.base_url}{path}", headers=headers, json=body) as response:
                logger.info(f"API Response status: {response.status}")
                
                if response.status >= 400:
                    try:
                        error_data = await response.json()
                        logger.error(f"API Error Response: {json.dumps(error_data, indent=2)}")
                    except Exception as e:
                        logger.error(f"Failed to parse error response: {e}")
                        error_text = await response.text()
                        logger.error(f"Raw error response: {error_text}")
                
                return response


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
                    logger.error(f"Failed to parse error response: {e}")
                
                raise Exception(error_message)
                
            # Parse the response
            response_data = await response.json()
            order = response_data.get("order")
            
            logger.info(f"Created order: {order.get('orderId')}")
            
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
                
                logger.info(f"Paying order: {order.get('orderId')}")
                
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
