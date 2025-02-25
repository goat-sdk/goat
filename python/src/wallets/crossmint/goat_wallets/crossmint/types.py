from typing import NotRequired, TypedDict, Optional, Dict, Union, Literal
from solders.keypair import Keypair

class LinkedUser(TypedDict):
    """Type definition for a linked user."""
    email: NotRequired[str]
    phone: NotRequired[str]
    userId: NotRequired[int]

class TransactionApproval(TypedDict):
    """Type definition for a transaction approval."""
    signer: str
    signature: Optional[str]

class BaseFireblocksSigner(TypedDict):
    """Base type for Fireblocks-based signers."""
    type: Literal["solana-fireblocks-custodial", "evm-fireblocks-custodial"]  # Add all possible values

class SolanaKeypairSigner(TypedDict):
    type: Literal["solana-keypair"]
    keyPair: Keypair

class SolanaFireblocksSigner(TypedDict):
    type: Literal["solana-fireblocks-custodial"]

class BaseWalletConfig(TypedDict):
    """Base configuration for any wallet type."""
    adminSigner: Union[SolanaKeypairSigner, SolanaFireblocksSigner]

class BaseWalletOptions(TypedDict):
    """Base options for any wallet type."""
    config: BaseWalletConfig
    linkedUser: Optional[LinkedUser] 