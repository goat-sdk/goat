from pydantic import BaseModel, Field


class GetTokenInfoByTickerParameters(BaseModel):
    ticker: str = Field(
        description="The ticker symbol of the token to look up (e.g., 'BTC', 'ETH', 'USDC')"
    )