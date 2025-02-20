from typing import List, Literal

# Define chain types
ChainType = Literal[
    'base',
    'polygon',
    'optimism',
    'arbitrum',
    'mode',
    'base-sepolia',
    'polygon-amoy',
    'optimism-sepolia',
    'arbitrum-sepolia',
    'mode-sepolia',
    'story-testnet'
]

# List of all supported chain identifiers
SUPPORTED_CHAINS: List[ChainType] = [
    # Mainnets
    'base',
    'polygon',
    'optimism',
    'arbitrum',
    'mode',
    
    # Testnets
    'base-sepolia',
    'polygon-amoy',
    'optimism-sepolia',
    'arbitrum-sepolia',
    'mode-sepolia',
    'story-testnet'
]

def is_supported_chain(chain: str) -> bool:
    """Check if a chain is supported.
    
    Args:
        chain: Chain identifier to check
        
    Returns:
        bool: True if chain is supported, False otherwise
    """
    return chain in SUPPORTED_CHAINS 