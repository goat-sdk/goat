from typing import Dict, Optional, cast
from solders.pubkey import Pubkey
from solana.rpc.api import Client as SolanaClient
from .api_client import CrossmintWalletsAPI
from .parameters import WalletType, AdminSigner
from .solana_smart_wallet import SolanaSmartWalletClient, LinkedUser, SolanaSmartWalletOptions
from .base_wallet import get_locator


def create_wallet(api_client: CrossmintWalletsAPI, config: Optional[Dict] = None) -> Dict:
    admin_signer = None
    linked_user = None
    
    if config:
        if "adminSigner" in config:
            admin_signer = AdminSigner(**config["adminSigner"])
        if "linkedUser" in config:
            linked_user = config["linkedUser"]
        elif any(key in config for key in ["email", "phone", "userId", "twitter"]):
            if "email" in config:
                linked_user = f"email:{config['email']}"
            elif "phone" in config:
                linked_user = f"phone:{config['phone']}"
            elif "twitter" in config:
                linked_user = f"x:{config['twitter']}"
            else:
                linked_user = f"userId:{config['userId']}"
    
    try:
        wallet = api_client.create_smart_wallet(
            WalletType.SOLANA_SMART_WALLET,
            admin_signer,
            linked_user
        )
        return wallet
    except Exception as e:
        raise ValueError(f"Failed to create Solana Smart Wallet: {str(e)}")

def solana_smart_wallet_factory(api_client: CrossmintWalletsAPI):
    def create_smart_wallet(options: Dict) -> SolanaSmartWalletClient:
        linked_user: Optional[LinkedUser] = None
        if "linkedUser" in options:
            linked_user = cast(LinkedUser, options["linkedUser"])
        elif any(key in options for key in ["email", "phone", "userId"]):
            linked_user = {}
            if "email" in options:
                linked_user["email"] = options["email"]
            elif "phone" in options:
                linked_user["phone"] = options["phone"]
            else:
                linked_user["userId"] = options["userId"]
                
        locator = get_locator(options.get("address"), linked_user, "solana-smart-wallet")
        
        try:
            wallet = api_client.get_wallet(locator)
        except Exception:
            wallet = create_wallet(api_client, options)
        
        return SolanaSmartWalletClient(
            wallet["address"],
            api_client,
            cast(SolanaSmartWalletOptions, options)
        )
    
    return create_smart_wallet
