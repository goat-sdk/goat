from pydantic import BaseModel, Field


class GetTokenInfoBySymbolParameters(BaseModel):
    symbol: str = Field(description="The symbol of the token to get the info of")


class GetTokenBalanceParameters(BaseModel):
    wallet: str = Field(description="The address to get the balance of")
    tokenAddress: str = Field(
        description="The address of the token to get the balance of"
    )


class TransferParameters(BaseModel):
    tokenAddress: str = Field(
        description="The address of the token to get the balance of"
    )
    to: str = Field(description="The address to transfer the token to")
    amount: str = Field(description="The amount of tokens to transfer in base units")


class GetTokenTotalSupplyParameters(BaseModel):
    tokenAddress: str = Field(
        description="The address of the token to get the balance of"
    )


class GetTokenAllowanceParameters(BaseModel):
    tokenAddress: str = Field(
        description="The address of the token to get the balance of"
    )
    owner: str = Field(description="The address to check the allowance of")
    spender: str = Field(description="The address to check the allowance for")


class ApproveParameters(BaseModel):
    tokenAddress: str = Field(
        description="The address of the token to get the balance of"
    )
    spender: str = Field(description="The address to approve the allowance to")
    amount: str = Field(description="The amount of tokens to approve in base units")


class TransferFromParameters(BaseModel):
    tokenAddress: str = Field(
        description="The address of the token to get the balance of"
    )
    from_: str = Field(
        alias="from", description="The address to transfer the token from"
    )
    to: str = Field(description="The address to transfer the token to")
    amount: str = Field(description="The amount of tokens to transfer in base units")


class ConvertToBaseUnitParameters(BaseModel):
    amount: float = Field(
        description="The amount of tokens to convert from decimal units to base units"
    )
    decimals: int = Field(description="The number of decimals of the token")


class ConvertFromBaseUnitParameters(BaseModel):
    amount: float = Field(
        description="The amount of tokens to convert from base units to decimal units"
    )
    decimals: int = Field(description="The number of decimals of the token")
