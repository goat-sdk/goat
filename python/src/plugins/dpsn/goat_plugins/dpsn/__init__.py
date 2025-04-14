from dataclasses import dataclass
from goat.classes.plugin_base import PluginBase
from .service import DpsnPluginService
from typing import Callable, Dict, Any
from .dpsn_client import DpsnService


@dataclass
class DpsnPluginOptions:
    dpsn_url:str 
    evm_wallet_pvt_key:str 
    message_handler: [Callable[[Dict[str, Any]], None]] = None

class DpsnPlugin(PluginBase):
    def __init__(self, options: DpsnPluginOptions):
        dpsn_service = DpsnService(dpsn_url=options.dpsn_url, evm_wallet_pvt_key=options.evm_wallet_pvt_key)
        service = DpsnPluginService(dpsn_service)
        if options.message_handler:
            dpsn_service.set_message_callback(options.message_handler)
        super().__init__("dpsn", [service])

    def supports_chain(self, chain) -> bool:
        return True


def dpsn(options: DpsnPluginOptions) -> DpsnPlugin:
    return DpsnPlugin(options)
