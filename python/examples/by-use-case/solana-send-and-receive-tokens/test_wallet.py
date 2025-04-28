import os
import sys
from decimal import Decimal
from dotenv import load_dotenv
from solana.rpc.api import Client as SolanaClient
from solders.keypair import Keypair
from solders.pubkey import Pubkey
from solana.rpc.types import TxOpts
from solana.rpc.commitment import Confirmed
from spl.token.instructions import get_associated_token_address, transfer_checked, create_associated_token_account
from spl.token.constants import TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID

from goat_wallets.solana import solana, SolanaOptions, SPL_TOKENS, USDC

load_dotenv()

client = SolanaClient(os.getenv("SOLANA_RPC_ENDPOINT"))

keypair = Keypair.from_base58_string(os.getenv("SOLANA_WALLET_SEED") or "")

wallet = solana(
    client, 
    keypair, 
    options=SolanaOptions(
        network="mainnet",
        tokens=SPL_TOKENS["mainnet"]
    )
)

def test_native_balance():
    """Test 1: Check native SOL balance"""
    print("\n--- Test 1: Check Native SOL Balance ---")
    try:
        balance = wallet.balance_of(wallet.get_address())
        print(f"Native Balance: {balance['value']} {balance['symbol']} ({balance['in_base_units']} lamports)")
        return True
    except Exception as e:
        print(f"Error checking native balance: {str(e)}")
        return False

def test_usdc_balance():
    """Test 2: Check USDC balance"""
    print("\n--- Test 2: Check USDC Balance ---")
    try:
        usdc_address = USDC["mintAddress"]
        
        owner_pubkey = Pubkey.from_string(wallet.get_address())
        mint_pubkey = Pubkey.from_string(usdc_address)
        
        # Use the imported get_associated_token_address
        token_account = get_associated_token_address(owner_pubkey, mint_pubkey)
        
        account_info = client.get_account_info(token_account)
        if account_info.value is None:
            balance_in_base_units = "0"
        else:
            token_balance = client.get_token_account_balance(token_account)
            balance_in_base_units = token_balance.value.amount
        
        decimals = USDC["decimals"]
        balance_value = str(Decimal(balance_in_base_units) / (10 ** decimals))
        
        print(f"USDC Balance: {balance_value} {USDC['symbol']} ({balance_in_base_units} base units)")
        return True
    except Exception as e:
        print(f"Error checking USDC balance: {str(e)}")
        return False

def test_send_native():
    """Test 3: Send native SOL to self"""
    print("\n--- Test 3: Send Native SOL to Self ---")
    try:
        amount = "0.001"  # SOL
        decimals = 9  # SOL decimals
        amount_in_lamports = int(Decimal(amount) * (10 ** decimals))
        print(f"Sending {amount_in_lamports} lamports to self...")
        
        from solders.system_program import TransferParams, transfer
        
        owner_pubkey = Pubkey.from_string(wallet.get_address())
        destination_pubkey = owner_pubkey  # Send to self
        
        transfer_ix = transfer(
            TransferParams(
                from_pubkey=owner_pubkey,
                to_pubkey=destination_pubkey,
                lamports=amount_in_lamports
            )
        )
        
        recent_blockhash = client.get_latest_blockhash().value.blockhash

        from solders.transaction import Transaction
        tx = Transaction.new_with_payer(
            instructions=[transfer_ix],
            payer=keypair.pubkey(),
        )

        tx.sign([keypair], recent_blockhash=recent_blockhash)
        result = client.send_transaction(
            tx,
            opts=TxOpts(
                skip_preflight=False,
                max_retries=10,
                preflight_commitment=Confirmed,
            ),
        )

        max_retries = 5
        retry_delay = 1  # seconds
        
        for retry in range(max_retries):
            try:
                client.confirm_transaction(
                    result.value,
                    commitment=Confirmed,
                )
                break  # Success, exit retry loop
            except Exception as e:
                if retry < max_retries - 1:
                    print(f"Retry {retry+1}/{max_retries} after error: {str(e)}")
                    import time
                    time.sleep(retry_delay)
                    retry_delay *= 2  # Exponential backoff
                else:
                    raise
        
        print(f"Transaction sent: {{'hash': '{str(result.value)}'}}")
        return True
    except Exception as e:
        print(f"Error sending native SOL: {str(e)}")
        return False

