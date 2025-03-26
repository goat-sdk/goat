from enum import Enum
from typing import Optional, List, Dict, Any, Union, Literal
from pydantic import BaseModel, Field, validator, root_validator


class PaymentMethod(str, Enum):
    """Payment method options."""
    ETHEREUM = "ethereum"
    ETHEREUM_SEPOLIA = "ethereum-sepolia"
    BASE = "base"
    BASE_SEPOLIA = "base-sepolia"
    POLYGON = "polygon"
    POLYGON_AMOY = "polygon-amoy"
    SOLANA = "solana"


class Currency(str, Enum):
    """Currency options."""
    USDC = "usdc"


class PhysicalAddress(BaseModel):
    """Physical address model for shipping NFTs."""
    name: str = Field(description="Name for the physical address")
    line1: str = Field(description="Address line 1")
    line2: Optional[str] = Field(None, description="Address line 2")
    city: str = Field(description="City")
    state: Optional[str] = Field(None, description="State/Province/Region - optional")
    postalCode: str = Field(description="Postal/ZIP code")
    country: str = Field(description="2-letter ISO country code")

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
    """Recipient model for Crossmint orders."""
    email: str = Field(description="Email of the recipient")
    physicalAddress: Optional[PhysicalAddress] = Field(None, description="Physical address for shipping")


class Payment(BaseModel):
    """Payment model for Crossmint orders."""
    method: PaymentMethod = Field(description="The blockchain network to use for the transaction")
    currency: Currency = Field(description="The currency to use for payment")
    payerAddress: str = Field(description="The address that will pay for the transaction")
    receiptEmail: Optional[str] = Field(None, description="Optional email to send payment receipt to")


class CollectionLocatorItem(BaseModel):
    """Item with collection locator."""
    collectionLocator: str = Field(
        description="The collection locator. Ex: 'crossmint:<crossmint_collection_id>', '<chain>:<contract_address>'"
    )
    callData: Optional[Dict[str, Any]] = Field(None, description="Optional call data")


class ProductLocatorItem(BaseModel):
    """Item with product locator."""
    productLocator: str = Field(
        description="The product locator. Ex: 'amazon:<amazon_product_id>', 'amazon:<asin>'"
    )
    callData: Optional[Dict[str, Any]] = Field(None, description="Optional call data")


class CreateAndPayOrderParameters(BaseModel):
    """Parameters for creating and paying for an order."""
    recipient: Recipient = Field(
        description="Where the tokens will be sent to - either a wallet address or email, "
                   "if email is provided a Crossmint wallet will be created and associated with the email"
    )
    payment: Payment = Field(
        description="Payment configuration - the desired blockchain, currency and address of the payer - "
                   "optional receipt email, if an email recipient was not provided"
    )
    lineItems: List[Union[CollectionLocatorItem, ProductLocatorItem]] = Field(
        description="Array of items to purchase"
    )
