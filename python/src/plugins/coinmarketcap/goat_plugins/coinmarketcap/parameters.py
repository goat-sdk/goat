from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from enum import Enum


class SortField(str, Enum):
    MARKET_CAP = "market_cap"
    NAME = "name"
    SYMBOL = "symbol"
    DATE_ADDED = "date_added"
    MARKET_CAP_STRICT = "market_cap_strict"
    PRICE = "price"
    CIRCULATING_SUPPLY = "circulating_supply"
    TOTAL_SUPPLY = "total_supply"
    MAX_SUPPLY = "max_supply"
    NUM_MARKET_PAIRS = "num_market_pairs"
    VOLUME_24H = "volume_24h"
    PERCENT_CHANGE_1H = "percent_change_1h"
    PERCENT_CHANGE_24H = "percent_change_24h"
    PERCENT_CHANGE_7D = "percent_change_7d"
    MARKET_CAP_BY_TOTAL_SUPPLY_STRICT = "market_cap_by_total_supply_strict"
    VOLUME_7D = "volume_7d"
    VOLUME_30D = "volume_30d"


class SortDirection(str, Enum):
    ASC = "asc"
    DESC = "desc"


class CryptocurrencyType(str, Enum):
    ALL = "all"
    COINS = "coins"
    TOKENS = "tokens"


class AuxFields(str, Enum):
    NUM_MARKET_PAIRS = "num_market_pairs"
    CMC_RANK = "cmc_rank"
    DATE_ADDED = "date_added"
    TAGS = "tags"
    PLATFORM = "platform"
    MAX_SUPPLY = "max_supply"
    CIRCULATING_SUPPLY = "circulating_supply"
    TOTAL_SUPPLY = "total_supply"
    MARKET_CAP_BY_TOTAL_SUPPLY = "market_cap_by_total_supply"
    VOLUME_24H_REPORTED = "volume_24h_reported"
    VOLUME_7D = "volume_7d"
    VOLUME_7D_REPORTED = "volume_7d_reported"
    VOLUME_30D = "volume_30d"
    VOLUME_30D_REPORTED = "volume_30d_reported"
    IS_MARKET_CAP_INCLUDED_IN_CALC = "is_market_cap_included_in_calc"
    IS_ACTIVE = "is_active"
    IS_FIAT = "is_fiat"


class CryptocurrencyListingsParameters(BaseModel):
    start: Optional[int] = Field(None, description="Starting position of results")
    limit: Optional[int] = Field(None, description="Number of results to return")
    sort: Optional[SortField] = Field(
        default=SortField.MARKET_CAP,
        description="What field to sort the list by"
    )
    sort_dir: Optional[SortDirection] = Field(None, description="Direction to sort the list")
    cryptocurrency_type: Optional[CryptocurrencyType] = Field(None, description="Type of cryptocurrency to include")
    tag: Optional[str] = Field(None, description="Tag to filter by")
    aux: Optional[List[AuxFields]] = Field(None, description="Array of auxiliary fields to return")
    convert: Optional[str] = Field(None, description="Currency to convert prices to")


class CryptocurrencyQuotesLatestParameters(BaseModel):
    id: Optional[List[str]] = Field(None, description="One or more cryptocurrency IDs")
    symbol: Optional[List[str]] = Field(None, description="One or more cryptocurrency symbols")
    convert: Optional[str] = Field(None, description="Currency to convert prices to")
    aux: Optional[List[AuxFields]] = Field(None, description="Array of auxiliary fields to return")


class ExchangeListingsSortField(str, Enum):
    NAME = "name"
    VOLUME_24H = "volume_24h"
    VOLUME_24H_ADJUSTED = "volume_24h_adjusted"
    EXCHANGE_SCORE = "exchange_score"


class MarketType(str, Enum):
    ALL = "all"
    SPOT = "spot"
    DERIVATIVES = "derivatives"


class ExchangeAuxFields(str, Enum):
    NUM_MARKET_PAIRS = "num_market_pairs"
    TRAFFIC_SCORE = "traffic_score"
    RANK = "rank"
    EXCHANGE_SCORE = "exchange_score"
    EFFECTIVE_LIQUIDITY_24H = "effective_liquidity_24h"
    DATE_LAUNCHED = "date_launched"
    FIATS = "fiats"


class ExchangeListingsParameters(BaseModel):
    start: Optional[int] = Field(None, description="Starting position of results")
    limit: Optional[int] = Field(None, description="Number of results to return")
    sort: Optional[ExchangeListingsSortField] = Field(None, description="What field to sort the list by")
    sort_dir: Optional[SortDirection] = Field(None, description="Direction to sort the list")
    market_type: Optional[MarketType] = Field(None, description="Type of exchange market")
    aux: Optional[List[ExchangeAuxFields]] = Field(None, description="Array of auxiliary fields to return")
    convert: Optional[str] = Field(None, description="Currency to convert prices to")


class ExchangeQuotesLatestParameters(BaseModel):
    id: Optional[List[str]] = Field(None, description="One or more exchange IDs")
    slug: Optional[List[str]] = Field(None, description="One or more exchange slugs")
    convert: Optional[str] = Field(None, description="Currency to convert prices to")
    aux: Optional[List[ExchangeAuxFields]] = Field(None, description="Array of auxiliary fields to return")


