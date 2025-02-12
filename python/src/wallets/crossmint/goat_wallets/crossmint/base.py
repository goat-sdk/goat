from abc import ABC, abstractmethod
from typing import List, Any
from goat import Chain


class UnsupportedOperationException(Exception):
    """Exception raised when an operation is not supported by the wallet or service."""
    pass


class PluginBase(ABC):
    def __init__(self, name: str, services: List[Any]):
        self.name = name
        self.services = services

    @abstractmethod
    def supports_chain(self, chain: Chain) -> bool:
        pass
