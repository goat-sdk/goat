from typing import Dict, List, Optional, Any, cast
import base58
import time
from goat_wallets.crossmint.base import UnsupportedOperationException
from solders.instruction import Instruction
from solders.pubkey import Pubkey
from solders.message import Message
from solana.rpc.api import Client as SolanaClient
from goat.classes.wallet_client_base import Balance, Signature
from goat_wallets.solana import SolanaWalletClient, SolanaTransaction
from .api_client import CrossmintWalletsAPI
from .parameters import SolanaSmartWalletTransactionParams
from .base_wallet import BaseWalletClient, get_locator


class SolanaSmartWalletClient(SolanaWalletClient, BaseWalletClient):
    def __init__(
        self,
        address: str,
        api_client: CrossmintWalletsAPI,
        connection: SolanaClient,
        options: Dict
    ):
        SolanaWalletClient.__init__(self, connection)
        BaseWalletClient.__init__(self, address, api_client, "solana")
        self.connection = connection
        self._locator = get_locator(address, None, "solana-smart-wallet")

    def get_address(self) -> str:
        return self._address

    def sign_message(
        self,
        message: str,
        required_signers: Optional[List[str]] = None,
        signer: Optional[str] = None
    ) -> Signature:
        raise UnsupportedOperationException("Sign message is not supported for Solana smart wallets")

    def send_transaction(
        self,
        transaction: SolanaTransaction,
        required_signers: Optional[List[str]] = None,
        signer: Optional[str] = None
    ) -> Dict[str, str]:
        instructions = []
        for instruction in transaction["instructions"]:
            instruction = Instruction(
                program_id=instruction.program_id,
                accounts=instruction.accounts,
                data=instruction.data
            )
            instructions.append(instruction)
        
        message = Message(
            instructions=instructions,
            payer=Pubkey.from_string(self._address),
        )
        
        serialized = base58.b58encode(bytes(message)).decode()
        
        params = SolanaSmartWalletTransactionParams(
            transaction=serialized,
            required_signers=required_signers,
            signer=signer
        )
        try:
            response = self._client.create_transaction_for_smart_wallet(
                self._address,
                params
            )
            
            while True:
                status = self._client.check_transaction_status(
                    self._locator,
                    response["id"]
                )
                
                if status["status"] == "success":
                    return {
                        "hash": status.get("onChain", {}).get("txId", "")
                    }
                
                if status["status"] == "failed":
                    error = status.get("error", {})
                    message = error.get("message", "Unknown error")
                    raise ValueError(f"Transaction failed: {message}")
                
                if status["status"] not in ["awaiting-approval", "pending"]:
                    raise ValueError(f"Unexpected transaction status: {status['status']}")
                    
                time.sleep(3)
                
        except Exception as e:
            raise ValueError(f"Failed to create or process transaction: {str(e)}")

    def balance_of(self, address: str) -> Balance:
        pubkey = Pubkey.from_string(address)
        balance = self.connection.get_balance(pubkey)
        
        return Balance(
            value=str(balance.value / 10**9),
            in_base_units=str(balance.value),
            decimals=9,
            symbol="SOL",
            name="Solana"
        )

    def send_raw_transaction(
        self,
        transaction: str,
        required_signers: Optional[List[str]] = None,
        signer: Optional[str] = None
    ) -> Dict[str, str]:
        params = SolanaSmartWalletTransactionParams(
            transaction=transaction,
            required_signers=required_signers,
            signer=signer
        )
        try:
            response = self._client.create_transaction_for_smart_wallet(
                self._address,
                params
            )
            
            while True:
                status = self._client.check_transaction_status(
                    self._locator,
                    response["id"]
                )
                
                if status["status"] == "success":
                    return {
                        "hash": status.get("onChain", {}).get("txId", "")
                    }
                
                if status["status"] == "failed":
                    error = status.get("error", {})
                    message = error.get("message", "Unknown error")
                    raise ValueError(f"Transaction failed: {message}")
                
                if status["status"] == "awaiting-approval":
                    if required_signers:
                        approvals = []
                        for required_signer in required_signers:
                            approvals.append({
                                "signer": required_signer,
                                "signature": None
                            })
                        self._client.approve_transaction(
                            self._locator,
                            response["id"],
                            approvals=approvals
                        )
                    else:
                        self._client.approve_transaction(
                            self._locator,
                            response["id"],
                            signer=signer
                        )
                elif status["status"] not in ["pending"]:
                    raise ValueError(f"Unexpected transaction status: {status['status']}")
                    
                time.sleep(3)
                
        except Exception as e:
            raise ValueError(f"Failed to create or process transaction: {str(e)}")

    def register_delegated_signer(
        self,
        signer: str,
    ) -> Dict[str, Any]:
        """Register a delegated signer for this wallet.
        
        Args:
            signer: The locator of the delegated signer
            expires_at: Optional expiry date in milliseconds since UNIX epoch
            permissions: Optional list of ERC-7715 permission objects
            
        Returns:
            Delegated signer registration response
        """
        return self._client.register_delegated_signer(
            self._locator,
            signer,
        )
    
    def get_delegated_signer(self, signer_locator: str) -> Dict[str, Any]:
        """Get information about a delegated signer.
        
        Args:
            signer_locator: Signer locator string
            
        Returns:
            Delegated signer information
        """
        return self._client.get_delegated_signer(self._locator, signer_locator)
