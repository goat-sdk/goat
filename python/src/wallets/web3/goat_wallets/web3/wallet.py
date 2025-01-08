from typing import Dict, Optional
from eth_typing import ChecksumAddress, HexStr
from goat.classes.wallet_client_base import Balance, Signature
from web3 import Web3
from web3.types import Wei, TxParams
from eth_utils.address import to_checksum_address
from eth_account.messages import encode_typed_data

from goat.types.chain import EvmChain
from goat_wallets.evm import EVMWalletClient
from goat_wallets.evm.types import (
    EVMTransaction,
    EVMReadRequest,
    EVMReadResult,
    EVMTypedData,
    PaymasterOptions,
)


class Web3Options:
    def __init__(
        self,
        paymaster: Optional[PaymasterOptions] = None,
    ):
        self.paymaster = paymaster


class Web3EVMWalletClient(EVMWalletClient):
    def __init__(self, web3: Web3, options: Optional[Web3Options] = None):
        super().__init__()
        self._web3 = web3
        self._default_paymaster_address = (
            options.paymaster["address"] if options and options.paymaster else None
        )
        self._default_paymaster_input = (
            options.paymaster["input"] if options and options.paymaster else None
        )

    def get_address(self) -> str:
        if not self._web3.eth.default_account:
            return ""
        return self._web3.eth.default_account

    def get_chain(self) -> EvmChain:
        chain_id = self._web3.eth.chain_id
        return {"type": "evm", "id": chain_id}

    def resolve_address(self, address: str) -> ChecksumAddress:
        """Resolve an address to its canonical form."""
        # Check if it's already a valid address
        if Web3.is_address(address):
            return to_checksum_address(address)

        # Try ENS resolution if it's a domain
        try:
            resolved = self._web3.ens.address(address)  # type: ignore
            if not resolved:
                raise ValueError("ENS name could not be resolved")
            return to_checksum_address(resolved)
        except Exception as e:
            raise ValueError(f"Failed to resolve ENS name: {str(e)}")

    def sign_message(self, message: str) -> Signature:
        """Sign a message with the current account."""
        if not self._web3.eth.default_account:
            raise ValueError("No account connected")

        signature = self._web3.eth.sign(self._web3.eth.default_account, text=message)
        return {"signature": signature}

    def sign_typed_data(self, data: EVMTypedData) -> Signature:
        """Sign typed data according to EIP-712."""
        if not self._web3.eth.default_account:
            raise ValueError("No account connected")

        # Convert chain_id to int if it's present
        if "chainId" in data["domain"]:
            data["domain"]["chainId"] = int(data["domain"]["chainId"])

        structured_data = encode_typed_data(full_message=data)  # type: ignore
        signature = self._web3.eth.sign(self._web3.eth.default_account, structured_data)
        return {"signature": signature}

    def send_transaction(self, transaction: EVMTransaction) -> Dict[str, str]:
        """Send a transaction on the EVM chain."""
        if not self._web3.eth.default_account:
            raise ValueError("No account connected")

        to_address = self.resolve_address(transaction["to"])

        # Get paymaster options
        paymaster = transaction.get("options", {}).get("paymaster", {})
        paymaster_address = paymaster.get("address", self._default_paymaster_address)
        paymaster_input = paymaster.get("input", self._default_paymaster_input)

        # Simple ETH transfer
        if not transaction.get("abi"):
            tx_params: TxParams = {
                "from": self._web3.eth.default_account,
                "to": to_checksum_address(to_address),
                "value": Wei(transaction.get("value", 0)),
            }

            if paymaster_address and paymaster_input:
                tx_params["paymaster"] = to_checksum_address(paymaster_address)
                tx_params["paymasterInput"] = paymaster_input

            tx_hash = self._web3.eth.send_transaction(tx_params)
            return self._wait_for_receipt(HexStr(tx_hash.to_0x_hex()))

        # Contract call
        function_name = transaction.get("functionName")
        if not function_name:
            raise ValueError("Function name is required for contract calls")

        contract = self._web3.eth.contract(
            address=to_checksum_address(to_address), abi=transaction["abi"]  # type: ignore
        )

        # Build the transaction
        contract_function = getattr(contract.functions, function_name)
        args = transaction.get("args", [])

        # Estimate gas and get the transaction parameters
        tx_params = {
            "from": self._web3.eth.default_account,
            "value": Wei(transaction.get("value", 0)),
        }

        if paymaster_address and paymaster_input:
            tx_params["paymaster"] = to_checksum_address(paymaster_address)
            tx_params["paymasterInput"] = paymaster_input

        # Send the transaction
        tx_hash = contract_function(*args).transact(tx_params)

        return self._wait_for_receipt(HexStr(tx_hash.to_0x_hex()))

    def read(self, request: EVMReadRequest) -> EVMReadResult:
        """Read data from a smart contract."""
        contract = self._web3.eth.contract(
            address=self.resolve_address(request["address"]), abi=request["abi"]
        )

        function = getattr(contract.functions, request["functionName"])
        args = request.get("args", [])
        result = function(*args).call()

        return {"value": result}

    def balance_of(self, address: str) -> Balance:
        """Get the balance of an address."""
        resolved_address = self.resolve_address(address)
        balance_wei = self._web3.eth.get_balance(resolved_address)

        chain_id = self._web3.eth.chain_id
        # Note: You might want to implement a chain registry to get proper currency details
        decimals = 18  # ETH decimals
        symbol = "ETH"
        name = "Ether"

        formatted_balance = Web3.from_wei(balance_wei, "ether")

        return {
            "value": str(formatted_balance),
            "decimals": decimals,
            "symbol": symbol,
            "name": name,
            "in_base_units": str(balance_wei),
        }

    def _wait_for_receipt(self, tx_hash: HexStr) -> Dict[str, str]:
        """Wait for a transaction receipt and return standardized result."""
        receipt = self._web3.eth.wait_for_transaction_receipt(tx_hash)
        return {
            "hash": receipt["transactionHash"].hex(),
            "status": "1" if receipt["status"] == 1 else "0",
        }


def web3(client: Web3, options: Optional[Web3Options] = None) -> Web3EVMWalletClient:
    """Create a new Web3EVMWalletClient instance."""
    return Web3EVMWalletClient(client, options)
