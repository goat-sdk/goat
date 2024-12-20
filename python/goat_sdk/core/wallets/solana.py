from abc import abstractmethod
from dataclasses import dataclass
from typing import List, Any

from goat_sdk.core.wallets.core import Chain, ChainType, WalletClient
from solders.instruction import Instruction


@dataclass
class SolanaChain(Chain):
    type: ChainType = ChainType.SOLANA


def is_solana_chain(chain: Chain) -> bool:
    return chain.type == ChainType.SOLANA


def is_solana_wallet_client(wallet: WalletClient) -> bool:
    return wallet.get_chain().type == ChainType.SOLANA


class SolanaTransaction:
    def __init__(self, instructions: List[Instruction]):
        self.instructions = instructions


class SolanaReadRequest:
    def __init__(self, account_address: str):
        self.account_address = account_address


class SolanaReadResult:
    def __init__(self, value: Any):
        self.value = value


class SolanaTransactionResult:
    def __init__(self, hash: str):
        self.hash = hash


class SolanaWalletClient(WalletClient):
    @abstractmethod
    async def send_transaction(
        self, transaction: SolanaTransaction
    ) -> SolanaTransactionResult:
        raise NotImplementedError

    @abstractmethod
    async def read(self, request: SolanaReadRequest) -> SolanaReadResult:
        raise NotImplementedError

    def get_chain(self) -> SolanaChain:
        return SolanaChain()
