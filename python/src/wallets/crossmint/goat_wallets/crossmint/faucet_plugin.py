from goat import Chain
from .base import PluginBase
from .faucet import CrossmintFaucetService
from .api_client import CrossmintWalletsAPI

class FaucetPlugin(PluginBase):
    def __init__(self, client: CrossmintWalletsAPI):
        super().__init__("faucet", [CrossmintFaucetService(client)])

    def supports_chain(self, chain: Chain) -> bool:
        if chain["type"] != "evm":
            return False
        if not chain["id"]:
            return False
        return self._is_chain_supported_by_faucet(chain["id"])

    @staticmethod
    def _is_chain_supported_by_faucet(chain_id: int) -> bool:
        # Following TypeScript implementation's chain support logic
        supported_chain_ids = [5, 80001, 43113]  # Goerli, Mumbai, Fuji
        return chain_id in supported_chain_ids

def faucet_plugin(client: CrossmintWalletsAPI) -> FaucetPlugin:
    return FaucetPlugin(client)