from typing import Optional
from dataclasses import dataclass, field
from enum import Enum, auto
from abc import ABC, abstractmethod


class ChainType(Enum):
    EVM = auto()
    SOLANA = auto()


@dataclass
class Chain:
    type: ChainType
    id: Optional[int] = None  # Optional for EVM


@dataclass
class Signature:
    signature: str = field()


@dataclass
class Balance:
    decimals: int
    symbol: str
    name: str
    value: int


class WalletClient(ABC):
    @abstractmethod
    def get_address(self) -> str:
        raise NotImplementedError

    @abstractmethod
    def get_chain(self) -> Chain:
        raise NotImplementedError

    @abstractmethod
    async def sign_message(self, message: str) -> Signature:
        raise NotImplementedError

    @abstractmethod
    async def balance_of(self, address: str) -> Balance:
        raise NotImplementedError
