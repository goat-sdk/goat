from typing import Dict, List, Optional, Any, cast, TypedDict, Union, Literal, NotRequired, Sequence
import base58
import time
import nacl.signing
from goat_wallets.crossmint.base import UnsupportedOperationException
from solders.instruction import Instruction
from solders.pubkey import Pubkey
from solders.message import Message
from solana.rpc.api import Client as SolanaClient
from goat.classes.wallet_client_base import Balance, Signature
from goat_wallets.solana import SolanaWalletClient, SolanaTransaction
from .api_client import CrossmintWalletsAPI
from .parameters import SolanaSmartWalletTransactionParams, AdminSigner
from .base_wallet import BaseWalletClient, get_locator
from .types import (
    LinkedUser, TransactionApproval, BaseKeypairSigner,
    BaseFireblocksSigner, BaseWalletConfig, BaseWalletOptions
)


# Type aliases for Solana-specific signers
SolanaKeypairSigner = BaseKeypairSigner  # type with solana-keypair
SolanaFireblocksSigner = BaseFireblocksSigner  # type with solana-fireblocks-custodial

class SolanaSmartWalletConfig(TypedDict):
    """Configuration specific to Solana smart wallets."""
    adminSigner: Union[SolanaKeypairSigner, SolanaFireblocksSigner]

class SolanaSmartWalletOptions(TypedDict):
    """Options specific to Solana smart wallets."""
    connection: SolanaClient
    config: SolanaSmartWalletConfig
    linkedUser: Optional[LinkedUser]

class SolanaSmartWalletOptionsWithLinkedUser(TypedDict):
    connection: SolanaClient
    config: SolanaSmartWalletConfig
    linkedUser: LinkedUser

class SolanaSmartWalletOptionsWithAddress(TypedDict):
    connection: SolanaClient
    config: SolanaSmartWalletConfig
    address: str

class TransactionApproval(TypedDict):
    signer: str
    signature: Optional[str]

class SolanaSmartWalletClient(SolanaWalletClient, BaseWalletClient):
    def __init__(
        self,
        address: str,
        api_client: CrossmintWalletsAPI,
        options: SolanaSmartWalletOptions
    ):
        SolanaWalletClient.__init__(self, options.get("connection"))
        BaseWalletClient.__init__(self, address, api_client, "solana")
        self._locator = get_locator(address, options.get("linkedUser", None), "solana-smart-wallet")
        self._admin_signer = options["config"]["adminSigner"]

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

        return self.send_raw_transaction(serialized, required_signers, signer)

    def balance_of(self, address: str) -> Balance:
        pubkey = Pubkey.from_string(address)
        balance = self.client.get_balance(pubkey)
        
        return Balance(
            value=str(balance.value / 10**9),
            in_base_units=str(balance.value),
            decimals=9,
            symbol="SOL",
            name="Solana"
        )

    def send_approvals(
        self,
        transaction_id: str,
        message: str,
        signer_private_key: bytes
    ) -> None:
        """Send approval signatures for a pending transaction.
        
        Args:
            transaction_id: The ID of the transaction to approve
            message: The message to sign (usually transaction data)
            signer_private_key: The private key bytes of the signer
            
        Raises:
            ValueError: If signature generation or approval submission fails
        """
        try:
            # Generate detached signature using nacl
            signing_key = nacl.signing.SigningKey(signer_private_key)
            signature = signing_key.sign(base58.b58decode(message)).signature
            encoded_signature = base58.b58encode(signature).decode()

            # Send approval with signature
            approvals: List[Dict[str, str]] = [{
                "signer": "solana-keypair:" + self.derive_address_from_secret_key(self._admin_signer["secretKey"]) if "secretKey" in self._admin_signer else "",
                "signature": encoded_signature
            }]
            
            self._client.approve_transaction(
                self._locator,
                transaction_id,
                approvals=approvals
            )
        except Exception as e:
            raise ValueError(f"Failed to send transaction approval: {str(e)}")

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
                        approvals: List[Dict[str, str]] = []
                        for required_signer in required_signers:
                            approvals.append({
                                "signer": required_signer,
                                "signature": ""
                            })
                        self._client.approve_transaction(
                            self._locator,
                            response["id"],
                            approvals=approvals
                        )
                    elif "secretKey" in self._admin_signer:
                        # If we have an admin signer with a keypair, we should send the approval
                        message = status.get("approvals", {}).get("pending", [{}])[0].get("message")
                        if message:
                            self.send_approvals(
                                response["id"],
                                message,
                                base58.b58decode(self._admin_signer["secretKey"])
                            )
                    else:
                        approvals: List[Dict[str, str]] = [{"signer": signer or "", "signature": ""}]
                        self._client.approve_transaction(
                            self._locator,
                            response["id"],
                            approvals=approvals
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

    @staticmethod
    def derive_address_from_secret_key(secret_key: str) -> str:
        """Derive a Solana address from a base58-encoded secret key.
        
        Args:
            secret_key: Base58-encoded secret key string
            
        Returns:
            Base58-encoded public key (address) string
            
        Raises:
            ValueError: If the secret key is invalid
        """
        try:
            # Decode the base58 secret key
            decoded_key = base58.b58decode(secret_key)
            
            # Create signing key from bytes
            signing_key = nacl.signing.SigningKey(decoded_key)
            
            # Get verify key (public key)
            verify_key = signing_key.verify_key
            
            # Convert to bytes and encode as base58
            public_key_bytes = bytes(verify_key)
            return base58.b58encode(public_key_bytes).decode()
        except Exception as e:
            raise ValueError(f"Invalid secret key: {str(e)}")
