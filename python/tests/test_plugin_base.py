import pytest
from core.core.classes.plugin_base import PluginBase
from core.core.decorators.tool import Tool
from core.core.types.chain import Chain, EvmChain
from core.core.classes.wallet_client_base import WalletClientBase, Signature, Balance
from zon import ZonRecord, ZonString, ZonNumber
from core.core.utils.create_tool_parameters import create_tool_parameters

# Test schemas and classes (similar to test_tool.py)
test_schema = ZonRecord({
    "value": ZonString()
})

class TestWalletClient(WalletClientBase):
    def get_address(self) -> str:
        return "0x123"
    
    def get_chain(self) -> Chain:
        return EvmChain(type="evm", id=1)
    
    def sign_message(self, message: str) -> Signature:
        return Signature(signature=f"signed_{message}")
    
    def balance_of(self, address: str) -> Balance:
        return Balance(decimals=18, symbol="ETH", name="Ethereum", value="100", in_base_units="100")

# Test tool provider class
class TestToolProvider:
    @Tool({
        "description": "Test tool",
        "parameters": create_tool_parameters(test_schema)
    })
    def simple_tool(self, params: dict) -> str:
        return params["value"]
    
    @Tool({
        "description": "Test tool with wallet",
        "parameters": create_tool_parameters(test_schema)
    })
    def wallet_tool(self, params: dict, wallet: TestWalletClient) -> str:
        return f"{params['value']} from {wallet.get_address()}"

# Test plugin implementation
class TestPlugin(PluginBase[TestWalletClient]):
    def supports_chain(self, chain: Chain) -> bool:
        return chain["type"] == "evm"

# Tests
class TestPluginBase:
    @pytest.fixture
    def plugin(self):
        tool_provider = TestToolProvider()
        return TestPlugin("test_plugin", [tool_provider])
    
    @pytest.fixture
    def wallet_client(self):
        return TestWalletClient()

    def test_plugin_initialization(self, plugin):
        assert plugin.name == "test_plugin"
        assert len(plugin.tool_providers) == 1

    def test_chain_support(self, plugin):
        assert plugin.supports_chain({"type": "evm", "id": 1}) == True
        assert plugin.supports_chain({"type": "solana", "id": 1}) == False

    def test_get_tools(self, plugin, wallet_client):
        tools = plugin.get_tools(wallet_client)
        
        # Should find both tools from the provider
        assert len(tools) == 2
        
        # Test simple tool execution
        simple_tool = next(tool for tool in tools if tool.name == "simple_tool")
        result = simple_tool.execute({"value": "test"})
        assert result == "test"
        
        # Test wallet tool execution
        wallet_tool = next(tool for tool in tools if tool.name == "wallet_tool")
        result = wallet_tool.execute({"value": "test"})
        assert result == "test from 0x123"

    def test_plugin_with_no_tools(self):
        class EmptyProvider:
            pass

        plugin = TestPlugin("empty_plugin", [EmptyProvider()])
        tools = plugin.get_tools(TestWalletClient())
        assert len(tools) == 0

    def test_plugin_with_multiple_providers(self):
        provider1 = TestToolProvider()
        provider2 = TestToolProvider()
        
        plugin = TestPlugin("multi_plugin", [provider1, provider2])
        tools = plugin.get_tools(TestWalletClient())
        
        # Should get tools from both providers
        assert len(tools) == 4 

    def test_schema_validation(self, plugin, wallet_client):
        """Test that schema validation works when executing tools"""
        tools = plugin.get_tools(wallet_client)
        simple_tool = next(tool for tool in tools if tool.name == "simple_tool")
        
        # Valid input should work
        result = simple_tool.execute({"value": "test"})
        assert result == "test"
        
        # Invalid input should raise validation error
        with pytest.raises(Exception) as exc_info:
            simple_tool.execute({"value": 123})  # Number instead of string

    def test_schema_validation_missing_field(self, plugin, wallet_client):
        """Test validation when required field is missing"""
        tools = plugin.get_tools(wallet_client)
        simple_tool = next(tool for tool in tools if tool.name == "simple_tool")
        
        with pytest.raises(Exception) as exc_info:
            simple_tool.execute({})  # Missing required 'value' field

    def test_schema_validation_extra_field(self, plugin, wallet_client):
        """Test validation when extra unexpected field is provided"""
        tools = plugin.get_tools(wallet_client)
        simple_tool = next(tool for tool in tools if tool.name == "simple_tool")
        
        with pytest.raises(Exception) as exc_info:
            simple_tool.execute({
                "value": "test",
                "extra": "should not be here"
            })

    def test_async_tool(self, wallet_client):
        """Test that async tools work correctly in plugins"""
        # Create an async tool provider
        class AsyncToolProvider:
            @Tool({
                "description": "An async tool that delays and returns a signed message",
                "parameters": create_tool_parameters(ZonRecord({
                    "message": ZonString(),
                    "delay": ZonNumber()
                }))
            })
            async def delayed_sign(self, params: dict, wallet: TestWalletClient) -> str:
                import asyncio
                await asyncio.sleep(params["delay"])
                signed = await wallet.sign_message(params["message"])
                return f"{signed['signature']} after {params['delay']:.1f} seconds"
        
        # Create plugin with async tool
        plugin = TestPlugin("async_plugin", [AsyncToolProvider()])
        tools = plugin.get_tools(wallet_client)
        
        assert len(tools) == 1
        async_tool = tools[0]
        
        # Test async execution
        import asyncio
        
        # Test single execution
        result = asyncio.run(async_tool.execute({
            "message": "hello",
            "delay": 0.1
        }))
        assert result == "signed_hello after 0.1 seconds"
        
        # Test concurrent executions
        async def run_concurrent_tests():
            tasks = [
                async_tool.execute({
                    "message": f"msg{i}",
                    "delay": 0.1 * (i+1)
                })
                for i in range(3)
            ]
            return await asyncio.gather(*tasks)
        
        results = asyncio.run(run_concurrent_tests())
        assert results == [
            "signed_msg0 after 0.1 seconds",
            "signed_msg1 after 0.2 seconds",
            "signed_msg2 after 0.3 seconds"
        ]
        
        # Test parameter validation
        with pytest.raises(Exception):
            asyncio.run(async_tool.execute({
                "message": 123,  # should be string
                "delay": 0.1
            }))