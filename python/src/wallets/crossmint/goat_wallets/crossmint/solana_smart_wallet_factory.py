from typing import Dict, Optional, cast
from solders.pubkey import Pubkey
from solana.rpc.api import Client as SolanaClient
from .api_client import CrossmintWalletsAPI
from .parameters import WalletType, AdminSigner
from .solana_smart_wallet import SolanaSmartWalletClient, LinkedUser, SolanaSmartWalletOptions
from .base_wallet import get_locator

# This should be enforced by the type, not by a successive if-else
def generate_user_locator(linked_user: LinkedUser) -> str:
    if "email" in linked_user:
        return f"email:{linked_user['email']}"
    elif "phone" in linked_user:
        return f"phone:{linked_user['phone']}"
    elif "userId" in linked_user:
        return f"userId:{linked_user['userId']}"
    elif "twitter" in linked_user:
        return f"x:{linked_user['twitter']}"
    else:
        raise ValueError("Invalid linked user")

def create_wallet(api_client: CrossmintWalletsAPI, config: Optional[Dict] = None) -> Dict:
    admin_signer = None
    user_locator = generate_user_locator(config["linkedUser"])
    
    try:
        wallet = api_client.create_smart_wallet(
            WalletType.SOLANA_SMART_WALLET,
            admin_signer,
            user_locator
        )
        return wallet
    except Exception as e:
        raise ValueError(f"Failed to create Solana Smart Wallet: {str(e)}")

def solana_smart_wallet_factory(api_client: CrossmintWalletsAPI):
    def create_smart_wallet(options: Dict) -> SolanaSmartWalletClient:
        print(f"Creating smart wallet with options: {options}")
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
            print(f"Getting wallet with locator: {locator}")
            wallet = api_client.get_wallet(locator)
        except Exception:
            print(f"Creating wallet with options: {options}")
            wallet = create_wallet(api_client, {
                "adminSigner": options["adminSigner"],
                "linkedUser": locator
            })
        
        print(f"Returning wallet: {wallet}")
        return SolanaSmartWalletClient(
            wallet["address"],
            api_client,
            {
                "adminSigner": options["adminSigner"],
            }
        )
    
    return create_smart_wallet
