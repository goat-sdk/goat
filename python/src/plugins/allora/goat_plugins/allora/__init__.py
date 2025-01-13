from dataclasses import dataclass
from typing import Optional

from goat.classes.plugin_base import PluginBase
from .service import AlloraService


@dataclass
class AlloraPluginOptions:
    api_key: Optional[str] = None
    api_root: str = "https://api.upshot.xyz/v2/allora"


class AlloraPlugin(PluginBase):
    def __init__(self, options: AlloraPluginOptions):
        super().__init__("allora", [AlloraService(options.api_key, options.api_root)])

    def supports_chain(self, chain) -> bool:
        return True


def allora(options: AlloraPluginOptions) -> AlloraPlugin:
    return AlloraPlugin(options)
