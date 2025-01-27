import base64
import aiohttp
from goat.decorators.tool import Tool
from goat_wallets.solana.wallet import SolanaTransaction
from solders.message import MessageV0
from solders.transaction import VersionedTransaction
from .parameters import GetQuoteParameters, QuoteResponse
from goat_wallets.solana import SolanaWalletClient


class JupiterService:
    def __init__(self):
        self.base_url = "https://quote-api.jup.ag/v6"
        self._timeout = aiohttp.ClientTimeout(total=10)  # 10 second timeout

    @Tool({
        "description": "Get a quote for a swap on the Jupiter DEX",
        "parameters_schema": GetQuoteParameters
    })
    async def get_quote(self, parameters: dict) -> dict:
        """Get a quote for swapping tokens using Jupiter."""
        try:
            params = GetQuoteParameters.model_validate(parameters)
            # Convert parameters to dict and ensure required fields are properly formatted
            request_params = {
                'inputMint': params.inputMint,
                'outputMint': params.outputMint,
                'amount': str(params.amount),
                'swapMode': params.swapMode.value
            }
            # Add optional parameters if they are set
            if params.slippageBps is not None:
                request_params['slippageBps'] = str(params.slippageBps)
            print(f"Requesting quote with parameters: {request_params}")
            async with aiohttp.ClientSession(timeout=self._timeout) as session:
                async with session.get(f"{self.base_url}/quote", params=request_params) as response:
                    response_text = await response.text()
                    print(f"Got response: {response_text}")
                    
                    if response.status != 200:
                        try:
                            error_data = await response.json()
                            raise Exception(f"Failed to get quote: {error_data.get('error', 'Unknown error')}")
                        except:
                            raise Exception(f"Failed to get quote: {response_text}")
                    
                    response_data = await response.json()
                    QuoteResponse.model_validate(response_data)

                    return response_data
        except aiohttp.ClientResponseError as error:
            error_message = f"Failed to get quote: {str(error)}"
            if error.status != 404:  # Only try to parse response for non-404 errors
                try:
                    error_message = f"Failed to get quote: HTTP {error.status} - {error.message}"
                except:
                    pass
            raise Exception(error_message)
        except Exception as error:
            raise Exception(f"Failed to get quote: {str(error)}")

    @Tool({
        "description": "Swap an SPL token for another token on the Jupiter DEX",
        "parameters_schema": GetQuoteParameters
    })
    async def swap_tokens(self, wallet_client: SolanaWalletClient, parameters: dict):
        """Swap tokens using Jupiter DEX."""
        try:
            # First get the quote
            quote_response = await self.get_quote(parameters)
            
            # Transform quote response following the same structure as in TypeScript
            transformed_quote_response = {
                "inputMint": quote_response.get("inputMint"),
                "inAmount": quote_response.get("inAmount"),
                "outputMint": quote_response.get("outputMint"),
                "outAmount": quote_response.get("outAmount"),
                "otherAmountThreshold": quote_response.get("otherAmountThreshold"),
                "swapMode": quote_response.get("swapMode"),
                "slippageBps": quote_response.get("slippageBps"),
                "priceImpactPct": quote_response.get("priceImpactPct"),
                "routePlan": [
                    {
                        "swapInfo": {
                            "ammKey": step.get("swapInfo", {}).get("ammKey"),
                            "label": step.get("swapInfo", {}).get("label"),
                            "inputMint": step.get("swapInfo", {}).get("inputMint"),
                            "outputMint": step.get("swapInfo", {}).get("outputMint"),
                            "inAmount": step.get("swapInfo", {}).get("inAmount"),
                            "outAmount": step.get("swapInfo", {}).get("outAmount"),
                            "feeAmount": step.get("swapInfo", {}).get("feeAmount"),
                            "feeMint": step.get("swapInfo", {}).get("feeMint")
                        },
                        "percent": step.get("percent")
                    }
                    for step in quote_response.get("routePlan", [])
                ]
            }

            # Remove None values from the transformed response
            transformed_quote_response = {k: v for k, v in transformed_quote_response.items() if v is not None}

            # Add optional fields if they exist
            for field in ["computedAutoSlippage", "contextSlot", "timeTaken"]:
                if field in quote_response and quote_response[field] is not None:
                    transformed_quote_response[field] = quote_response[field]

            if "platformFee" in quote_response and quote_response["platformFee"]:
                platform_fee = quote_response["platformFee"]
                fee_data = {}
                if "amount" in platform_fee:
                    fee_data["amount"] = platform_fee["amount"]
                if "feeBps" in platform_fee:
                    fee_data["feeBps"] = platform_fee["feeBps"]
                if fee_data:
                    transformed_quote_response["platformFee"] = fee_data

            # Prepare the full swap request
            swap_request = {
                "quoteResponse": transformed_quote_response,
                "userPublicKey": wallet_client.get_address(),
                "dynamicComputeUnitLimit": True,
                "prioritizationFeeLamports": "auto",
                "wrapAndUnwrapSol": True,
                "useSharedAccounts": True,
                "dynamicSlippage": None,  # Can be added if needed
                "asLegacyTransaction": False,
                "skipUserAccountsRpcCalls": False,
                "useTokenLedger": False,
                "destinationTokenAccount": None  # Can be specified if needed
            }
            
            # Get swap transaction
            async with aiohttp.ClientSession(timeout=self._timeout) as session:
                async with session.post(f"{self.base_url}/swap", json=swap_request) as response:
                    if response.status != 200:
                        error_data = await response.json()
                        raise Exception(f"Failed to create swap transaction: {error_data.get('error', 'Unknown error')}")
                    
                    swap_response = await response.json()
                    swap_transaction = swap_response.get("swapTransaction")
                    
                    if not swap_transaction:
                        raise Exception("No swap transaction returned")
                    
                    # Send the raw transaction directly
                    result = wallet_client.send_raw_transaction(swap_transaction)
                    
                    return {
                        "hash": result["hash"]
                    }
                    
        except Exception as error:
            raise Exception(f"Failed to swap tokens: {error}")
