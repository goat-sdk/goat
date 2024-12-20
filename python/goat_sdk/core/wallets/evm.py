from abc import abstractmethod
from dataclasses import dataclass
from typing import Any, Dict, Optional

from pydantic import Field

from goat_sdk.core.wallets.core import Chain, ChainType, WalletClient


@dataclass
class EVMChain(Chain):
    type: ChainType = ChainType.EVM


def is_evm_chain(chain: Chain) -> bool:
    return chain.type == ChainType.EVM


def is_evm_wallet_client(wallet: WalletClient) -> bool:
    return wallet.get_chain().type == ChainType.EVM


@dataclass
class EVMTransaction:
    to: str
    function_name: Optional[str] = ""
    args: Optional[Dict] = Field(default_factory=dict)
    value: Optional[int] = 0
    abi: Optional[str] = ""


@dataclass
class EVMReadRequest:
    address: str
    function_name: str
    abi: str
    args: Optional[Dict] = Field(default_factory=dict)


@dataclass
class EVMTransactionResult:
    hash: str
    status: str


@dataclass
class EVMReadResult:
    value: Any


class EVMWalletClient(WalletClient):
    @abstractmethod
    async def send_transaction(
        self, transaction: EVMTransaction
    ) -> EVMTransactionResult:
        raise NotImplementedError

    @abstractmethod
    async def read(self, request: EVMReadRequest) -> EVMReadResult:
        raise NotImplementedError

    @abstractmethod
    async def resolve_address(self, address: str) -> str:
        raise NotImplementedError

    def get_chain(self) -> EVMChain:
        return EVMChain()
