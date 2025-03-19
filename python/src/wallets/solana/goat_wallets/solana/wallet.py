from abc import ABC, abstractmethod
from typing import Dict, Optional, TypedDict, List, Any

import base64
from solana.rpc.api import Client as SolanaClient
from solana.rpc.types import TxOpts
from solana.rpc.commitment import Confirmed
from solders.pubkey import Pubkey
from solders.keypair import Keypair
from solders.instruction import Instruction, AccountMeta, CompiledInstruction
from solders.message import Message, MessageV0
from solders.address_lookup_table_account import AddressLookupTableAccount
from solders.transaction import VersionedTransaction, Transaction
import nacl.signing

from goat.classes.wallet_client_base import Balance, Signature, WalletClientBase
from goat.types.chain import Chain


class SolanaTransaction(TypedDict):
    """Transaction parameters for Solana transactions."""

    instructions: List[Instruction]
    address_lookup_table_addresses: Optional[List[str]]
    accounts_to_sign: Optional[List[Keypair]]
    signer: Keypair


class SolanaOptions:
    """Configuration options for Solana wallet clients."""

    def __init__(self):
        pass


class SolanaWalletClient(WalletClientBase, ABC):
    """Base class for Solana wallet implementations."""

    def __init__(self, client: SolanaClient):
        """Initialize the Solana wallet client.

        Args:
            client: A Solana RPC client instance
        """
        self.client = client

    def get_chain(self) -> Chain:
        """Get the chain type for Solana."""
        return {"type": "solana"}

    @abstractmethod
    def get_address(self) -> str:
        """Get the wallet's public address."""
        pass

    @abstractmethod
    def sign_message(self, message: str) -> Signature:
        """Sign a message with the wallet's private key."""
        pass

    @abstractmethod
    def balance_of(self, address: str) -> Balance:
        """Get the SOL balance of an address."""
        pass

    @abstractmethod
    def send_transaction(self, transaction: SolanaTransaction) -> Dict[str, str]:
        """Send a transaction on the Solana chain.

        Args:
            transaction: Transaction parameters including instructions and optional lookup tables

        Returns:
            Dict containing the transaction hash
        """
        pass

    @abstractmethod
    def send_raw_transaction(self, transaction: str) -> Dict[str, str]:
        """Send a raw transaction on the Solana chain.

        Args:
            transaction: Base64 encoded transaction string

        Returns:
            Dict containing the transaction hash
        """
        pass


    def _decompile_instruction(self, compiled_ix: CompiledInstruction, account_keys: list[Pubkey], message: Message) -> Optional[Instruction]:
        try:
            # Get program id from the account keys
            program_id = account_keys[compiled_ix.program_id_index]
            
            # Transform account indexes into AccountMeta objects
            accounts = []
            for idx in compiled_ix.accounts:
                try:
                    pubkey = account_keys[idx]
                    # You might need to check header/message metadata to determine 
                    # if the account is writable/signer
                    is_signer = message.is_signer(idx)
                    # Handle both Message and MessageV0 types
                    if isinstance(message, MessageV0):
                        is_writable = message.is_maybe_writable(idx)
                    else:
                        # For legacy messages, check if it's in the writable accounts range
                        header = message.header
                        num_required_signatures = header.num_required_signatures
                        num_readonly_signed = header.num_readonly_signed_accounts
                        num_readonly_unsigned = header.num_readonly_unsigned_accounts
                        
                        if idx < (num_required_signatures - num_readonly_signed):
                            is_writable = True
                        elif idx < num_required_signatures:
                            is_writable = False
                        elif idx < (len(account_keys) - num_readonly_unsigned):
                            is_writable = True
                        else:
                            is_writable = False
                            
                    accounts.append(AccountMeta(pubkey, is_signer=is_signer, is_writable=is_writable))
                except IndexError:
                    print(f"Could not find account at index {idx}")
                    return None
            
            return Instruction(
                program_id=program_id,
                accounts=accounts,
                data=compiled_ix.data
            )
        except IndexError:
            print(f"Could not find program id at index {compiled_ix.program_id_index}")
            return None

    def decompile_versioned_transaction_to_instructions(self, versioned_transaction: VersionedTransaction) -> Optional[List[Instruction]]:
        """Decompile a versioned transaction into its constituent instructions.

        Args:
            versioned_transaction: The versioned transaction to decompile

        Returns:
            List of instructions from the transaction if successful, None if we can't
            properly decompile all instructions
        """
        # Convert CompiledInstructions back to Instructions
        message = versioned_transaction.message
        
        # For MessageV0, we need to get all accounts including those from lookup tables
        if isinstance(message, MessageV0) and message.address_table_lookups:
            # Get lookup table accounts
            lookup_table_keys = [str(lookup.account_key) for lookup in message.address_table_lookups]
            lookup_tables = self.get_address_lookup_table_accounts(lookup_table_keys)
            
            # Filter out None lookup tables and their corresponding lookups
            valid_lookups = []
            valid_tables = []
            for i, table in enumerate(lookup_tables):
                if table is not None:
                    valid_lookups.append(message.address_table_lookups[i])
                    valid_tables.append(table)
            
            # Build complete account list
            account_keys = list(message.account_keys)  # Static accounts
            
            # Add writable accounts from valid lookup tables
            for lookup, table in zip(valid_lookups, valid_tables):
                for idx in lookup.writable_indexes:
                    account_keys.append(table.addresses[idx])
            
            # Add readonly accounts from valid lookup tables
            for lookup, table in zip(valid_lookups, valid_tables):
                for idx in lookup.readonly_indexes:
                    account_keys.append(table.addresses[idx])
        else:
            account_keys = message.account_keys

        instructions = []
        for compiled_ix in message.instructions:
            ix = self._decompile_instruction(compiled_ix, account_keys, message) # type: ignore
            if ix is not None:
                instructions.append(ix)

        return instructions

    def get_address_lookup_table_accounts(self, keys: List[str]) -> List[AddressLookupTableAccount]:
        """Get address lookup table accounts for the given addresses.

        Args:
            addresses: List of lookup table addresses

        Returns:
            List of address lookup table accounts
        """
        lookup_table_accounts = []
        
        for key in keys:
            # Convert address to Pubkey
            pubkey = Pubkey.from_string(key)
            
            # Get account info
            try:
                account_info = self.client.get_account_info(pubkey).value
            except Exception as e:
                print(f"Error getting account info for {key}: {e}")
                account_info = None
            
            if account_info is not None:
                try:
                    # The account data comes as base64, need to decode it first
                    decoded_data = base64.b64decode(account_info.data)
                    lookup_table_account = AddressLookupTableAccount.from_bytes(decoded_data)
                    lookup_table_accounts.append(lookup_table_account)
                except Exception as e:
                    print(f"Error decoding lookup table for {key}: {e}")
                    lookup_table_accounts.append(None)
            else:
                lookup_table_accounts.append(None)
                
        return lookup_table_accounts


