from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Literal


class CoreSignerType(str, Enum):
    """Core signer types supported by Crossmint."""
    EVM_KEYPAIR = "evm-keypair"
    SOLANA_KEYPAIR = "solana-keypair"
    WEBAUTHN = "webauthn"
    EVM_FIREBLOCKS_CUSTODIAL = "evm-fireblocks-custodial"
    SOLANA_FIREBLOCKS_CUSTODIAL = "solana-fireblocks-custodial"
    EVM_KEYPAIR_SESSION = "evm-keypair-session"


class AdminSigner(BaseModel):
    """Configuration for admin signer in wallet creation."""
    type: CoreSignerType
    address: Optional[str] = None
    locator: Optional[str] = None
    signature: Optional[str] = None
    chain: Optional[str] = None


class CreateSmartWalletParameters(BaseModel):
    """Parameters for creating an EVM smart wallet."""
    admin_signer: Optional[AdminSigner] = Field(
        None,
        description="Optional admin signer configuration for the wallet"
    )


class CreateCustodialWalletParameters(BaseModel):
    """Parameters for creating a Solana custodial wallet."""
    linked_user: str = Field(
        description="User identifier to link the wallet to (email, phone, or user ID)"
    )


class CreateWalletRequest(BaseModel):
    """Request parameters for wallet creation."""
    type: str = Field(description="Wallet type (evm-smart-wallet or solana-mpc-wallet)")
    config: Optional[Dict[str, Any]] = Field(
        None,
        description="Optional configuration including admin signer"
    )
    linked_user: Optional[str] = Field(
        None,
        description="Optional user identifier to link the wallet to"
    )


class WalletResponse(BaseModel):
    """Response structure for wallet operations."""
    type: str
    address: str
    config: Dict[str, Any]
    linked_user: Optional[str] = None
    created_at: str


class Call(BaseModel):
    """Structure for EVM transaction calls."""
    to: str
    value: str
    data: str


class EVMTypedData(BaseModel):
    """EVM typed data structure for signing."""
    types: Dict[str, List[Dict[str, str]]]
    primaryType: str
    domain: Dict[str, Any]
    message: Dict[str, Any]

class TransactionParams(BaseModel):
    """Parameters for transaction creation."""
    calls: Optional[List[Call]] = None
    chain: Optional[Literal["ethereum", "polygon", "avalanche", "arbitrum", "optimism", "base", "sepolia"]] = None
    signer: Optional[str] = None
    transaction: Optional[str] = None
    signers: Optional[List[str]] = None


class ApprovalSubmission(BaseModel):
    """Structure for transaction/signature approvals."""
    signer: str
    message: str
    submitted_at: str
    signature: str
    metadata: Optional[Dict[str, Any]] = None


class TransactionApprovals(BaseModel):
    """Structure for transaction approvals."""
    pending: List[Dict[str, Any]]
    submitted: List[ApprovalSubmission]
    required: Optional[int] = None


class SignMessageRequest(BaseModel):
    """Request parameters for message signing."""
    type: str = Field(description="Message type (evm-message or solana-message)")
    params: Dict[str, Any] = Field(description="Message parameters including the message to sign")


class SignTypedDataRequest(BaseModel):
    """Request parameters for typed data signing."""
    type: Literal["evm-typed-data"]
    params: Dict[str, Any] = Field(
        ...,
        description="Parameters including typed data and chain",
        example={
            "typedData": "EVMTypedData",
            "chain": "string",
            "signer": "string"
        }
    )


class SignatureResponse(BaseModel):
    """Response structure for signature operations."""
    id: str
    wallet_type: str
    status: str
    output_signature: Optional[str] = None
    approvals: TransactionApprovals
    created_at: str


class TransactionResponse(BaseModel):
    """Response structure for transaction operations."""
    id: str
    wallet_type: str
    status: str
    approvals: Optional[TransactionApprovals] = None
    params: TransactionParams
    on_chain: Optional[Dict[str, Any]] = None
    created_at: str


class CollectionMetadata(BaseModel):
    name: str = Field(description="The name of the collection")
    description: str = Field(description="A description of the NFT collection")
    image: Optional[str] = Field(None, description="URL pointing to an image that represents the collection")
    symbol: Optional[str] = Field(None, description="Shorthand identifier for the NFT collection (Max length: 10)")


class CollectionParameters(BaseModel):
    metadata: CollectionMetadata = Field(
        default_factory=lambda: CollectionMetadata(
            name="My first Minting API Collection",
            description="An NFT Collection created with the Crossmint Minting API",
            image="https://www.crossmint.com/assets/crossmint/logo.png",
            symbol=None
        )
    )
    fungibility: Literal["semi-fungible", "non-fungible"] = Field(default="non-fungible")
    transferable: bool = Field(default=True)


