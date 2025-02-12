import os
from solana.rpc.api import Client as SolanaClient
from goat_wallets.crossmint.api_client import CrossmintWalletsAPI
from goat_wallets.crossmint.solana_smart_wallet_factory import solana_smart_wallet_factory
from goat_wallets.crossmint.parameters import DelegatedSignerPermission
from dotenv import load_dotenv

load_dotenv()

def main():
    api_key = os.getenv("CROSSMINT_API_KEY")
    base_url = os.getenv("CROSSMINT_BASE_URL", "https://staging.crossmint.com")
    email = os.getenv("CROSSMINT_USER_EMAIL")
    
    if not all([api_key, email]):
        raise ValueError("CROSSMINT_API_KEY and CROSSMINT_USER_EMAIL are required")
    
    rpc_url = os.getenv("SOLANA_RPC_ENDPOINT", "https://api.devnet.solana.com")
    connection = SolanaClient(rpc_url)
    
    api_client = CrossmintWalletsAPI(api_key, base_url=base_url)
    factory = solana_smart_wallet_factory(api_client)
    
    wallet = factory({
        "email": email,
        "connection": connection
    })
    print(f"Created wallet with address: {wallet.get_address()}")
    
    signer_response = wallet.register_delegated_signer(
        "solana-keypair:BvzKvn6nUUAYtKu2pH3h5SbUkUNcRPQawg3TYz8aB8Zr",
    )
    print(f"Registered delegated signer: {signer_response}")
    
    signer_info = wallet.get_delegated_signer("solana-keypair:BvzKvn6nUUAYtKu2pH3h5SbUkUNcRPQawg3TYz8aB8Zr")
    print(f"Delegated signer info: {signer_info}")
    
    signature = wallet.sign_message(
        "Hello, Solana!",
        required_signers=["solana-keypair:BvzKvn6nUUAYtKu2pH3h5SbUkUNcRPQawg3TYz8aB8Zr"]
    )
    print(f"Message signature: {signature}")
    
    balance = wallet.balance_of(wallet.get_address())
    print(f"Wallet balance: {balance.value} {balance.symbol}")

if __name__ == "__main__":
    main()