class NewsType(str, Enum):
    NEWS = "news"
    COMMUNITY = "community"
    ALEXANDRIA = "alexandria"


class ContentType(str, Enum):
    ALL = "all"
    NEWS = "news"
    VIDEO = "video"
    AUDIO = "audio"


class Language(str, Enum):
    EN = "en"
    ZH = "zh"
    ZH_TW = "zh-tw"
    DE = "de"
    ID = "id"
    JA = "ja"
    KO = "ko"
    ES = "es"
    TH = "th"
    TR = "tr"
    VI = "vi"
    RU = "ru"
    FR = "fr"
    NL = "nl"
    AR = "ar"
    PT_BR = "pt-br"
    HI = "hi"
    PL = "pl"
    UK = "uk"
    FIL_RPH = "fil-rph"
    IT = "it"


class ContentLatestParameters(BaseModel):
    start: Optional[int] = Field(None, description="Starting position of results")
    limit: Optional[int] = Field(None, description="Number of results to return")
    id: Optional[List[str]] = Field(None, description="One or more cryptocurrency IDs")
    slug: Optional[List[str]] = Field(None, description="One or more cryptocurrency slugs, e.g bitcoin, ethereum, etc.")
    symbol: Optional[List[str]] = Field(None, description="One or more cryptocurrency symbols e.g BTC, ETH, etc.")
    news_type: Optional[NewsType] = Field(None, description="Type of news content to return")
    content_type: Optional[ContentType] = Field(None, description="Type of content category to return")
    category: Optional[str] = Field(None, description="Category of content to return Example: GameFi, DeFi, etc.")
    language: Optional[Language] = Field(None, description="Language of content to return")


class ListingStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    UNTRACKED = "untracked"


class MapSortField(str, Enum):
    CMC_RANK = "cmc_rank"
    ID = "id"
    NAME = "name"


class MapAuxFields(str, Enum):
    PLATFORM = "platform"
    FIRST_HISTORICAL_DATA = "first_historical_data"
    LAST_HISTORICAL_DATA = "last_historical_data"
    IS_ACTIVE = "is_active"
    STATUS = "status"


class CryptocurrencyMapParameters(BaseModel):
    listing_status: Optional[ListingStatus] = Field(None, description="Status of listings to return")
    start: Optional[int] = Field(None, description="Starting position of results")
    limit: Optional[int] = Field(None, description="Number of results to return")
    sort: Optional[MapSortField] = Field(None, description="What field to sort the list by")
    symbol: Optional[List[str]] = Field(None, description="Cryptocurrency symbol(s) to filter by")
    aux: Optional[List[MapAuxFields]] = Field(None, description="Array of auxiliary fields to return")


class CryptocurrencyOHLCVLatestParameters(BaseModel):
    id: Optional[List[str]] = Field(None, description="One or more cryptocurrency IDs")
    symbol: Optional[List[str]] = Field(None, description="One or more cryptocurrency symbols")
    convert: Optional[str] = Field(None, description="Currency to convert prices to")
    convert_id: Optional[str] = Field(None, description="Currency ID to convert prices to")
    skip_invalid: Optional[bool] = Field(None, description="Skip invalid currency conversions")


class TimePeriod(str, Enum):
    HOURS_24 = "24h"
    DAYS_7 = "7d"
    DAYS_30 = "30d"


class TimePeriodWithHour(str, Enum):
    HOUR_1 = "1h"
    HOURS_24 = "24h"
    DAYS_7 = "7d"
    DAYS_30 = "30d"


class CryptocurrencyTrendingLatestParameters(BaseModel):
    start: Optional[int] = Field(None, description="Starting position of results")
    limit: Optional[int] = Field(None, description="Number of results to return")
    time_period: Optional[TimePeriod] = Field(None, description="Time period for trending data")
    convert: Optional[str] = Field(None, description="Currency to convert prices to")
    convert_id: Optional[str] = Field(None, description="Currency ID to convert prices to")


class CryptocurrencyTrendingMostVisitedParameters(BaseModel):
    start: Optional[int] = Field(None, description="Starting position of results")
    limit: Optional[int] = Field(None, description="Number of results to return")
    time_period: Optional[TimePeriod] = Field(None, description="Time period for trending data")
    convert: Optional[str] = Field(None, description="Currency to convert prices to")
    convert_id: Optional[str] = Field(None, description="Currency ID to convert prices to")


class CryptocurrencyTrendingGainersLosersParameters(BaseModel):
    start: Optional[int] = Field(None, description="Starting position of results")
    limit: Optional[int] = Field(None, description="Number of results to return")
    time_period: Optional[TimePeriodWithHour] = Field(None, description="Time period for trending data")
    convert: Optional[str] = Field(None, description="Currency to convert prices to")
    convert_id: Optional[str] = Field(None, description="Currency ID to convert prices to")
    sort: Optional[Literal["percent_change_24h"]] = Field(None, description="What field to sort the list by")
    sort_dir: Optional[SortDirection] = Field(None, description="Direction to sort the list")
