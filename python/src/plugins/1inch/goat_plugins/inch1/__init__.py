from dataclasses import dataclass

from goat.classes.plugin_base import PluginBase
from .service import OneInchService


@dataclass
class OneInchPluginOptions:
    api_key: str


class OneInchPlugin(PluginBase):
    def __init__(self, options: OneInchPluginOptions):
        super().__init__("1inch", [OneInchService(options.api_key)])

    def supports_chain(self, chain) -> bool:
        return True


def inch1(options: OneInchPluginOptions) -> OneInchPlugin:
    return OneInchPlugin(options)
