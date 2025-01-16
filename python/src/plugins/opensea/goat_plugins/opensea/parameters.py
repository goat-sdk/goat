from pydantic import BaseModel, Field
from typing import List, Optional


class GetNftCollectionStatisticsParameters(BaseModel):
    collectionSlug: str = Field(
        ...,
        description="The slug of the NFT collection on OpenSea"
    )


class GetNftSalesParameters(BaseModel):
    collectionSlug: str = Field(
        ...,
        description="The slug of the NFT collection on OpenSea"
    )


class NftCollectionStatisticsTotal(BaseModel):
    volume: float
    sales: int
    average_price: float
    num_owners: int
    market_cap: float
    floor_price: float
    floor_price_symbol: str


class NftCollectionStatisticsInterval(BaseModel):
    interval: str
    volume: float
    volume_diff: float
    volume_change: float
    sales: int
    sales_diff: int
    average_price: float


class NftCollectionStatisticsResponse(BaseModel):
    total: NftCollectionStatisticsTotal
    intervals: List[NftCollectionStatisticsInterval]


class NftDetails(BaseModel):
    identifier: str
    collection: str
    contract: str
    token_standard: str
    name: str
    description: str
    image_url: str
    display_image_url: str
    display_animation_url: Optional[str]
    metadata_url: str
    opensea_url: str
    updated_at: str
    is_disabled: bool
    is_nsfw: bool


class PaymentDetails(BaseModel):
    quantity: str
    token_address: str
    decimals: int
    symbol: str


class NftSaleEvent(BaseModel):
    event_type: str
    order_hash: str
    chain: str
    protocol_address: str
    closing_date: int
    nft: NftDetails
    quantity: int
    seller: str
    buyer: str
    payment: PaymentDetails
    transaction: str
    event_timestamp: int


class NftSalesResponse(BaseModel):
    asset_events: List[NftSaleEvent]
    next: str
