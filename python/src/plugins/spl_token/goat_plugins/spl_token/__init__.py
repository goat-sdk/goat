from dataclasses import dataclass
from typing import Optional, List
from goat.classes.plugin_base import PluginBase
from .service import SplTokenService
from .tokens import Token, SolanaNetwork


@dataclass
class SplTokenPluginOptions:
    """Options for the SplTokenPlugin."""
    network: SolanaNetwork = "mainnet"
    tokens: Optional[List[Token]] = None


class SplTokenPlugin(PluginBase):
    def __init__(self, options: SplTokenPluginOptions):
        super().__init__("spl_token", [
            SplTokenService(
                network=options.network,
                tokens=options.tokens
            )
        ])

    def supports_chain(self, chain) -> bool:
        return chain['type'] == 'solana'


def spl_token(options: SplTokenPluginOptions) -> SplTokenPlugin:
    return SplTokenPlugin(options)