class SolanaKeypairWalletClient(SolanaWalletClient):
    """Solana wallet implementation using a keypair."""

    def __init__(self, client: SolanaClient, keypair: Keypair):
        """Initialize the Solana keypair wallet client.

        Args:
            client: A Solana RPC client instance
            keypair: A Solana keypair for signing transactions
        """
        super().__init__(client)
        self.keypair = keypair

    def get_address(self) -> str:
        """Get the wallet's public address."""
        return str(self.keypair.pubkey())

    def sign_message(self, message: str) -> Signature:
        """Sign a message with the wallet's private key."""
        message_bytes = message.encode("utf-8")
        signed = nacl.signing.SigningKey(self.keypair.secret()).sign(message_bytes)
        return {"signature": signed.signature.hex()}

    def balance_of(self, address: str) -> Balance:
        """Get the SOL balance of an address."""
        pubkey = Pubkey.from_string(address)
        balance_lamports = self.client.get_balance(pubkey).value
        # Convert lamports (1e9 lamports in 1 SOL)
        return {
            "decimals": 9,
            "symbol": "SOL",
            "name": "Solana",
            "value": str(balance_lamports / 10**9),
            "in_base_units": str(balance_lamports),
        }

    def send_transaction(self, transaction: SolanaTransaction) -> Dict[str, str]:
        """Send a transaction on the Solana chain."""
        # Get latest blockhash
        recent_blockhash = self.client.get_latest_blockhash().value.blockhash

        # Create transaction
        tx = Transaction.new_with_payer(
            instructions=transaction["instructions"],
            payer=self.keypair.pubkey(),
        )

        # Add signers
        signers = [self.keypair]
        additional_signers = transaction.get("accounts_to_sign")
        if additional_signers is not None:
            signers.extend(additional_signers)

        # Sign and send transaction
        tx.sign(signers, recent_blockhash=recent_blockhash)
        result = self.client.send_transaction(
            tx,
            opts=TxOpts(
                skip_preflight=False,
                max_retries=10,
                preflight_commitment=Confirmed,
            ),
        )

        # Wait for confirmation
        self.client.confirm_transaction(
            result.value,
            commitment=Confirmed,
        )

        return {"hash": str(result.value)}

    def send_raw_transaction(self, transaction: str) -> Dict[str, str]:
        """Send a raw transaction on the Solana chain.
        
        Args:
            transaction: Base64 encoded transaction string
            
        Returns:
            Dict containing the transaction hash
        """
        # Deserialize the transaction from base64
        tx = VersionedTransaction.from_bytes(base64.b64decode(transaction))
        
        # Extract the message from the transaction and sign it, forming a new transaction
        tx_signed = VersionedTransaction(tx.message, [self.keypair])
        
        # Send the transaction
        result = self.client.send_transaction(
            tx_signed,
            opts=TxOpts(
                skip_preflight=False,
                max_retries=10,
                preflight_commitment=Confirmed,
            ),
        )
        
        # Wait for confirmation
        self.client.confirm_transaction(
            result.value,
            commitment=Confirmed,
        )
        
        return {"hash": str(result.value)}


def solana(client: SolanaClient, keypair: Keypair) -> SolanaKeypairWalletClient:
    """Create a new SolanaKeypairWalletClient instance.

    Args:
        client: A Solana RPC client instance
        keypair: A Solana keypair for signing transactions

    Returns:
        A new SolanaKeypairWalletClient instance
    """
    return SolanaKeypairWalletClient(client, keypair)
