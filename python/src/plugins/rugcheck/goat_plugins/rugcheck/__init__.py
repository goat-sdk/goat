from dataclasses import dataclass

from goat.classes.plugin_base import PluginBase
from .service import RugCheckService


@dataclass
class RugCheckPluginOptions:
    jwt_token: str = ""


class RugCheckPlugin(PluginBase):
    def __init__(self):
        super().__init__("rugcheck", [RugCheckService()])

    def supports_chain(self, chain) -> bool:
        return True


def rugcheck() -> RugCheckPlugin:
    return RugCheckPlugin()
