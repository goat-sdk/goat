import os
from goat.types.chain import EvmChain, SolanaChain
from goat_plugins.uniswap import uniswap, UniswapPluginOptions

def test_plugin_instantiation():
    """Test that the plugin can be instantiated without errors."""
    api_key = os.environ.get("UNISWAP_API_KEY")
    assert api_key is not None, "UNISWAP_API_KEY environment variable is required"
    
    options = UniswapPluginOptions(api_key=api_key)
    plugin = uniswap(options)
    
    assert plugin is not None
    assert plugin.name == "uniswap"
    
    # Test chain support
    ethereum_chain: EvmChain = {"type": "evm", "id": 1}  # Ethereum mainnet
    polygon_chain: EvmChain = {"type": "evm", "id": 137}  # Polygon
    solana_chain: SolanaChain = {"type": "solana"}  # Solana chain
    unknown_chain: EvmChain = {"type": "evm", "id": 999}  # Unknown EVM chain
    
    assert plugin.supports_chain(ethereum_chain)
    assert plugin.supports_chain(polygon_chain)
    assert not plugin.supports_chain(solana_chain)
    assert not plugin.supports_chain(unknown_chain)
