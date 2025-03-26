import base58
import json
from typing import Dict, Any, Optional, List, Union
import requests
from solders.transaction import Transaction
from hexbytes import HexBytes

from goat.decorators.tool import Tool
from goat_wallets.evm import EVMWalletClient
from goat_wallets.solana import SolanaWalletClient

from .parameters import CreateAndPayOrderParameters


class CrossmintHeadlessCheckoutService:
    """Service for purchasing NFTs through Crossmint."""

    def __init__(self, api_key: str):
        """Initialize the service with the Crossmint API key."""
        self.api_key = api_key
        
    @Tool({
        "description": "Buy a token such as an NFT, SFT or item tokenized by them, listed on any blockchain",
        "parameters_schema": CreateAndPayOrderParameters
    })
    async def buy_token(
        self, 
        wallet_client: Union[EVMWalletClient, SolanaWalletClient], 
        parameters: Dict[str, Any]
    ):
        """
        Buy a token using the Crossmint API.
        
        Args:
            wallet_client: The wallet client to use for sending transactions
            parameters: The parameters for the purchase
            
        Returns:
            Dict containing order and transaction hash
        """
        try:
            # Create order via Crossmint API
            response = requests.post(
                "https://staging.crossmint.com/api/2022-06-09/orders",
                headers={
                    "x-api-key": self.api_key,
                    "Content-Type": "application/json",
                },
                json=parameters
            )
            
            if not response.ok:
                error_message = f"Failed to create buy order: {response.status_code} {response.reason}"
                try:
                    json_response = response.json()
                    error_message += f"\n\n{json.dumps(json_response, indent=2)}"
                except Exception as e:
                    print(f"Failed to parse JSON response: {e}")
                
                raise Exception(error_message)
            
            # Parse response
            response_data = response.json()
            order = response_data.get("order")
            
            # Handle various error states
            if order["payment"]["status"] == "crypto-payer-insufficient-funds":
                raise Exception("Insufficient funds")
                
            if order["quote"]["status"] == "requires-physical-address":
                raise Exception("recipient.physicalAddress is required")
                
            # Get serialized transaction
            serialized_transaction = None
            if (order["payment"]["preparation"] is not None and 
                "serializedTransaction" in order["payment"]["preparation"]):
                serialized_transaction = order["payment"]["preparation"]["serializedTransaction"]
                
            if not serialized_transaction:
                raise Exception(
                    f"No serialized transaction found for order, this item may not be available for purchase:\n\n"
                    f"{json.dumps(order, indent=2)}"
                )
            
            # Get payment method and handle accordingly
            payment_method = order["payment"]["method"]
            
            # Handle Solana transaction
            if payment_method == "solana":
                if not isinstance(wallet_client, SolanaWalletClient):
                    raise Exception(
                        "Solana wallet client required. Use a solana wallet client, or change the payment method "
                        "to one supported by your wallet client"
                    )
                
                # Deserialize the transaction from base58
                transaction_bytes = base58.b58decode(serialized_transaction)
                solana_tx = Transaction.from_bytes(transaction_bytes)
                
                send_result = await wallet_client.send_transaction({
                    "instructions": solana_tx.instructions
                })
                
                return {"order": order, "txId": send_result["hash"]}
            
            # Handle EVM transaction
            evm_chains = ["ethereum", "ethereum-sepolia", "base", "base-sepolia", "polygon", "polygon-amoy"]
            if payment_method in evm_chains:
                if not isinstance(wallet_client, EVMWalletClient):
                    raise Exception(
                        "EVM wallet client required. Use an evm wallet client, or change the payment method "
                        "to one supported by your wallet client"
                    )
                
                # Ensure hex format
                if not serialized_transaction.startswith("0x"):
                    serialized_transaction = f"0x{serialized_transaction}"
                
                # For EVM, we can send the raw transaction data
                print(f"Paying order: {order['orderId']}")
                
                # Extract transaction information from order.payment.preparation
                to_address = order["payment"]["preparation"].get("to")
                if not to_address:
                    raise Exception("Transaction to address is missing")
                
                # Parse value if available, default to 0
                value = int(order["payment"]["preparation"].get("value", "0"), 16) if order["payment"]["preparation"].get("value") else 0
                
                send_result = await wallet_client.send_transaction({
                    "to": to_address,
                    "value": value,
                    "data": serialized_transaction
                })
                
                return {"order": order, "txId": send_result["hash"]}
            
            raise Exception(f"Unsupported payment method: {payment_method}")
        except Exception as e:
            raise Exception(f"Failed to execute buy_token: {e}")