class NFTAttribute(BaseModel):
    display_type: Literal["number", "boost_number", "boost_percentage"]
    value: str


class NFTMetadata(BaseModel):
    name: str = Field(description="The name of the NFT")
    description: str = Field(description="The description of the NFT")
    image: str = Field(description="URL pointing to the NFT image")
    animation_url: Optional[str] = Field(None, description="URL pointing to the NFT animation")
    attributes: Optional[List[NFTAttribute]] = Field(None, description="The attributes of the NFT")


class MintNFTParameters(BaseModel):
    collection_id: str = Field(description="The ID of the collection to mint the NFT in")
    recipient: str = Field(description="The recipient of the NFT")
    recipient_type: Literal["wallet", "email"] = Field(
        default="email",
        description="The type of the recipient"
    )
    metadata: NFTMetadata = Field(description="The metadata of the NFT")


class CreateWalletForTwitterUserParameters(BaseModel):
    """Parameters for creating a wallet for a Twitter user."""
    username: str = Field(description="The username of the Twitter / X user")
    chain: Literal["evm", "solana", "aptos", "cardano", "sui"] = Field(
        description="The chain of the wallet"
    )


class CreateWalletForEmailParameters(BaseModel):
    """Parameters for creating a wallet for an email user."""
    email: str = Field(description="The email address of the user")
    chain: Literal["evm", "solana", "aptos", "cardano", "sui"] = Field(
        description="The chain of the wallet"
    )


class GetWalletByTwitterUsernameParameters(BaseModel):
    """Parameters for retrieving a wallet by Twitter username."""
    username: str = Field(description="The username of the Twitter / X user")
    chain: str = Field(description="The chain of the wallet")


class GetWalletByEmailParameters(BaseModel):
    """Parameters for retrieving a wallet by email."""
    email: str = Field(description="The email address of the user")
    chain: str = Field(description="The chain of the wallet")


class RequestFaucetTokensParameters(BaseModel):
    """Parameters for requesting tokens from faucet."""
    wallet_address: str = Field(description="The wallet address to receive tokens")
    chain_id: str = Field(description="The chain ID for the faucet request")


class GetWalletParameters(BaseModel):
    """Parameters for retrieving wallet details."""
    locator: str = Field(description="The wallet locator")


class SignMessageCustodialParameters(BaseModel):
    """Parameters for signing a message with a custodial wallet."""
    locator: str = Field(description="The wallet locator")
    message: str = Field(description="The message to sign")


class SignMessageSmartParameters(BaseModel):
    """Parameters for signing a message with a smart wallet."""
    wallet_address: str = Field(description="The wallet address")
    message: str = Field(description="The message to sign")
    chain: str = Field(description="The chain of the wallet")
    signer: Optional[str] = Field(None, description="Optional signer address")


class SignTypedDataSmartParameters(BaseModel):
    """Parameters for signing typed data with a smart wallet."""
    wallet_address: str = Field(description="The wallet address")
    typed_data: Dict[str, Any] = Field(description="The typed data to sign")
    chain: str = Field(description="The chain of the wallet")
    signer: str = Field(description="The signer address")


class CheckSignatureStatusParameters(BaseModel):
    """Parameters for checking signature status."""
    signature_id: str = Field(description="The ID of the signature")
    wallet_address: str = Field(description="The wallet address")


class CreateTransactionCustodialParameters(BaseModel):
    """Parameters for creating a transaction with a custodial wallet."""
    locator: str = Field(description="The wallet locator")
    transaction: str = Field(description="The transaction data")


class CreateTransactionSmartParameters(BaseModel):
    """Parameters for creating a transaction with a smart wallet."""
    wallet_address: str = Field(description="The wallet address")
    calls: List[Call] = Field(description="The transaction calls")
    chain: str = Field(description="The chain of the wallet")
    signer: Optional[str] = Field(None, description="Optional signer address")


class ApprovalItem(BaseModel):
    """Structure for individual approval items."""
    signer: str = Field(description="The signer address")
    signature: str = Field(description="The signature")


class ApproveTransactionParameters(BaseModel):
    """Parameters for approving a transaction."""
    locator: str = Field(description="The wallet locator")
    transaction_id: str = Field(description="The transaction ID")
    approvals: List[ApprovalItem] = Field(description="List of transaction approvals")


class CheckTransactionStatusParameters(BaseModel):
    """Parameters for checking transaction status."""
    locator: str = Field(description="The wallet locator")
    transaction_id: str = Field(description="The transaction ID")


class EmptyParameters(BaseModel):
    """Empty parameter schema for endpoints that take no parameters."""
    pass
