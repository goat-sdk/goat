from dataclasses import dataclass
from typing import Optional
from goat.classes.plugin_base import PluginBase
from goat.classes.wallet_client_base import WalletClientBase
from goat.types.chain import Chain
from .options import VercelPluginOptions
from .service import VercelService


@dataclass
class VercelPluginOptions:
    """Options for configuring the Vercel plugin.
    
    Attributes:
        api_key (str): Your Vercel API key. Required for authentication with Vercel's API.
                      You can get this from your Vercel account settings.
    """
    api_key: str


class VercelPlugin(PluginBase[WalletClientBase]):
    """A plugin for interacting with Vercel's deployment and project management services.
    
    This plugin provides tools for:
    - Creating new Vercel projects
    - Deploying projects to Vercel
    - Monitoring deployment status
    
    Attributes:
        name (str): The name of the plugin, set to "vercel"
        services (list): List of services provided by the plugin
    """
    
    def __init__(self, options: VercelPluginOptions):
        """Initialize the Vercel plugin.
        
        Args:
            options (VercelPluginOptions): Configuration options for the plugin
        """
        super().__init__("vercel", [VercelService(options)])

    def supports_chain(self, chain: Chain) -> bool:
        """Check if the plugin supports a specific blockchain chain.
        
        Args:
            chain: The chain to check support for
            
        Returns:
            bool: Always returns True as this plugin is chain-agnostic
        """
        return True


def vercel(options: VercelPluginOptions) -> VercelPlugin:
    """Factory function to create a new instance of the Vercel plugin."""
    return VercelPlugin(options)
