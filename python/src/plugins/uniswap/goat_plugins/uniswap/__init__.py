from dataclasses import dataclass
from goat.classes.plugin_base import PluginBase
from .service import UniswapService


@dataclass
class UniswapPluginOptions:
    """Options for the UniswapPlugin."""
    api_key: str  # API key for external service integration
    base_url: str = "https://api.uniswap.org/v2"  # Base URL for Uniswap API


class UniswapPlugin(PluginBase):
    """Uniswap plugin for token swaps on supported EVM chains."""
    def __init__(self, options: UniswapPluginOptions):
        super().__init__("uniswap", [UniswapService(options.api_key, options.base_url)])

    def supports_chain(self, chain) -> bool:
        """Check if the chain is supported by Uniswap.
        
        Currently supports: Mainnet, Polygon, Avalanche, Base, Optimism, Zora, Arbitrum, Celo
        """
        if chain['type'] != 'evm':
            return False
            
        # List of supported chain IDs from uniswap.plugin.ts
        SUPPORTED_CHAIN_IDS = [1, 137, 43114, 8453, 10, 7777777, 42161, 42220]  # Mainnet, Polygon, Avalanche, Base, Optimism, Zora, Arbitrum, Celo
        return chain['id'] in SUPPORTED_CHAIN_IDS


def uniswap(options: UniswapPluginOptions) -> UniswapPlugin:
    """Create a new instance of the Uniswap plugin.
    
    Args:
        options: Configuration options for the plugin
        
    Returns:
        A configured UniswapPlugin instance
    """
    return UniswapPlugin(options)
