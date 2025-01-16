from dataclasses import dataclass
from goat.classes.plugin_base import PluginBase
from .service import OpenSeaService


@dataclass
class OpenSeaPluginOptions:
    api_key: str


class OpenSeaPlugin(PluginBase):
    def __init__(self, options: OpenSeaPluginOptions):
        super().__init__("opensea", [OpenSeaService(options.api_key)])

    def supports_chain(self, chain) -> bool:
        return True


def opensea(options: OpenSeaPluginOptions) -> OpenSeaPlugin:
    return OpenSeaPlugin(options)
