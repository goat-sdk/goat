from goat.decorators.tool import Tool
from solders.pubkey import Pubkey
from solana.rpc.commitment import Confirmed
from spl.token.constants import TOKEN_PROGRAM_ID
from spl.token.instructions import get_associated_token_address, create_associated_token_account, transfer_checked
from solders.instruction import AccountMeta, Instruction
from .parameters import (
    GetTokenMintAddressBySymbolParameters,
    GetTokenBalanceByMintAddressParameters,
    TransferTokenByMintAddressParameters,
    ConvertToBaseUnitParameters,
)
from goat_wallets.solana import SolanaWalletClient
from .tokens import SPL_TOKENS, SolanaNetwork


class SplTokenService:
    def __init__(self, network: SolanaNetwork = "mainnet", tokens=SPL_TOKENS):
        self.network = network
        self.tokens = tokens

    @Tool({
        "description": "Get the SPL token info by its symbol, including the mint address, decimals, and name",
        "parameters_schema": GetTokenMintAddressBySymbolParameters
    })
    async def get_token_info_by_symbol(self, parameters: dict):
        """Get token info including mint address, decimals, and name by symbol."""
        try:
            token = next(
                (token for token in self.tokens 
                 if token["symbol"] == parameters["symbol"] or 
                 token["symbol"].lower() == parameters["symbol"].lower()),
                None
            )
            return {
                "symbol": token["symbol"] if token else None,
                "mintAddress": token["mintAddresses"][self.network] if token else None,
                "decimals": token["decimals"] if token else None,
                "name": token["name"] if token else None,
            }
        except Exception as error:
            raise Exception(f"Failed to get token info: {error}")

    @Tool({
        "description": "Get the balance of an SPL token by its mint address",
        "parameters_schema": GetTokenBalanceByMintAddressParameters
    })
    async def get_token_balance_by_mint_address(self, wallet_client: SolanaWalletClient, parameters: dict):
        """Get token balance for a specific mint address."""
        try:
            mint_pubkey = Pubkey.from_string(parameters["mintAddress"])
            wallet_pubkey = Pubkey.from_string(parameters["walletAddress"])
            
            token_account = get_associated_token_address(
                wallet_pubkey,
                mint_pubkey
            )
            
            # Check if account exists
            account_info = wallet_client.client.get_account_info(token_account)
            if not account_info.value:
                return 0
            
            # Get balance
            balance = wallet_client.client.get_token_account_balance(
                token_account,
                commitment=Confirmed
            )
            
            return balance.value
        except Exception as error:
            raise Exception(f"Failed to get token balance: {error}")

    @Tool({
        "description": "Transfer an SPL token by its mint address",
        "parameters_schema": TransferTokenByMintAddressParameters
    })
    async def transfer_token_by_mint_address(self, wallet_client: SolanaWalletClient, parameters: dict):
        """Transfer SPL tokens between wallets."""
        try:
            mint_pubkey = Pubkey.from_string(parameters["mintAddress"])
            from_pubkey = Pubkey.from_string(wallet_client.get_address())
            to_pubkey = Pubkey.from_string(parameters["to"])
            
            # Get token info for decimals
            token = next(
                (token for token in self.tokens 
                 if token["mintAddresses"][self.network] == parameters["mintAddress"]),
                None
            )
            if not token:
                raise Exception(f"Token with mint address {parameters['mintAddress']} not found")
            
            # Get associated token accounts
            from_token_account = get_associated_token_address(
                from_pubkey,
                mint_pubkey
            )
            to_token_account = get_associated_token_address(
                to_pubkey,
                mint_pubkey
            )
            
            # Check if accounts exist
            from_account_info = wallet_client.client.get_account_info(from_token_account)
            to_account_info = wallet_client.client.get_account_info(to_token_account)
            
            if not from_account_info.value:
                raise Exception(f"From account {str(from_token_account)} does not exist")
            
            instructions = []
            
            # Create destination token account if it doesn't exist
            if not to_account_info.value:
                instructions.append(
                    create_associated_token_account(
                        from_pubkey,  # payer
                        to_pubkey,    # owner
                        mint_pubkey   # mint
                    )
                )
            
            # Add transfer instruction
            instructions.append(
                Instruction(
                    program_id=TOKEN_PROGRAM_ID,
                    accounts=[
                        AccountMeta(pubkey=from_token_account, is_signer=False, is_writable=True),
                        AccountMeta(pubkey=mint_pubkey, is_signer=False, is_writable=False),
                        AccountMeta(pubkey=to_token_account, is_signer=False, is_writable=True),
                        AccountMeta(pubkey=from_pubkey, is_signer=True, is_writable=False),
                    ],
                    data=bytes([11]) + int(str(parameters["amount"])).to_bytes(8, 'little') + bytes([token["decimals"]])
                )
            )
            
            from goat_wallets.solana import SolanaTransaction
            # Create transaction with proper type
            tx: SolanaTransaction = {
                "instructions": instructions,
                "address_lookup_table_addresses": None,
                "accounts_to_sign": None
            }
            return wallet_client.send_transaction(tx)
        except Exception as error:
            raise Exception(f"Failed to transfer tokens: {error}")

    @Tool({
        "description": "Convert an amount of an SPL token to its base unit",
        "parameters_schema": ConvertToBaseUnitParameters
    })
    async def convert_to_base_unit(self, parameters: dict):
        """Convert token amount to base unit."""
        try:
            amount = parameters["amount"]
            decimals = parameters["decimals"]
            base_unit = int(amount * 10 ** decimals)
            return base_unit
        except Exception as error:
            raise Exception(f"Failed to convert to base unit: {error}")
