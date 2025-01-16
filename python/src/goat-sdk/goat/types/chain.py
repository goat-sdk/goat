from typing import TypedDict, Literal, Union

class EvmChain(TypedDict):
    """EVM chain type definition
    
    Args:
        type: Literal "evm" chain type identifier
        id: Chain ID number for EVM networks
    """
    type: Literal["evm"]
    id: int

class SolanaChain(TypedDict):
    """Solana chain type definition
    
    Args:
        type: Literal "solana" chain type identifier
    """
    type: Literal["solana"]

class AptosChain(TypedDict):
    """Aptos chain type definition
    
    Args:
        type: Literal "aptos" chain type identifier
    """
    type: Literal["aptos"]

class ChromiaChain(TypedDict):
    """Chromia chain type definition
    
    Args:
        type: Literal "chromia" chain type identifier
    """
    type: Literal["chromia"]

Chain = Union[EvmChain, SolanaChain, AptosChain, ChromiaChain]