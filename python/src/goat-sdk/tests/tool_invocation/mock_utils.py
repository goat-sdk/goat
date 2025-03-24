from unittest.mock import MagicMock, patch
from goat.classes.wallet_client_base import WalletClientBase

# Mock wallet client for testing
class MockWalletClient(WalletClientBase):
    def get_chain(self):
        return {"type": "solana"}
        
    def get_address(self):
        return "0xmockaddress"
        
    def get_core_tools(self):
        return []
        
    async def sign_message(self, message: str):
        return {"signature": f"mock-signature-for-{message}"}
        
    async def balance_of(self, address: str):
        return {
            "decimals": 18,
            "symbol": "MOCK",
            "name": "Mock Token",
            "value": "100.0",
            "inBaseUnits": "100000000000000000000"
        }

# Create execution spy
def create_tool_execution_spy():
    spy = MagicMock()
    return spy

# Mock response context manager
class MockResponse:
    def __init__(self, data, status=200):
        self.data = data
        self.status = status
        self.ok = status < 400
        
    async def __aenter__(self):
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        pass
        
    async def json(self):
        return self.data
        
    async def text(self):
        return str(self.data)
