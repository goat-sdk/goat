from dataclasses import dataclass
from goat.classes.plugin_base import PluginBase
from .service import DebridgeService


@dataclass
class DebridgePluginOptions:
    # Debridge currently doesn't require any auth keys
    pass


class DebridgePlugin(PluginBase):

    def __init__(self, options: DebridgePluginOptions):
        super().__init__("debridge", [DebridgeService()])

    def supports_chain(self, chain) -> bool:
        return True


def debridge(options: DebridgePluginOptions) -> DebridgePlugin:
    return DebridgePlugin(options)
