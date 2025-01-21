import aiohttp
import json
from typing import Any, Dict, cast
from goat.decorators.tool import Tool
from .parameters import CheckApprovalParameters, GetQuoteParameters
from goat_wallets.evm import EVMWalletClient
from goat_wallets.evm.types import EVMTransaction


class UniswapService:
    def __init__(self, api_key: str, base_url: str = "https://trade-api.gateway.uniswap.org/v1"):
        self.api_key = api_key
        self.base_url = base_url

    async def make_request(self, endpoint: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Make a request to the Uniswap API."""
        url = f"{self.base_url}v1/{endpoint}"
        
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "x-api-key": self.api_key
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=parameters, headers=headers) as response:
                response_json = await response.json()
                if not response.ok:
                    raise Exception(f"Failed to fetch {endpoint}: {json.dumps(response_json, indent=2)}")
                return response_json

    @Tool({
        "name": "uniswap_check_approval",
        "description": "Check if the wallet has enough approval for a token and return the transaction to approve the token. The approval must takes place before the swap transaction",
        "parameters_schema": CheckApprovalParameters
    })
    async def check_approval(self, wallet_client: EVMWalletClient, parameters: dict):
        """Check token approval and approve if needed."""
        try:
            data = await self.make_request("check_approval", {
                "token": parameters["token"],
                "amount": parameters["amount"],
                "walletAddress": parameters["walletAddress"],
                "chainId": wallet_client.get_chain()["id"]
            })

            approval = data.get("approval")
            if not approval:
                return {"status": "approved"}

            # Create properly typed transaction object
            transaction_params = cast(EVMTransaction, {
                "to": str(approval["to"]),
                "data": str(approval["data"])
            })
            if approval.get("value"):
                transaction_params["value"] = int(approval["value"])
            
            # Send the transaction
            transaction = await wallet_client.send_transaction(transaction_params)
            return {
                "status": "approved",
                "txHash": transaction["hash"]
            }
        except Exception as error:
            raise Exception(f"Failed to check/approve token: {error}")

    @Tool({
        "name": "uniswap_get_quote",
        "description": "Get the quote for a swap",
        "parameters_schema": GetQuoteParameters
    })
    async def get_quote(self, wallet_client: EVMWalletClient, parameters: dict):
        """Get a quote for token swap."""
        try:
            chain_id = wallet_client.get_chain()["id"]
            return await self.make_request("quote", {
                **parameters,
                "tokenInChainId": chain_id,
                "tokenOutChainId": parameters.get("tokenOutChainId", chain_id),
                "swapper": wallet_client.get_address()
            })
        except Exception as error:
            raise Exception(f"Failed to get quote: {error}")

    @Tool({
        "name": "uniswap_swap_tokens",
        "description": "Swap tokens on Uniswap",
        "parameters_schema": GetQuoteParameters
    })
    async def swap_tokens(self, wallet_client: EVMWalletClient, parameters: dict):
        """Execute a token swap on Uniswap."""
        try:
            quote = await self.get_quote(wallet_client, parameters)
            
            response = await self.make_request("swap", {
                "quote": quote["quote"]
            })
            
            swap = response["swap"]
            # Create properly typed transaction object
            transaction_params = cast(EVMTransaction, {
                "to": str(swap["to"]),
                "data": str(swap["data"])
            })
            if swap.get("value"):
                transaction_params["value"] = int(swap["value"])
            
            # Send the transaction
            transaction = await wallet_client.send_transaction(transaction_params)

            return {
                "txHash": transaction["hash"]
            }
        except Exception as error:
            raise Exception(f"Failed to execute swap: {error}")
