from typing import Dict, Optional
from solders.pubkey import Pubkey
from solana.rpc.api import Client as SolanaClient
from .api_client import CrossmintWalletsAPI
from .parameters import WalletType, AdminSigner
from .solana_smart_wallet import SolanaSmartWalletClient


def get_locator(params: Dict) -> str:
    if "address" in params:
        return params["address"]
    if "email" in params:
        return f"email:{params['email']}:solana-smart-wallet"
    if "phone" in params:
        return f"phone:{params['phone']}:solana-smart-wallet"
    if "twitter" in params:
        return f"x:{params['twitter']}:solana-smart-wallet"
    return f"userId:{params['userId']}:solana-smart-wallet"


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
            "solana",
            admin_signer,
            linked_user
        )
        return wallet
    except Exception as e:
        raise ValueError(f"Failed to create Solana Smart Wallet: {str(e)}")

def solana_smart_wallet_factory(api_client: CrossmintWalletsAPI):
    def create_smart_wallet(options: Dict) -> SolanaSmartWalletClient:
        locator = get_locator(options)
        
        try:
            wallet = api_client.get_wallet(locator)
        except Exception:
            wallet = create_wallet(api_client, options)
        
        return SolanaSmartWalletClient(
            wallet["address"],
            api_client,
            options["connection"],
            options
        )
    
    return create_smart_wallet
