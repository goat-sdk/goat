from typing import Dict, List, Optional, Union, TypeVar, Type

from .api_client import Call
from .evm_smart_wallet import SmartWalletClient as EVMSmartWalletClient
from .evm_smart_wallet import smart_wallet_factory as evm_smart_wallet_factory
from .solana_smart_wallet import SolanaSmartWalletClient
from .solana_smart_wallet_factory import solana_smart_wallet_factory

EVMSmartWallet = EVMSmartWalletClient
SolanaSmartWallet = SolanaSmartWalletClient

T = TypeVar('T', EVMSmartWallet, SolanaSmartWallet)
SmartWallet = Union[EVMSmartWallet, SolanaSmartWallet]

__all__ = [
    'EVMSmartWallet',
    'SolanaSmartWallet',
    'SmartWallet',
    'evm_smart_wallet_factory',
    'solana_smart_wallet_factory',
    'build_transaction_data'
]


def build_transaction_data(
    recipient_address: str,
    abi: Optional[List] = None,
    function_name: Optional[str] = None,
    args: Optional[List] = None,
    value: Optional[int] = None
) -> Call:
    """Build transaction data for smart wallet calls."""
    from .evm_smart_wallet import build_transaction_data as evm_build_transaction_data
    return evm_build_transaction_data(recipient_address, abi, function_name, args, value)
