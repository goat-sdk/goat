from dataclasses import dataclass
from typing import List

from goat.classes.plugin_base import PluginBase
from goat.types.chain import Chain
from .service import Erc20Service
from .token import Token, get_tokens_for_network


@dataclass
class ERC20PluginOptions:
    tokens: List[Token]


class ERC20Plugin(PluginBase):
    def __init__(self, options: ERC20PluginOptions):
        super().__init__("erc20", [Erc20Service(options.tokens)])

    def supports_chain(self, chain: Chain) -> bool:
        return chain["type"] == "evm"


def erc20(options: ERC20PluginOptions) -> ERC20Plugin:
    return ERC20Plugin(options)
