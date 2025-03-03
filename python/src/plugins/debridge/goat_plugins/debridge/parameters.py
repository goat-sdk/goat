from pydantic import BaseModel, Field
from typing import Optional


class EmptyParameters(BaseModel):
    pass


class GetTokenListParameters(BaseModel):
    chainId: str = Field(description="ID of a chain")


class GetOrderDataParameters(BaseModel):
    id: str = Field(description="ID of the order")


class GetOrderStatusParameters(BaseModel):
    id: str = Field(description="ID of the order")


class GetOrderIDsParameters(BaseModel):
    hash: str = Field(description="Hash of the creation transaction")


class CancelOrderParameters(BaseModel):
    id: str = Field(description="ID of the order")


class CancelExternalCallParameters(BaseModel):
    id: str = Field(description="ID of the order")


class CreateOrderTransactionParameters(BaseModel):
    srcChainId: str = Field(
        description=
        "An ID of a source chain, a chain where the cross-chain swap will start"
    )
    srcChainTokenIn: str = Field(
        description="An address (on a source chain) of an input token to swap")
    srcChainTokenInAmount: str = Field(
        description="An amount of input tokens to swap")
    dstChainId: str = Field(
        description=
        "An ID of a destination chain, a chain where the cross-chain swap will finish. Must differ from srcChainId!"
    )
    dstChainTokenOut: str = Field(
        description="An address (on a destination chain) of a target token")
    dstChainTokenOutAmount: Optional[str] = Field(
        default="auto",
        description=
        "Amount of the target asset the market maker expects to receive upon order fulfillment.",
    )
    additionalTakerRewardBps: Optional[int] = Field(
        description=
        "additionalTakerRewardBps is additionally laid in on top of default taker margin"
    )
    srcIntermediaryTokenAddress: Optional[str] = Field(
        description=
        "An address (on a source chain) of an intermediary token a user's input funds should be swapped to prior order creation"
    )
    dstIntermediaryTokenAddress: Optional[str] = Field(
        description=
        "An address (on a destination chain) of an intermediary token whose value assumed to be equal to the value of srcIntermediaryTokenAddress"
    )
    dstIntermediaryTokenSpenderAddress: Optional[str] = Field(
        description=
        "Applicable to a EVM-compatible destination chain. An address (on a EVM-compatible destination chain) assumed as a spender of the intermediary token (set as dstIntermediaryTokenAddress) during order fulfillment"
    )
    intermediaryTokenUSDPrice: Optional[float] = Field(
        description=
        "A value (a spot price) of the given intermediary token expressed in US dollars"
    )
    dstChainTokenOutRecipient: Optional[str] = Field(
        description=
        "Address (on the destination chain) where target tokens should be transferred to after the swap. Required for transaction construction, otherwise only the quote is returned!"
    )
    senderAddress: Optional[str] = Field(
        description=
        "Address (on the source chain) who submits input tokens for a cross-chain swap"
    )
    srcChainOrderAuthorityAddress: Optional[str] = Field(
        description=
        "Address (on the source chain) who submits input tokens for a cross-chain swap. Required for transaction construction, otherwise only the quote is returned!"
    )
    srcAllowedCancelBeneficiary: Optional[str] = Field(
        description=
        "Fixed recipient of the funds of an order in case it is being cancelled. If not set, the recipient could be set later upon order cancellation"
    )
    referralCode: Optional[float] = Field(
        default=31494,
        description=
        "Your referral code which can be generated here: https://app.debridge.finance/refer",
    )
    affiliateFeePercent: Optional[float] = Field(
        default=0,
        description=
        "The share of the input amount to be distributed to the affiliateFeeRecipient (if given) address as an affiliate fee",
    )
    affiliateFeeRecipient: Optional[str] = Field(
        description=
        "An address (on an origin chain) that will receive affiliate fees according to the affiliateFeePercent parameter"
    )
    srcChainTokenInSenderPermit: Optional[str] = Field(
        description=
        "Typically, a sender is required to approve token transfer to deBridge forwarder for further transfer and swap"
    )
    dstChainOrderAuthorityAddress: Optional[str] = Field(
        description=
        "Address on the destination chain whom should be granted the privileges to manage the order (patch, cancel, etc). Required for transaction construction, otherwise only the quote is returned!"
    )
    enableEstimate: Optional[bool] = Field(
        description=
        "This flag forces deSwap API to validate the resulting transaction and estimate its gas consumption"
    )
    allowedTaker: Optional[str] = Field(
        description="An address (on a destination chain) of a allowed taker")
    dlnHook: Optional[str] = Field(
        description="JSON representing a DLN Hook to be attached to an order")
    prependOperatingExpenses: Optional[bool] = Field(
        default=False,
        description=
        "Tells API server to prepend operating expenses to the input amount",
    )
    metadata: Optional[str] = Field(default=False, description="Metadata")
    ptp: Optional[bool] = Field(
        default=False,
        description=
        "Forces a P2P order where input and output tokens are left intact",
    )
    skipSolanaRecipientValidation: Optional[bool] = Field(
        default=False,
        description=
        "Skip system address validation dstChainTokenOutRecipient in Solana",
    )


class SingleChainSwapEstimationParameters(BaseModel):
    chainId: str = Field(
        description="An ID of a chain, a chain where the swap must be performed"
    )
    tokenIn: str = Field(description="An address of an input token to swap")
    tokenInAmount: str = Field(description="An amount of input tokens to swap")
    slippage: Optional[str] = Field(
        default="auto",
        description=
        "A slippage constraint (in %) is a safeguard during swaps (on both source and destination chains, if applicable). It is also used to calculate the minimum possible outcome during estimation",
    )
    tokenOut: str = Field(description="An address of a target token")
    affiliateFeePercent: Optional[float] = Field(
        default=0,
        description=
        "The share of the input amount to be distributed to the affiliateFeeRecipient (if given) address as an affiliate fee",
    )
    affiliateFeeRecipient: Optional[str] = Field(
        description=
        "An address (on an origin chain) that will receive affiliate fees according to the affiliateFeePercent parameter"
    )


class SingleChainSwapTransactionParameters(BaseModel):
    chainId: str = Field(
        description="An ID of a chain, a chain where the swap must be performed"
    )
    tokenIn: str = Field(description="An address of an input token to swap")
    tokenInAmount: str = Field(description="An amount of input tokens to swap")
    slippage: Optional[str] = Field(
        default="auto",
        description=
        "A slippage constraint (in %) is a safeguard during swaps (on both source and destination chains, if applicable). It is also used to calculate the minimum possible outcome during estimation",
    )
    tokenOut: str = Field(description="An address of a target token")
    tokenOutRecipient: str = Field(
        description="Address who receives the tokens from the swap")
    affiliateFeePercent: Optional[float] = Field(
        default=0,
        description=
        "The share of the input amount to be distributed to the affiliateFeeRecipient (if given) address as an affiliate fee",
    )
    affiliateFeeRecipient: Optional[str] = Field(
        description=
        "An address (on an origin chain) that will receive affiliate fees according to the affiliateFeePercent parameter"
    )
    senderAddress: Optional[str] = Field(
        description=
        "Address (on the source chain) who submits input tokens for a cross-chain swap"
    )
