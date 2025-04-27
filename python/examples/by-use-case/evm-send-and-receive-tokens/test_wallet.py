import os
import sys
from decimal import Decimal
from dotenv import load_dotenv
from web3 import Web3
from web3.middleware import SignAndSendRawMiddlewareBuilder
from eth_account import Account
from eth_utils.address import to_checksum_address

from goat_wallets.evm import USDC, ERC20_ABI
from goat_wallets.web3 import web3

load_dotenv()

w3 = Web3(Web3.HTTPProvider(os.getenv("RPC_PROVIDER_URL")))
private_key = os.getenv("WALLET_PRIVATE_KEY")
assert private_key is not None, "You must set WALLET_PRIVATE_KEY environment variable"
assert private_key.startswith("0x"), "Private key must start with 0x hex prefix"

account = Account.from_key(private_key)
w3.eth.default_account = account.address  # Set the default account
w3.middleware_onion.add(
    SignAndSendRawMiddlewareBuilder.build(account)
)  # Add middleware

wallet = web3(w3, tokens=[USDC])

def test_native_balance():
    """Test 1: Check native balance"""
    print("\n--- Test 1: Check Native Balance ---")
    try:
        balance = wallet.balance_of(wallet.get_address())
        print(f"Native Balance: {balance['value']} {balance['symbol']} ({balance['in_base_units']} wei)")
        return True
    except Exception as e:
        print(f"Error checking native balance: {str(e)}")
        return False

def test_usdc_balance():
    """Test 2: Check USDC balance"""
    print("\n--- Test 2: Check USDC Balance ---")
    try:
        chain_id = wallet.get_chain_id()
        if str(chain_id) not in USDC["chains"]:
            print(f"USDC not configured for chain {chain_id}")
            return False
            
        usdc_address = USDC["chains"][chain_id]["contractAddress"]
        
        address = wallet.get_address()
        resolved_address = to_checksum_address(address)
        
        contract = w3.eth.contract(
            address=to_checksum_address(usdc_address), 
            abi=ERC20_ABI
        )
        
        balance_in_base_units = contract.functions.balanceOf(resolved_address).call()
        token_decimals = contract.functions.decimals().call()
        token_name = contract.functions.name().call()
        token_symbol = contract.functions.symbol().call()
        
        balance_value = str(Decimal(balance_in_base_units) / (10 ** token_decimals))
        
        print(f"USDC Balance: {balance_value} {token_symbol} ({balance_in_base_units} base units)")
        return True
    except Exception as e:
        print(f"Error checking USDC balance: {str(e)}")
        return False

def test_send_native():
    """Test 3: Send native tokens to self"""
    print("\n--- Test 3: Send Native Tokens to Self ---")
    try:
        amount = "0.0001"  # ETH
        decimals = 18  # ETH decimals
        amount_in_wei = int(Decimal(amount) * (10 ** decimals))
        print(f"Sending {amount_in_wei} wei to self...")
        
        tx_params = {
            "from": w3.eth.default_account,
            "to": to_checksum_address(wallet.get_address()),
            "chainId": w3.eth.chain_id,
            "value": amount_in_wei,
            "gas": 21000,  # Standard gas limit for ETH transfer
            "gasPrice": w3.eth.gas_price,
            "nonce": w3.eth.get_transaction_count(w3.eth.default_account),
        }
        
        tx_hash = w3.eth.send_transaction(tx_params)
        
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        
        result = {
            "hash": receipt["transactionHash"].hex(),
            "status": "1" if receipt["status"] == 1 else "0",
        }
        
        print(f"Transaction sent: {result}")
        return True
    except Exception as e:
        print(f"Error sending native tokens: {str(e)}")
        return False

def test_send_usdc():
    """Test 4: Send 1 USDC to self"""
    print("\n--- Test 4: Send 1 USDC to Self ---")
    try:
        chain_id = wallet.get_chain_id()
        if str(chain_id) not in USDC["chains"]:
            print(f"USDC not configured for chain {chain_id}")
            return False
            
        usdc_address = USDC["chains"][chain_id]["contractAddress"]
        
        amount = "1"  # USDC
        decimals = USDC["decimals"]
        amount_in_base_units = int(Decimal(amount) * (10 ** decimals))
        print(f"Sending {amount_in_base_units} USDC base units to self...")
        
        contract = w3.eth.contract(
            address=to_checksum_address(usdc_address), 
            abi=ERC20_ABI
        )
        
        balance_before = contract.functions.balanceOf(wallet.get_address()).call()
        balance_before_value = str(Decimal(balance_before) / (10 ** decimals))
        print(f"USDC Balance before: {balance_before_value} {USDC['symbol']}")
        
        tx = contract.functions.transfer(
            wallet.get_address(),
            amount_in_base_units
        ).build_transaction({
            "from": w3.eth.default_account,
            "chainId": w3.eth.chain_id,
            "nonce": w3.eth.get_transaction_count(w3.eth.default_account),
            "gasPrice": w3.eth.gas_price,
        })
        
        tx_hash = w3.eth.send_transaction(tx)
        
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        
        result = {
            "hash": receipt["transactionHash"].hex(),
            "status": "1" if receipt["status"] == 1 else "0",
        }
        
        print(f"Transaction sent: {result}")
        
        balance_after = contract.functions.balanceOf(wallet.get_address()).call()
        balance_after_value = str(Decimal(balance_after) / (10 ** decimals))
        print(f"USDC Balance after: {balance_after_value} {USDC['symbol']}")
        
        return True
    except Exception as e:
        print(f"Error sending USDC: {str(e)}")
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
