from goat import Chain
from .base import PluginBase
from .mint import CrossmintMintService
from .api_client import CrossmintWalletsAPI

class MintPlugin(PluginBase):
    def __init__(self, client: CrossmintWalletsAPI):
        super().__init__("mint", [CrossmintMintService(client)])

    def supports_chain(self, chain: Chain) -> bool:
        if chain["type"] == "evm":
            return self._is_chain_supported_by_minting(chain["id"] or 0)
        return chain["type"] in ["aptos", "solana"]

    @staticmethod
    def _is_chain_supported_by_minting(chain_id: int) -> bool:
        # Following TypeScript implementation's chain support logic
        supported_chain_ids = [1, 5, 137, 80001, 43114, 43113]  # Mainnet, Goerli, Polygon, Mumbai, Avalanche, Fuji
        return chain_id in supported_chain_ids

def mint_plugin(client: CrossmintWalletsAPI) -> MintPlugin:
    return MintPlugin(client)