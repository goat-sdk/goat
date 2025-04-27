from pydantic import BaseModel, Field

class GetTokenInfoByTickerParameters(BaseModel):
    ticker: str = Field(
        description="The ticker symbol of the token to get information for (e.g., USDC, PEPE)"
    )

class ConvertToBaseUnitsParameters(BaseModel):
    amount: str = Field(
        description="The amount of tokens to convert to base units"
    )
    tokenAddress: str = Field(
        description="The token address to convert for, omit for native currency",
        default=None
    )

class ConvertFromBaseUnitsParameters(BaseModel):
    amount: str = Field(
        description="The amount in base units to convert to human-readable format"
    )
    tokenAddress: str = Field(
        description="The token address to convert for, omit for native currency",
        default=None
    )

class SendTokenParameters(BaseModel):
    recipient: str = Field(
        description="The address to send tokens to"
    )
    amountInBaseUnits: str = Field(
        description="The amount of tokens to send in base units"
    )
    tokenAddress: str = Field(
        description="The token address to send, omit for native currency",
        default=None
    )

class GetTokenAllowanceParameters(BaseModel):
    tokenAddress: str = Field(
        description="The token address to check allowance for"
    )
    owner: str = Field(
        description="The owner address"
    )
    spender: str = Field(
        description="The spender address"
    )

class ApproveParameters(BaseModel):
    tokenAddress: str = Field(
        description="The token address to approve"
    )
    spender: str = Field(
        description="The spender address to approve"
    )
    amount: str = Field(
        description="The amount to approve in base units"
    )

class RevokeApprovalParameters(BaseModel):
    tokenAddress: str = Field(
        description="The token address to revoke approval for"
    )
    spender: str = Field(
        description="The spender address to revoke approval from"
    )

class TransferFromParameters(BaseModel):
    tokenAddress: str = Field(
        description="The token address to transfer"
    )
    from_: str = Field(
        alias="from",
        description="The address to transfer from"
    )
    to: str = Field(
        description="The address to transfer to"
    )
    amount: str = Field(
        description="The amount to transfer in base units"
    )
