from dataclasses import dataclass
from goat.classes.plugin_base import PluginBase
from .service import CoinmarketcapService


@dataclass
class CoinmarketcapPluginOptions:
    api_key: str


class CoinmarketcapPlugin(PluginBase):
    def __init__(self, options: CoinmarketcapPluginOptions):
        super().__init__("coinmarketcap", [CoinmarketcapService(options.api_key)])

    def supports_chain(self, chain) -> bool:
        return True


def coinmarketcap(options: CoinmarketcapPluginOptions) -> CoinmarketcapPlugin:
    return CoinmarketcapPlugin(options)