def test_send_usdc():
    """Test 4: Send 1 USDC to self"""
    print("\n--- Test 4: Send 1 USDC to Self ---")
    try:
        usdc_address = USDC["mintAddress"]
        
        amount = "0.0001"  # USDC - extremely small amount to test (0.0001 USDC)
        decimals = USDC["decimals"]
        amount_in_base_units = int(Decimal(amount) * (10 ** decimals))
        print(f"Sending {amount_in_base_units} USDC base units to self...")
        
        owner_pubkey = Pubkey.from_string(wallet.get_address())
        mint_pubkey = Pubkey.from_string(usdc_address)
        
        source_token_account = get_associated_token_address(
            owner_pubkey, 
            mint_pubkey
        )
        
        destination_token_account = source_token_account
        
        source_account_info = client.get_account_info(source_token_account)
        if source_account_info.value is None:
            print("Source token account does not exist")
            return False
        
        token_balance = client.get_token_account_balance(source_token_account)
        balance_before_base_units = token_balance.value.amount
        balance_before_value = str(Decimal(balance_before_base_units) / (10 ** decimals))
        print(f"USDC Balance before: {balance_before_value} {USDC['symbol']}")
        
        from spl.token.instructions import transfer_checked, TransferCheckedParams
        from spl.token.constants import TOKEN_PROGRAM_ID
        
        transfer_ix = transfer_checked(
            TransferCheckedParams(
                program_id=TOKEN_PROGRAM_ID,
                source=source_token_account,
                mint=mint_pubkey,
                dest=destination_token_account,
                owner=owner_pubkey,
                amount=int(amount_in_base_units),
                decimals=decimals,
                signers=[]
            )
        )
        
        recent_blockhash = client.get_latest_blockhash().value.blockhash

        from solders.transaction import Transaction
        tx = Transaction.new_with_payer(
            instructions=[transfer_ix],
            payer=keypair.pubkey(),
        )

        tx.sign([keypair], recent_blockhash=recent_blockhash)
        result = client.send_transaction(
            tx,
            opts=TxOpts(
                skip_preflight=False,
                max_retries=10,
                preflight_commitment=Confirmed,
            ),
        )

        max_retries = 5
        retry_delay = 1  # seconds
        
        for retry in range(max_retries):
            try:
                client.confirm_transaction(
                    result.value,
                    commitment=Confirmed,
                )
                break  # Success, exit retry loop
            except Exception as e:
                if retry < max_retries - 1:
                    print(f"Retry {retry+1}/{max_retries} after error: {str(e)}")
                    import time
                    time.sleep(retry_delay)
                    retry_delay *= 2  # Exponential backoff
                else:
                    raise
        
        print(f"Transaction sent: {{'hash': '{str(result.value)}'}}")
        
        token_balance = client.get_token_account_balance(source_token_account)
        balance_after_base_units = token_balance.value.amount
        
        balance_after_value = str(Decimal(balance_after_base_units) / (10 ** decimals))
        print(f"USDC Balance after: {balance_after_value} {USDC['symbol']}")
        
        return True
    except Exception as e:
        import traceback
        print(f"Error sending USDC: {str(e)}")
        print("Exception details:")
        traceback.print_exc()
        return False

def run_tests():
    """Run all tests"""
    results = []
    
    results.append(test_native_balance())
    
    results.append(test_usdc_balance())
    
    results.append(test_send_native())
    
    results.append(test_send_usdc())
    
    print("\n--- Test Results Summary ---")
    print(f"Test 1 (Native Balance): {'PASS' if results[0] else 'FAIL'}")
    print(f"Test 2 (USDC Balance): {'PASS' if results[1] else 'FAIL'}")
    print(f"Test 3 (Send Native): {'PASS' if results[2] else 'FAIL'}")
    print(f"Test 4 (Send USDC): {'PASS' if results[3] else 'FAIL'}")

if __name__ == "__main__":
    run_tests()
