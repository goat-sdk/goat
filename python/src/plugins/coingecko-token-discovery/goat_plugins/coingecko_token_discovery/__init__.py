from dataclasses import dataclass

from goat.classes.plugin_base import PluginBase
from .service import CoinGeckoTokenDiscoveryService


@dataclass
class CoinGeckoTokenDiscoveryPluginOptions:
    api_key: str


class CoinGeckoTokenDiscoveryPlugin(PluginBase):
    def __init__(self, options: CoinGeckoTokenDiscoveryPluginOptions):
        super().__init__("coingecko-token-discovery", [CoinGeckoTokenDiscoveryService(options.api_key)])

    def supports_chain(self, chain) -> bool:
        return True


def coingecko_token_discovery(options: CoinGeckoTokenDiscoveryPluginOptions) -> CoinGeckoTokenDiscoveryPlugin:
    return CoinGeckoTokenDiscoveryPlugin(options)
