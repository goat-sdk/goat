from decimal import Decimal

from pydantic import BaseModel, Field
from solders.pubkey import Pubkey
from solders.system_program import transfer, TransferParams

# Import Tool decorator
from goat.decorators.tool import Tool
from goat.classes.plugin_base import PluginBase
from goat.types.chain import Chain

from .wallet import SolanaWalletClient, SolanaTransaction


class SendSOLParameters(BaseModel):
    to: str = Field(description="The address to send SOL to")
    amount: str = Field(description="The amount of SOL to send")


class SendSolService:
    """Service class containing the tool implementation for sending SOL."""

    @Tool({
        "description": "Send SOL to an address.",
        "parameters_schema": SendSOLParameters
    })
    def send_sol_tool(self, wallet_client: SolanaWalletClient, parameters: dict) -> str:
        """Implementation of the send_SOL tool."""
        try:
            params_model = SendSOLParameters(**parameters)
            to_address = params_model.to
            amount_str = params_model.amount

            sender_address = wallet_client.get_address()
            lamports = int(Decimal(amount_str) * (10**9))

            transfer_instruction = transfer(
                TransferParams(
                    from_pubkey=Pubkey.from_string(sender_address),
                    to_pubkey=Pubkey.from_string(to_address),
                    lamports=lamports,
                )
            )

            tx: SolanaTransaction = {
                "instructions": [transfer_instruction],
                "address_lookup_table_addresses": None,
                "accounts_to_sign": None,
                "signer": None, # Falls back to the wallet main signer
            }
            tx_result = wallet_client.send_transaction(tx)

            if "hash" not in tx_result:
                raise ValueError("Transaction submission did not return a hash.")
            return tx_result["hash"]

        except Exception as error:
            print(f"Error sending SOL: {error}")
            raise RuntimeError(f"Failed to send SOL: {error}") from error


class SendSOLPlugin(PluginBase[SolanaWalletClient]):
    """Plugin to enable sending SOL using the service class."""

    def __init__(self):
        # Instantiate the service
        self.service = SendSolService()
        # Pass the service instance to PluginBase, it will extract tools
        super().__init__("sendSOL", [self.service])

    def supports_chain(self, chain: Chain) -> bool:
        """Check if the plugin supports the given chain."""
        return chain["type"] == "solana"

def send_sol() -> SendSOLPlugin:
    """Factory function to create an instance of SendSOLPlugin."""
    return SendSOLPlugin() 