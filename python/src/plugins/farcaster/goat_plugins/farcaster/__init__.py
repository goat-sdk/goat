from dataclasses import dataclass
from typing import Optional
from goat.classes.plugin_base import PluginBase
from .service import FarcasterService


@dataclass
class FarcasterPluginOptions:
    api_key: str
    base_url: Optional[str] = None


class FarcasterPlugin(PluginBase):
    def __init__(self, options: FarcasterPluginOptions):
        super().__init__("farcaster", [FarcasterService(options.api_key, options.base_url)])

    def supports_chain(self, chain) -> bool:
        # farcaster is chain-agnostic
        return True


def farcaster(options: FarcasterPluginOptions) -> FarcasterPlugin:
    return FarcasterPlugin(options)
