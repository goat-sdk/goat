import os
from dotenv import load_dotenv
from solana.rpc.api import Client as SolanaClient
from solders.keypair import Keypair
from solders.instruction import Instruction
from typing import List, Optional
from goat_wallets.solana import solana, SolanaTransaction

# Load environment variables
load_dotenv()

# Initialize Solana client and keypair
client = SolanaClient(os.getenv("SOLANA_RPC_ENDPOINT"))
keypair = Keypair.from_base58_string(os.getenv("SOLANA_WALLET_SEED") or "")

# Create wallet instance
wallet = solana(client, keypair)

# Get wallet address
address = wallet.get_address()

# Check balance
balance = wallet.balance_of(address)

# Sign message
signature = wallet.sign_message("Hello, Solana!")

# Send transaction
transaction: SolanaTransaction = {
    "instructions": [],  # Add your Instruction objects here
    "address_lookup_table_addresses": None,  # Optional List[str]
    "accounts_to_sign": None,  # Optional List[Keypair]
}
result = wallet.send_transaction(transaction)
