import aiohttp
import json
from typing import Any, Dict, cast
from eth_typing import HexStr
from goat.decorators.tool import Tool
from .parameters import CheckApprovalParameters, GetQuoteParameters
from goat_wallets.evm import EVMTransaction, EVMTypedData
from goat_wallets.evm import EVMWalletClient
from goat_plugins.erc20.abi import ERC20_ABI


class UniswapService:
    def __init__(self, api_key: str, base_url: str = "https://trade-api.gateway.uniswap.org/v1"):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")  # Remove trailing slash if present

        # Map chain IDs to their string names
        self.chain_id_map = {
            1: "MAINNET",
            10: "OPTIMISM",
            137: "POLYGON",
            42161: "ARBITRUM",
            8453: "BASE",
            43114: "AVAX",
            7777777: "ZORA",
            42220: "CELO"
        }

    async def make_request(self, endpoint: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Make a request to the Uniswap API."""
        url = f"{self.base_url}/{endpoint}"
        
        headers = {
            "x-api-key": self.api_key
        }
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.post(url, json=parameters, headers=headers) as response:
                    response_text = await response.text()
                    try:
                        response_json = json.loads(response_text)
                    except json.JSONDecodeError:
                        raise Exception(f"Invalid JSON response from {endpoint}: {response_text}")
                    
                    print(f"\nAPI Response for {endpoint}:")
                    print(f"Status: {response.status}")
                    print(f"Headers: {dict(response.headers)}")
                    print(f"Body: {response_text}")
                    
                    if not response.ok:
                        error_code = response_json.get("errorCode", "Unknown error")
                        if error_code == "VALIDATION_ERROR":
                            raise Exception("Invalid parameters provided to the API")
                        elif error_code == "INSUFFICIENT_BALANCE":
                            raise Exception("Insufficient balance for the requested operation")
                        elif error_code == "RATE_LIMIT":
                            raise Exception("API rate limit exceeded")
                        else:
                            raise Exception(f"API error: {error_code}")
                    
                    return response_json
            except aiohttp.ClientError as e:
                raise Exception(f"Network error while accessing {endpoint}: {str(e)}")

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

            # If no approval data is returned, the token is already approved
            if not data or "approval" not in data or not data["approval"]:
                return {"status": "approved"}

            approval = data["approval"]
            # Extract spender address from approval data
            data = approval["data"]
            # The spender address starts at position 34 (after function selector) and is 40 characters long
            raw_spender = "0x" + data[34:74]
            # Use wallet_client's resolve_address to get checksum address
            spender = wallet_client.resolve_address(raw_spender)
            # Convert max approval amount to integer
            max_approval = int("0x" + "f" * 64, 16)  # Max uint256 value
            
            transaction_params: EVMTransaction = {
                "to": wallet_client.resolve_address(approval["to"]),
                "abi": ERC20_ABI,
                "functionName": "approve",
                "args": [spender, max_approval],
                "value": 0
            }
            
            # Send the transaction
            transaction = wallet_client.send_transaction(transaction_params)
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
            
            request_params = {
                "tokenIn": parameters["tokenIn"],
                "tokenOut": parameters["tokenOut"],
                "amount": parameters["amount"],
                "type": "EXACT_INPUT",  # Default type
                "tokenInChainId": chain_id,
                "tokenOutChainId": chain_id,  # Same chain for now
                "swapper": wallet_client.get_address()
            }
            
            # Debug log the request parameters
            print(f"\nRequest parameters for quote:")
            print(json.dumps(request_params, indent=2))
            
            return await self.make_request("quote", request_params)
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
            quote_response = await self.get_quote(wallet_client, parameters)
            quote = quote_response["quote"]
            permit_data = quote_response.get("permitData")

            swap_params = {
                "quote": quote,
            }
            
            # Handle permit signature if permit data is present
            if permit_data:
                # Create properly typed data structure
                typed_data: EVMTypedData = {
                    "domain": permit_data["domain"],
                    "types": permit_data["types"],
                    "primaryType": list(permit_data["types"].keys())[0],
                    "message": permit_data["values"]
                }
                signature = wallet_client.sign_typed_data(typed_data)

                swap_params["permitData"] = permit_data
                swap_params["signature"] = str(signature["signature"])

            print(f"\nRequest parameters for swap:")
            print(json.dumps(swap_params, indent=2))
            
            response = await self.make_request("swap", swap_params)
            
            swap = response["swap"]
            # Create properly typed transaction object using raw API response
            value = swap.get("value", "0x0")
            # Convert hex value to integer for EVMTransaction
            if isinstance(value, str) and value.startswith("0x"):
                value = int(value, 16)
            elif isinstance(value, str):
                value = int(value)
            else:
                value = int(value) if value else 0
            
            # Create and cast the transaction parameters
            transaction_params = cast(EVMTransaction, {
                "to": wallet_client.resolve_address(swap["to"]),
                "value": value,
                "data": HexStr(swap["data"])
            })
            
            # Send the transaction
            transaction = wallet_client.send_transaction(transaction_params)

            return {
                "txHash": transaction["hash"]
            }
        except Exception as error:
            raise Exception(f"Failed to execute swap: {error}")
