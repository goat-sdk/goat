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

# Import web3 wallet client as well
try:
    from goat_wallets.web3 import Web3EVMWalletClient
except ImportError:
    Web3EVMWalletClient = None

# Import the base wallet client type for proper typing
from goat.classes.wallet_client_base import WalletClientBase

logger = logging.getLogger(__name__)


def clean_null_values(obj):
    """Recursively remove null/None values from dictionaries and lists."""
    if isinstance(obj, dict):
        return {k: clean_null_values(v) for k, v in obj.items() if v is not None and v != ""}
    elif isinstance(obj, list):
        return [clean_null_values(item) for item in obj if item is not None and item != ""]
    else:
        return obj


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
            "X-API-KEY": self.api_key,
            "Content-Type": "application/json",
        }
        
        # Create SSL context with proper certificates
        ssl_context = ssl.create_default_context(cafile=certifi.where())
        
        logger.info(f"Making POST request to: {self.base_url}{path}")
        logger.debug(f"Request payload: {json.dumps(body, indent=2)}")
        
        # Add more detailed request logging
        logger.info("=== FULL REQUEST DETAILS ===")
        logger.info(f"URL: {self.base_url}{path}")
        logger.info(f"Headers: {headers}")
        logger.info(f"Body: {json.dumps(body, indent=2, default=str)}")
        logger.info("=== END REQUEST DETAILS ===")
        
        async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
            async with session.post(f"{self.base_url}{path}", headers=headers, json=body) as response:
                logger.info(f"API Response status: {response.status}")
                logger.info(f"API Response headers: {dict(response.headers)}")
                
                # Try to get the raw response text first
                try:
                    raw_response_text = await response.text()
                    logger.info(f"=== RAW API RESPONSE ===")
                    logger.info(f"Status: {response.status}")
                    logger.info(f"Raw response text: {raw_response_text}")
                    logger.info("=== END RAW RESPONSE ===")
                except Exception as text_error:
                    logger.error(f"Failed to read raw response text: {text_error}")
                    raw_response_text = None
                
                if response.status >= 400:
                    try:
                        error_data = await response.json()
                        logger.error(f"API Error Response: {json.dumps(error_data, indent=2)}")
                    except Exception as e:
                        logger.error(f"Failed to parse error response: {e}")
                        error_text = await response.text()
                        logger.error(f"Raw error response: {error_text}")
                
                # Return both response object and raw text
                return response, raw_response_text


