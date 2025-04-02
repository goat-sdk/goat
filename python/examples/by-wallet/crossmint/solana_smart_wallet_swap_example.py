"""
This example shows how to create a Solana Smart Wallet and swap USDC for wSOL using the Jupiter DEX.

To run this example, you need to set the following environment variables:
- CROSSMINT_API_KEY
- SOLANA_RPC_ENDPOINT
- CROSSMINT_BASE_URL

"""

import os
import asyncio
from goat_wallets.crossmint.solana_smart_wallet import SolanaSmartWalletClient
from goat_wallets.crossmint.parameters import CoreSignerType
from goat_wallets.crossmint.solana_smart_wallet_factory import SolanaSmartWalletFactory
from goat_wallets.crossmint.types import SolanaKeypairSigner
from goat_wallets.crossmint.solana_smart_wallet import SolanaSmartWalletConfig
from solana.rpc.api import Client as SolanaClient
from goat_wallets.crossmint.api_client import CrossmintWalletsAPI
from dotenv import load_dotenv
from goat_plugins.jupiter.service import JupiterService
import json

load_dotenv()


def create_wallet(factory: SolanaSmartWalletFactory) -> SolanaSmartWalletClient:
    print("\n🔑 Creating Solana Smart Wallet with fireblocks custodial admin signer...")
    wallet = factory.get_or_create({
        "config": SolanaSmartWalletConfig(
            adminSigner=SolanaKeypairSigner(
                type=CoreSignerType.SOLANA_FIREBLOCKS_CUSTODIAL,
            )
        ),
        "linkedUser": "email:test+1@crossmint.com"
    })
    print(f"✅ Wallet created successfully!")
    print(f"📝 Wallet Address: {wallet.get_address()}")
    print(f"👤 Admin Signer: {wallet.get_admin_signer_address()}")
    return wallet


async def send_swap_transaction(wallet: SolanaSmartWalletClient):
    usdc_mint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
    wsol_mint = "So11111111111111111111111111111111111111112"
    amount = 1e-3

    print("\n💸 Preparing transaction...")
    print(f"📝 Transaction Details:")
    print(f"   Input Mint: {usdc_mint}")
    print(f"   Output Mint: {wsol_mint}")
    print(f"   Amount: {amount} USDC")

    print("\n📤 Sending swap transaction to network...")
    transaction_response = await JupiterService().swap_tokens(
        wallet,
        {
            "inputMint": usdc_mint,
            "outputMint": wsol_mint,
            "amount": int(amount * 1e6),
            "slippageBps": 100,
        }
    )

    print(f"✅ Transaction sent successfully!")
    print(f"🔗 Transaction Hash: {transaction_response.get('hash')}")


async def main():
    print("🚀 Starting Solana Smart Wallet Keypair Admin Signer Example")
    print("=" * 50)

    api_key = os.getenv("CROSSMINT_API_KEY")
    base_url = os.getenv("CROSSMINT_BASE_URL",
                         "https://staging.crossmint.com")
    rpc_url = os.getenv("SOLANA_RPC_ENDPOINT",
                        "https://api.devnet.solana.com")
    if not api_key:
        raise ValueError("❌ CROSSMINT_API_KEY is required")

    print("\n🔧 Initializing API client and connection...")
    api_client = CrossmintWalletsAPI(api_key, base_url=base_url)
    connection = SolanaClient(rpc_url)

    factory = SolanaSmartWalletFactory(api_client, connection)
    wallet = create_wallet(factory)

    while True:
        print("🔄 Checking balance...")
        token = "usdc"
        balances = wallet.balance_of([token])
        print("💰 Wallet balances:")
        print(json.dumps(balances, indent=2))
        usdc_balance = next((balance.get("balances", {}).get("total")
                            for balance in balances if balance.get("token") == token))
        if usdc_balance is None:
            raise ValueError("❌ No USDC balance found")
        if int(usdc_balance) >= 1_000:  # 1e-3 USDC
            print("✅ Balance is sufficient. Proceeding to send transaction...")
            break
        print("Your balance is less than 1e-3 USDC. Please fund your wallet before proceeding.")
        print("Mind that the balance may take a moment to be reflected on your wallet")
        input("Press Enter to continue...")

    await send_swap_transaction(wallet)

    print("\n✨ Example completed successfully!")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(main())
