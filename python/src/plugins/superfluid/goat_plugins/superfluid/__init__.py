from dataclasses import dataclass
from typing import Optional

from goat.classes.plugin_base import PluginBase
from goat.types.chain import Chain
from .service import SuperfluidService


@dataclass
class SuperfluidPluginOptions:
    """
    Configuration options for the Superfluid plugin.
    Currently no configuration is needed.
    """
    pass


class SuperfluidPlugin(PluginBase):
    def __init__(self, options: Optional[SuperfluidPluginOptions] = None):
        super().__init__("superfluid", [SuperfluidService()])

    def supports_chain(self, chain: Chain) -> bool:
        return chain["type"] == "evm"


def superfluid(options: Optional[SuperfluidPluginOptions] = None) -> SuperfluidPlugin:
    """
    Create a new instance of the Superfluid plugin.
    
    Args:
        options: Optional configuration options for the plugin
        
    Returns:
        A configured SuperfluidPlugin instance
    """
    return SuperfluidPlugin(options)
