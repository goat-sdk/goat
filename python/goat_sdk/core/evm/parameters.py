from typing import Optional
from pydantic import BaseModel, Field


class GetETHBalanceParametersSchema(BaseModel):
    address: Optional[str] = Field(
        default="",
        description="The address to get the balance of, defaults to the address of the wallet",
    )

class GetAddressParametersSchema(BaseModel):
    pass
