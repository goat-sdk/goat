import aiohttp
import json
from typing import Dict, Any

from goat.decorators.tool import Tool
from .parameters import BuyTokenParameters
from goat_wallets.evm import EVMWalletClient
from goat_wallets.solana import SolanaWalletClient

# Import the base wallet client type for proper typing
from goat.classes.wallet_client_base import WalletClientBase


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

    def _get_base_url(self, api_key: str) -> str:
        """Determine the base URL based on the API key format"""
        if api_key.startswith("sk_staging_"):
            return self.STAGING_URL
        else:
            return self.PRODUCTION_URL

    async def post(self, path: str, body: Dict[str, Any]):
        """Make a POST request to the Crossmint API"""
        headers = {
            "X-API-KEY": self.api_key,
            "Content-Type": "application/json",
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(f"{self.base_url}{path}", headers=headers, json=body) as response:
                if not response.ok:
                    error_text = await response.text()
                    raise Exception(f"HTTP error! status: {response.status} {error_text}")
                return await response.json()


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
            # Ensure locale is set if not provided
            if "locale" not in parameters:
                parameters["locale"] = "en-US"

            # Convert parameters to JSON-serializable dict and clean null values
            api_request = clean_null_values(parameters)

            # Call the Crossmint API to create the order
            response_data = await self.api_client.post("/api/2022-06-09/orders", api_request)

            order = response_data.get("order")
            if not order:
                raise Exception("No order returned from API")

            # Check for insufficient funds
            if order.get("payment", {}).get("status") == "crypto-payer-insufficient-funds":
                raise Exception("Insufficient funds")

            # Check if physical address is required
            if order.get("quote", {}).get("status") == "requires-physical-address":
                raise Exception("recipient.physicalAddress is required")

            # Get the serialized transaction
            serialized_transaction = order.get("payment", {}).get("preparation", {}).get("serializedTransaction")
            if not serialized_transaction:
                raise Exception("No serialized transaction found for order, this item may not be available for purchase")

            # Process based on payment method
            payment_method = order.get("payment", {}).get("method")

            # Handle Solana transactions
            if payment_method == "solana":
                if not isinstance(wallet_client, SolanaWalletClient):
                    raise Exception("Solana wallet client required. Use a solana wallet client, or change the payment method to one supported by your wallet client")

                # Send the raw transaction using Solana wallet (as manager requested)
                result = wallet_client.send_raw_transaction(serialized_transaction)
                return {"order": order, "txId": result["hash"]}

            # Handle EVM transactions
            if self._is_evm_blockchain(payment_method):
                if not isinstance(wallet_client, EVMWalletClient):
                    raise Exception("EVM wallet client required. Use an evm wallet client, or change the payment method to one supported by your wallet client")

                # Manager said: "should just use the base EVMWallet object" and "checkout Uniswap plugin"
                # But Crossmint gives raw serialized transaction, not parameters like Uniswap
                # Following manager's feedback to remove all parsing - this may need adjustment
                raise Exception("EVM transaction handling needs clarification - Crossmint provides raw serialized transaction but manager requested no parsing")

            # Unsupported payment method
            raise Exception(f"Unsupported payment method: {payment_method}")

        except Exception as error:
            raise Exception(f"Failed to buy token: {str(error)}")

    def _is_evm_blockchain(self, method: str) -> bool:
        """Check if the payment method is an EVM blockchain."""
        evm_chains = ["ethereum", "ethereum-sepolia", "base", "base-sepolia", "polygon", "polygon-amoy"]
        return method in evm_chains
