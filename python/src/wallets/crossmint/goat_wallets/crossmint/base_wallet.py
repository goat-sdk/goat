from typing import Dict, Optional
from goat.classes.wallet_client_base import Balance, Signature
from .api_client import CrossmintWalletsAPI


def get_locator(address: Optional[str] = None, linked_user: Optional[Dict] = None) -> str:
    """Get wallet locator from address or linked user."""
    if linked_user:
        if "email" in linked_user:
            return f"email:{linked_user['email']}"
        if "phone" in linked_user:
            return f"phone:{linked_user['phone']}"
        if "userId" in linked_user:
            return f"userId:{linked_user['userId']}"
    
    if not address:
        raise ValueError("A wallet address is required if no linked user is provided")
    
    return address


class BaseWalletClient:
    """Base class for Crossmint wallet implementations."""
    
    def __init__(
        self,
        address: str,
        api_client: CrossmintWalletsAPI,
        chain: str
    ):
        """Initialize base wallet client.
        
        Args:
            address: Wallet address
            api_client: Crossmint API client
            chain: Chain identifier
        """
        self._address = address
        self._client = api_client
        self._chain = chain
        self._locator = get_locator(address)
    
    def get_address(self) -> str:
        """Get wallet address."""
        return self._address
