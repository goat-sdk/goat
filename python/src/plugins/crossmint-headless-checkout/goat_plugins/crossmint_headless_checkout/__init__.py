from dataclasses import dataclass
from goat.classes.plugin_base import PluginBase
from .service import CrossmintHeadlessCheckoutService


@dataclass
class CrossmintHeadlessCheckoutPluginOptions:
    """Options for the CrossmintHeadlessCheckoutPlugin."""
    api_key: str  # API key for Crossmint API integration


class CrossmintHeadlessCheckoutPlugin(PluginBase):
    def __init__(self, options: CrossmintHeadlessCheckoutPluginOptions):
        super().__init__("crossmint-headless-checkout", [CrossmintHeadlessCheckoutService(options.api_key)])

    def supports_chain(self, chain) -> bool:
        return True  # This plugin supports all chains


def crossmint_headless_checkout(options: CrossmintHeadlessCheckoutPluginOptions) -> CrossmintHeadlessCheckoutPlugin:
    return CrossmintHeadlessCheckoutPlugin(options)
