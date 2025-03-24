import inspect
from typing import Dict, Any, Type
from pydantic import BaseModel
from goat.classes.plugin_base import PluginBase
    
# Create a mock plugin
def create_mock_plugin(name: str, service: Any) -> PluginBase:
    class MockPlugin(PluginBase):
        def supports_chain(self, chain):
            return True
            
    return MockPlugin(name, [service])
    
# Helper to get the tool from a service class
def get_tool_from_service(service_instance, tool_name: str):
    for name, method in inspect.getmembers(service_instance, inspect.ismethod):
        if hasattr(method, "__goat_tool__") and method.__goat_tool__.name == tool_name:
            return method
    return None
