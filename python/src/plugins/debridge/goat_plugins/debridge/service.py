import aiohttp
from goat.decorators.tool import Tool
from urllib.parse import urlencode
from .parameters import (
    CancelExternalCallParameters,
    CancelOrderParameters,
    CreateOrderTransactionParameters,
    EmptyParameters,
    GetOrderDataParameters,
    GetOrderIDsParameters,
    GetOrderStatusParameters,
    GetTokenListParameters,
    SingleChainSwapEstimationParameters,
    SingleChainSwapTransactionParameters,
)


class DebridgeService:

    def __init__(self):
        self.base_url = "https://dln.debridge.finance/v1.0"

    async def _fetch(self, url: str, action: str):
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    if not response.ok:
                        raise Exception(
                            f"HTTP error! status: {response.status} {await response.text()}"
                        )
                    return await response.json()
        except Exception as e:
            raise Exception(f"Failed to {action}: {e}")

    @Tool({
        "description":
        "Get details for the chains supported by the deBridge Liquidity Network",
        "parameters_schema": EmptyParameters,
    })
    async def get_supported_chains(self, parameters: dict):
        """Get details for the chains supported by the deBridge Liquidity Network"""
        url = f"{self.base_url}/supported-chains-info"
        return await self._fetch(url, "get supported chains")

    @Tool({
        "description":
        "Get the token list supported by the deBridge Liquidity Network",
        "parameters_schema": GetTokenListParameters,
    })
    async def get_token_list(self, parameters: dict):
        """Get the token list supported by the deBridge Liquidity Network"""
        chainId = parameters["chainId"]
        url = f"{self.base_url}/token-list?chainId={chainId}"
        return await self._fetch(url, "get token list")

    @Tool({
        "description": "Get the data of order",
        "parameters_schema": GetOrderDataParameters,
    })
    async def get_order_data(self, parameters: dict):
        """Get the data of order"""
        id = parameters["id"]
        url = f"{self.base_url}/dln/order/{id}"
        return await self._fetch(url, "get order data")

    @Tool({
        "description": "Get the status of order",
        "parameters_schema": GetOrderStatusParameters,
    })
    async def get_order_status(self, parameters: dict):
        """Get the status of order"""
        id = parameters["id"]
        url = f"{self.base_url}/dln/order/{id}/status"
        return await self._fetch(url, "get order status")

    @Tool({
        "description":
        "Get the order IDs from the hash of the creation transaction",
        "parameters_schema": GetOrderIDsParameters,
    })
    async def get_order_IDs(self, parameters: dict):
        """Get the order IDs from the hash of the creation transaction"""
        hash = parameters["hash"]
        url = f"{self.base_url}/dln/tx/{hash}/order-ids"
        return await self._fetch(url, "get order IDs")

    @Tool({
        "description": "Generate a transaction that cancels the given order",
        "parameters_schema": CancelOrderParameters,
    })
    async def cancel_order(self, parameters: dict):
        """Generate a transaction that cancels the given order"""
        id = parameters["id"]
        url = f"{self.base_url}/dln/order/{id}/cancel-tx"
        return await self._fetch(url, "cancel order")

    @Tool({
        "description":
        "Generate a transaction that cancels external call in the given order",
        "parameters_schema": CancelExternalCallParameters,
    })
    async def cancel_external_call(self, parameters: dict):
        """Generate a transaction that cancels external call in the given order"""
        id = parameters["id"]
        url = f"{self.base_url}/dln/order/{id}/extcall-cancel-tx"
        return await self._fetch(url, "cancel external call")

    @Tool({
        "description":
        "Generate the data for a transaction to place a cross-chain DLN order",
        "parameters_schema": CreateOrderTransactionParameters,
    })
    async def create_order_transaction(self, parameters: dict):
        """Generate the data for a transaction to place a cross-chain DLN order"""
        # Required parameters
        base_params = {
            "srcChainId": parameters["srcChainId"],
            "srcChainTokenIn": parameters["srcChainTokenIn"],
            "srcChainTokenInAmount": parameters["srcChainTokenInAmount"],
            "dstChainId": parameters["dstChainId"],
            "dstChainTokenOut": parameters["dstChainTokenOut"],
        }

        # Optional parameters - only add them if they exist in parameters
        optional_params = {
            "dstChainTokenOutAmount":
            parameters.get("dstChainTokenOutAmount", "auto"),
            "additionalTakerRewardBps":
            parameters.get("additionalTakerRewardBps"),
            "srcIntermediaryTokenAddress":
            parameters.get("srcIntermediaryTokenAddress"),
            "dstIntermediaryTokenAddress":
            parameters.get("dstIntermediaryTokenAddress"),
            "dstIntermediaryTokenSpenderAddress":
            parameters.get("dstIntermediaryTokenSpenderAddress"),
            "intermediaryTokenUSDPrice":
            parameters.get("intermediaryTokenUSDPrice"),
            "dstChainTokenOutRecipient":
            parameters.get("dstChainTokenOutRecipient"),
            "senderAddress":
            parameters.get("senderAddress"),
            "srcChainOrderAuthorityAddress":
            parameters.get("srcChainOrderAuthorityAddress"),
            "srcAllowedCancelBeneficiary":
            parameters.get("srcAllowedCancelBeneficiary"),
            "referralCode":
            parameters.get("referralCode", 31494),
            "affiliateFeePercent":
            parameters.get("affiliateFeePercent", 0),
            "affiliateFeeRecipient":
            parameters.get("affiliateFeeRecipient"),
            "srcChainTokenInSenderPermit":
            parameters.get("srcChainTokenInSenderPermit"),
            "dstChainOrderAuthorityAddress":
            parameters.get("dstChainOrderAuthorityAddress"),
            "enableEstimate":
            parameters.get("enableEstimate"),
            "allowedTaker":
            parameters.get("allowedTaker"),
            "dlnHook":
            parameters.get("dlnHook"),
            "prependOperatingExpenses":
            parameters.get("prependOperatingExpenses", False),
            "metadata":
            parameters.get("metadata"),
            "ptp":
            parameters.get("ptp"),
            "skipSolanaRecipientValidation":
            parameters.get("skipSolanaRecipientValidation", False)
        }

        # Remove None values from optional parameters
        optional_params = {
            k: v
            for k, v in optional_params.items() if v is not None
        }

        # Combine all parameters
        all_params = {**base_params, **optional_params}

        # Construct URL with query parameters
        query_string = urlencode(all_params)
        url = f"{self.base_url}/dln/order/create-tx?{query_string}"

        return await self._fetch(url, "create order transaction")

    @Tool({
        "description": "Get the data for a single chain swap estimation",
        "parameters_schema": SingleChainSwapEstimationParameters,
    })
    async def single_chain_swap_estimation(self, parameters: dict):
        """Get the data for a single chain swap estimation"""
        base_params = {
            "chainId": parameters["chainId"],
            "tokenIn": parameters["tokenIn"],
            "tokenInAmount": parameters["tokenInAmount"],
            "tokenOut": parameters["tokenOut"],
        }

        optional_params = {
            "slippage": parameters.get("slippage", "auto"),
            "affiliateFeePercent": parameters.get("affiliateFeePercent", 0),
            "affiliateFeeRecipient": parameters.get("affiliateFeeRecipient"),
        }

        optional_params = {
            k: v
            for k, v in optional_params.items() if v is not None
        }

        all_params = {**base_params, **optional_params}

        query_string = urlencode(all_params)
        url = f"{self.base_url}/chain/estimation?{query_string}"

        return await self._fetch(url, "single chain swap estimation")

    @Tool({
        "description": "Get the data for a single chain swap transaction",
        "parameters_schema": SingleChainSwapTransactionParameters,
    })
    async def single_chain_swap_transaction(self, parameters: dict):
        """Get the data for a single chain swap transaction"""
        base_params = {
            "chainId": parameters["chainId"],
            "tokenIn": parameters["tokenIn"],
            "tokenInAmount": parameters["tokenInAmount"],
            "tokenOut": parameters["tokenOut"],
            "tokenOutRecipient": parameters["tokenOutRecipient"],
        }

        optional_params = {
            "slippage": parameters.get("slippage", "auto"),
            "affiliateFeePercent": parameters.get("affiliateFeePercent", 0),
            "affiliateFeeRecipient": parameters.get("affiliateFeeRecipient"),
            "senderAddress": parameters.get("senderAddress"),
        }

        optional_params = {
            k: v
            for k, v in optional_params.items() if v is not None
        }

        all_params = {**base_params, **optional_params}

        query_string = urlencode(all_params)
        url = f"{self.base_url}/chain/transaction?{query_string}"

        return await self._fetch(url, "single chain swap transaction")
