from abc import ABC, abstractmethod
from typing import List

from goat_sdk.core.tools import DeferredTool
from goat_sdk.core.wallets import WalletClient, Chain


class Plugin[TWalletClient: WalletClient](ABC):
    """
    Plugin interface that can be chain-specific or chain-agnostic.
    Defaults to WalletClient for chain-agnostic plugins.
    """

    def __init__(self, name: str):
        self.name = name

    @abstractmethod
    def supports_chain(self, chain: Chain) -> bool:
        """Check if the plugin supports a particular chain."""
        raise NotImplementedError

    @abstractmethod
    def supports_smart_wallets(self) -> bool:
        """Check if the plugin supports smart wallets."""
        raise NotImplementedError

    @abstractmethod
    async def get_tools(self, chain: Chain) -> List[DeferredTool[TWalletClient]]:
        """Get the tools supported by the plugin."""
        raise NotImplementedError