class CrossmintHeadlessCheckoutService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.api_client = CrossmintApiClient(api_key)

    @Tool({
        "description": "Buy a token such as an NFT, SFT or item tokenized by them, listed on any blockchain",
        "parameters_schema": BuyTokenParameters
    })
    async def buy_token(self, wallet_client: WalletClientBase, parameters: dict):
        """Purchase a token or product via the Crossmint API."""
        try:
            # Debug logging to see what's being passed
            logger.info(f"=== TOOL EXECUTION DEBUG ===")
            logger.info(f"wallet_client: {wallet_client}")
            logger.info(f"wallet_client type: {type(wallet_client)}")
            logger.info(f"parameters: {parameters}")
            logger.info(f"parameters type: {type(parameters)}")
            logger.info("=== END TOOL EXECUTION DEBUG ===")
            
            # Ensure locale is set if not provided
            if "locale" not in parameters:
                parameters["locale"] = "en-US"
            
            # Convert parameters to JSON-serializable dict and clean null values
            api_request = clean_null_values(parameters)
            
            # Add detailed logging of the api_request being sent
            logger.info("=== CROSSMINT API REQUEST DEBUG ===")
            logger.info(f"Raw parameters received: {json.dumps(parameters, indent=2, default=str)}")
            logger.info(f"API request after cleaning nulls: {json.dumps(api_request, indent=2, default=str)}")
            logger.info("=== END API REQUEST DEBUG ===")
            
            # Call the Crossmint API to create the order
            response, raw_response_text = await self.api_client.post("/api/2022-06-09/orders", api_request)
            
            logger.info(f"API Response status: {response.status}")
            logger.info(f"API Response headers: {dict(response.headers)}")
            
            # Check for successful response (200-299 range)
            if not (200 <= response.status < 300):
                error_message = f"Failed to create buy order: {response.status} {response.reason}"
                if raw_response_text:
                    error_message += f"\n\nRaw response: {raw_response_text}"
                
                # Add the request that was sent for debugging
                logger.error("=== REQUEST THAT CAUSED ERROR ===")
                logger.error(f"API Request sent: {json.dumps(api_request, indent=2, default=str)}")
                logger.error("=== END ERROR REQUEST DEBUG ===")
                
                raise Exception(error_message)
            
            # Parse the response JSON
            try:
                if raw_response_text:
                    response_data = json.loads(raw_response_text)
                else:
                    response_data = await response.json()
                
                logger.info(f"=== PARSED API RESPONSE ===")
                logger.info(f"Parsed response: {json.dumps(response_data, indent=2, default=str)}")
                logger.info("=== END PARSED RESPONSE ===")
                
            except Exception as json_error:
                logger.error(f"Failed to parse response JSON: {json_error}")
                logger.error(f"Raw response text was: {raw_response_text}")
                raise Exception(f"Failed to parse API response: {json_error}")
            
            order = response_data.get("order")
            
            logger.info(f"✅ API call successful! Status: {response.status}")
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
                # Check for EVM wallet client (including web3 version)
                is_evm_wallet = isinstance(wallet_client, EVMWalletClient)
                if Web3EVMWalletClient:
                    is_evm_wallet = is_evm_wallet or isinstance(wallet_client, Web3EVMWalletClient)
                
                if not is_evm_wallet:
                    logger.error(f"Wallet client type: {type(wallet_client)}")
                    logger.error(f"Expected EVMWalletClient or Web3EVMWalletClient")
                    raise Exception(
                        "EVM wallet client required. Use an evm wallet client, or change the payment method to one supported by your wallet client"
                    )
                    
                # Parse the serialized transaction to extract to, value, and data
                if not serialized_transaction.startswith("0x"):
                    serialized_transaction = f"0x{serialized_transaction}"
                    
                logger.info(f"Paying order: {order.get('orderId')}")
                logger.info(f"Parsing serialized transaction: {serialized_transaction[:50]}...")
                
                try:
                    # Use web3.py to decode the transaction
                    from web3 import Web3
                    from eth_utils import to_bytes, to_hex
                    import rlp
                    
                    # Remove '0x' prefix and convert to bytes
                    tx_bytes = to_bytes(hexstr=serialized_transaction)
                    
                    # Simple approach: try RLP decoding first (works for both legacy and most typed transactions)
                    try:
                        decoded = rlp.decode(tx_bytes)
                        # Legacy transaction format: [nonce, gasPrice, gasLimit, to, value, data, v, r, s]
                        transaction_data = {
                            "to": to_hex(decoded[3]) if decoded[3] else None,
                            "value": int.from_bytes(decoded[4], 'big') if decoded[4] else 0,
                            "data": to_hex(decoded[5]) if decoded[5] else "0x",
                        }
                    except Exception:
                        # If RLP fails, try to handle as typed transaction by removing type byte
                        if tx_bytes[0] <= 0x7f:
                            # Remove the type byte and try RLP on the rest
                            try:
                                decoded = rlp.decode(tx_bytes[1:])
                                # EIP-1559 format is similar but with different fields
                                transaction_data = {
                                    "to": to_hex(decoded[5]) if len(decoded) > 5 and decoded[5] else None,
                                    "value": int.from_bytes(decoded[6], 'big') if len(decoded) > 6 and decoded[6] else 0,
                                    "data": to_hex(decoded[7]) if len(decoded) > 7 and decoded[7] else "0x",
                                }
                            except Exception:
                                raise Exception("Failed to decode transaction - unsupported format")
                        else:
                            raise Exception("Failed to decode transaction")
                    
                    if not transaction_data.get("to"):
                        raise Exception("Transaction 'to' field is null or empty")
                    
                    logger.info(f"Parsed transaction: to={transaction_data['to']}, value={transaction_data['value']}, data={transaction_data['data'][:20]}...")
                    
                except Exception as parse_error:
                    logger.error(f"Failed to parse transaction: {parse_error}")
                    # Fallback: try to send raw transaction if parsing fails
                    if hasattr(wallet_client, '_web3'):
                        tx_hash = wallet_client._web3.eth.send_raw_transaction(serialized_transaction)
                        receipt = wallet_client._web3.eth.wait_for_transaction_receipt(tx_hash)
                        result = {
                            "hash": receipt["transactionHash"].hex(),
                            "status": "1" if receipt["status"] == 1 else "0",
                        }
                        return {"order": order, "txId": result["hash"]}
                    else:
                        raise Exception(f"Failed to parse transaction and no fallback available: {parse_error}")
                
                # Send the parsed transaction using the wallet client's send_transaction method
                if hasattr(wallet_client, 'send_transaction'):
                    import asyncio
                    import inspect
                    
                    # Check if send_transaction is async
                    send_tx_method = getattr(wallet_client, 'send_transaction')
                    if inspect.iscoroutinefunction(send_tx_method):
                        result = await wallet_client.send_transaction(transaction_data)
                    else:
                        result = wallet_client.send_transaction(transaction_data)
                    
                    return {"order": order, "txId": result["hash"]}
                else:
                    raise Exception("Wallet client does not support send_transaction")
                
            # Unsupported payment method    
            raise Exception(f"Unsupported payment method: {payment_method}")
            
        except Exception as error:
            raise Exception(f"Failed to buy token: {str(error)}")

    def _is_evm_blockchain(self, method: str) -> bool:
        """Check if the payment method is an EVM blockchain."""
        evm_chains = ["ethereum", "ethereum-sepolia", "base", "base-sepolia", "polygon", "polygon-amoy"]
        return method in evm_chains
