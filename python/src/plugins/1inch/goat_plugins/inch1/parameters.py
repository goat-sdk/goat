from pydantic import BaseModel, Field
from typing import Optional

class GetBalancesParameters(BaseModel):
    wallet_address: str = Field(
        ...,
        description="The wallet address to check balances for"
    )
    chain_id: int = Field(
        1,  # Default to Ethereum mainnet
        description="The chain ID to query balances on (e.g., 1 for Ethereum mainnet)"
    )
