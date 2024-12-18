from typing import Optional
from web3 import Web3
from web3.contract import Contract
from goat_sdk.core.wallets import (
    EVMWalletClient,
    EVMChain,
    EVMReadRequest,
    EVMReadResult,
    EVMTransaction,
    EVMTransactionResult,
    Chain,
    Signature,
    Balance,
)


class Web3EVMWalletClient(EVMWalletClient):
    def __init__(self, web3: Web3):
        self.web3 = web3

    def get_address(self) -> str:
        return self.web3.eth.accounts[0]

    def get_chain(self) -> Chain:
        return EVMChain(id=self.web3.eth.chain_id)

    async def sign_message(self, message: str) -> Signature:
        accounts = self.web3.eth.accounts
        if not self.web3.is_connected() or len(accounts) < 1:
            raise ConnectionError("No account connected")
        signature = self.web3.eth.sign(accounts[0], text=message)
        return Signature(signature)

    async def resolve_address(self, address: str) -> str:
        return self.web3.to_checksum_address(address)

    async def balance_of(self, address: Optional[str] = "") -> Balance:
        chksum_address = (
            await self.resolve_address(address) if address != "" else self.get_address()
        )
        balance = self.web3.eth.get_balance(chksum_address)
        dec = Web3.from_wei(balance, "ether")
        return Balance(decimals=18, name="ether", symbol="eth", value=dec)

    async def send_transaction(
        self, transaction: EVMTransaction
    ) -> EVMTransactionResult:
        accounts = self.web3.eth.accounts
        if not self.web3.is_connected() or len(accounts) < 1:
            raise ConnectionError("No account connected")
        to_addr = await self.resolve_address(transaction.to)

        # Simple ETH transfer (no ABI)
        if not transaction.abi:
            tx = {"to": to_addr, "from": accounts[0], "value": transaction.value}
            hash = self.web3.eth.send_transaction(tx)
        else:
            if not transaction.function_name:
                raise ValueError("Function name is required for contract calls")

            contract: Contract = self.web3.eth.contract(
                address=to_addr, abi=transaction.abi
            )
            fn = contract.functions[transaction.function_name]
            hash = fn(*transaction.args).transact()

        receipt = self.web3.eth.wait_for_transaction_receipt(hash)
        return EVMTransactionResult(
            hash=receipt["transactionHash"], status=receipt["status"]
        )

    async def read(self, request: EVMReadRequest) -> EVMReadResult:
        if not request.abi:
            raise ValueError("Read request must include ABI for EVM")
        contract: Contract = self.web3.eth.contract(
            address=request.address, abi=request.abi
        )
        fn = contract.functions[request.function_name]
        result = fn(*request.args).call()
        return EVMReadResult(value=result)
