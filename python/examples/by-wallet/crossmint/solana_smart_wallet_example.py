import os
from goat_wallets.crossmint.solana_smart_wallet import SolanaSmartWalletClient
from goat_wallets.crossmint.parameters import WalletType
from goat_wallets.crossmint.parameters import CoreSignerType
from goat_wallets.crossmint.parameters import AdminSigner
from solana.rpc.api import Client as SolanaClient
from goat_wallets.crossmint.api_client import CrossmintWalletsAPI
from goat_wallets.crossmint.solana_smart_wallet_factory import solana_smart_wallet_factory
from solders.keypair import Keypair
from dotenv import load_dotenv
import random

load_dotenv()

def main():
    api_key = os.getenv("CROSSMINT_API_KEY")
    base_url = os.getenv("CROSSMINT_BASE_URL", "https://staging.crossmint.com")
    rpc_url = os.getenv("SOLANA_RPC_ENDPOINT", "https://api.devnet.solana.com")
    if not api_key:
        raise ValueError("CROSSMINT_API_KEY is required")
    
    api_client = CrossmintWalletsAPI(api_key, base_url=base_url)

    connection = SolanaClient(rpc_url)
    admin_signer = Keypair()

    wallet_creation_response = api_client.create_smart_wallet(
            WalletType.SOLANA_SMART_WALLET,
            AdminSigner(
                type=CoreSignerType.SOLANA_KEYPAIR,
                keyPair=admin_signer,
                address=str(admin_signer.pubkey())
            ),
        )

    print(f"Wallet creation response: {wallet_creation_response}")
    wallet = SolanaSmartWalletClient(
        wallet_creation_response["address"],
        api_client,
        {
            "connection": connection,
            "config": {
                "adminSigner": {
                    "type": "solana-keypair",
                    "keyPair": admin_signer
                }
            }
        }
    )


    print(f"Created wallet with address: {wallet.get_address()}")
    transaction = wallet.send_transaction(
        {
            "instructions": [],
            "signer": admin_signer
        }
    )
    print(f"Transaction: {transaction}")

if __name__ == "__main__":
    main()
