from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class SwapType(str, Enum):
    EXACT_INPUT = "EXACT_INPUT"
    EXACT_OUTPUT = "EXACT_OUTPUT"


class Protocol(str, Enum):
    V2 = "V2"
    V3 = "V3"


class Routing(str, Enum):
    CLASSIC = "CLASSIC"
    UNISWAPX = "UNISWAPX"
    UNISWAPX_V2 = "UNISWAPX_V2"
    V3_ONLY = "V3_ONLY"
    V2_ONLY = "V2_ONLY"
    BEST_PRICE = "BEST_PRICE"
    BEST_PRICE_V2 = "BEST_PRICE_V2"
    FASTEST = "FASTEST"


class CheckApprovalParameters(BaseModel):
    token: str = Field(description="The token address to check approval for")
    amount: str = Field(description="The amount of tokens to approve in base units")
    walletAddress: str = Field(description="The wallet address to check approval for")


class GetQuoteParameters(BaseModel):
    tokenIn: str = Field(description="The address of the input token")
    tokenOut: str = Field(description="The address of the output token")
    tokenOutChainId: Optional[int] = Field(
        None,
        description="The chain ID of the output token. Defaults to the same chain as the input token"
    )
    amount: str = Field(description="The amount of tokens to swap in base units")
    type: SwapType = Field(
        default=SwapType.EXACT_INPUT,
        description="The type of swap to perform"
    )
    protocols: List[Protocol] = Field(
        description="The protocols to use for the swap"
    )
    routingPreference: Routing = Field(
        default=Routing.CLASSIC,
        description="The routing preference determines which protocol to use for the swap"
    )
