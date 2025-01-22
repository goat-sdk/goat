from pydantic import BaseModel, Field


class GetTokenMintAddressBySymbolParameters(BaseModel):
    symbol: str = Field(
        description="The symbol of the token to get the mint address of (e.g USDC, GOAT, SOL)"
    )


class GetTokenBalanceByMintAddressParameters(BaseModel):
    walletAddress: str = Field(
        description="The address to get the balance of"
    )
    mintAddress: str = Field(
        description="The mint address of the token to get the balance of"
    )


class TransferTokenByMintAddressParameters(BaseModel):
    mintAddress: str = Field(
        description="The mint address of the token to transfer"
    )
    to: str = Field(
        description="The address to transfer the token to"
    )
    amount: str = Field(
        description="The amount of tokens to transfer in base unit"
    )


class ConvertToBaseUnitParameters(BaseModel):
    amount: float = Field(
        description="The amount of tokens to convert to base unit"
    )
    decimals: int = Field(
        description="The decimals of the token"
    )
