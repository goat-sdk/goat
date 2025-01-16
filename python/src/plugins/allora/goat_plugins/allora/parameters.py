from pydantic import BaseModel, Field
from enum import Enum


class AlloraPricePredictionToken(str, Enum):
    BTC = "BTC"
    ETH = "ETH"


class AlloraPricePredictionTimeframe(str, Enum):
    FIVE_MIN = "5m"
    EIGHT_HOUR = "8h"


class GetAlloraPricePredictionParameters(BaseModel):
    ticker: AlloraPricePredictionToken = Field(
        description="The ticker of the currency for which to fetch a price prediction (BTC or ETH)."
    )
    timeframe: AlloraPricePredictionTimeframe = Field(
        description='The timeframe for the prediction (currently, either "5m" or "8h").'
    )
