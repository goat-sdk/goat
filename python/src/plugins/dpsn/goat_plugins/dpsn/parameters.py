from pydantic import BaseModel, Field
from typing import Optional


class SubscribeQueryParameters(BaseModel):
    dpsn_topic: str = Field(
        description="An example topic to subscribe to (e.g.,""0xe14768a6d8798e4390ec4cb8a4c991202c2115a5cd7a6c0a7ababcaf93b4d2d4/BTCUSDT/ticker)"
    )
   

class UnsubscribeQueryParameters(BaseModel):
    dpsn_topic: str = Field(
        description="An example topic to unsubscribe from (e.g.,""0xe14768a6d8798e4390ec4cb8a4c991202c2115a5cd7a6c0a7ababcaf93b4d2d4/BTCUSDT/ticker)"
    )
   

