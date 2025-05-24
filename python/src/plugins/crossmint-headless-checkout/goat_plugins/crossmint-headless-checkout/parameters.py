from pydantic import BaseModel, Field, validator
from typing import List, Optional, Union, Dict, Any


class PhysicalAddress(BaseModel):
    name: str = Field(description="Full name of the recipient")
    line1: str = Field(description="Street address, P.O. box, company name, c/o")
    line2: Optional[str] = Field(None, description="Apartment, suite, unit, building, floor, etc.")
    city: str = Field(description="City, district, suburb, town, or village")
    state: Optional[str] = Field(None, description="State, county, province, or region. Required for US addresses.")
    postalCode: str = Field(description="ZIP or postal code")
    country: str = Field(description="Two-letter country code (ISO 3166-1 alpha-2). Currently only US is supported.")

    @validator('country')
    def validate_country(cls, v):
        if v != "US":
            raise ValueError("Only 'US' country code is supported at this time")
        return v.upper()
    
    @validator('state')
    def validate_state(cls, v, values):
        if values.get('country') == "US" and not v:
            raise ValueError("State is required for US physical address")
        return v


class Recipient(BaseModel):
    email: str = Field(description="Email address for the recipient")
    physicalAddress: Optional[PhysicalAddress] = Field(
        None, 
        description="Physical shipping address for the recipient. Required when purchasing physical products."
    )


class Payment(BaseModel):
    method: str = Field(
        description="The blockchain network to use for the transaction (e.g., 'ethereum', 'ethereum-sepolia', 'base', 'base-sepolia', 'polygon', 'polygon-amoy', 'solana')"
    )
    currency: str = Field(
        description="The currency to use for payment (e.g., 'usdc')"
    )
    payerAddress: str = Field(
        description="The address that will pay for the transaction"
    )
    receiptEmail: Optional[str] = Field(
        None,
        description="Optional email to send payment receipt to"
    )

    @validator('method')
    def validate_method(cls, v):
        allowed_methods = ["ethereum", "ethereum-sepolia", "base", "base-sepolia", "polygon", "polygon-amoy", "solana"]
        if v not in allowed_methods:
            raise ValueError(f"Method must be one of: {', '.join(allowed_methods)}")
        return v

    @validator('currency')
    def validate_currency(cls, v):
        allowed_currencies = ["usdc"]
        if v not in allowed_currencies:
            raise ValueError(f"Currency must be one of: {', '.join(allowed_currencies)}")
        return v


class CollectionLineItem(BaseModel):
    collectionLocator: str = Field(
        description="The collection locator. Ex: 'crossmint:<crossmint_collection_id>', '<chain>:<contract_address>'"
    )
    callData: Optional[Dict[str, Any]] = None


class ProductLineItem(BaseModel):
    productLocator: str = Field(
        description="The product locator. Ex: 'amazon:<amazon_product_id>', 'amazon:<asin>'"
    )
    callData: Optional[Dict[str, Any]] = None


class BuyTokenParameters(BaseModel):
    recipient: Recipient = Field(
        description="Where the tokens will be sent to - either a wallet address or email, if email is provided a Crossmint wallet will be created and associated with the email"
    )
    payment: Payment = Field(
        description="Payment configuration - the desired blockchain, currency and address of the payer - optional receipt email, if an email recipient was not provided"
    )
    lineItems: List[Union[CollectionLineItem, ProductLineItem]] = Field(
        description="Array of items to purchase"
    )
