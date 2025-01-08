# Goat 🐐 - Python SDK

Goat (Great Onchain Agent Toolkit) is an open-source framework for connecting AI agents to any onchain app.

[![Discord](https://img.shields.io/discord/1234567890?color=7289da&label=Discord&logo=discord&logoColor=white)](https://discord.gg/goat-sdk)
[![Documentation](https://img.shields.io/badge/docs-ohmygoat.dev-blue)](https://ohmygoat.dev)

## Installation

```bash
pip install goat-sdk
```

Or with Poetry:

```bash
poetry add goat-sdk
```

## Quick Start

```python
from goat import WalletClientBase, create_tool
from pydantic import BaseModel, Field

# Create a wallet client
wallet = MyWalletClient()

# Create a tool with parameters
class GetBalanceParameters(BaseModel):
    address: str = Field(description="The address to get the balance of")

@Tool({
    "description": "Get the balance of an address",
    "parameters": GetBalanceParameters
})
def get_balance(params: dict) -> str:
    balance = await wallet.balance_of(params["address"])
    return f"{balance.value} {balance.symbol}"

# Get all available tools
tools = get_tools(wallet, plugins=[
    CoinGeckoPlugin(),
    ERC20Plugin()
])
```

## Features

-   🔌 Plugin System - Extend functionality with plugins
-   🔗 Multi-Chain Support - EVM, Solana, Aptos, and more
-   🛠️ Tool Framework - Create custom tools for AI agents
-   📦 Type Safety - Full type support with Python type hints
-   ⚡ Async Support - Built for high performance

## Documentation

Visit our [documentation](https://ohmygoat.dev) for:

-   Detailed guides
-   API reference
-   Examples
-   Plugin development
-   Best practices

## Examples

Check out our [examples directory](https://github.com/goat-sdk/goat/tree/main/python/examples) for complete working examples.

## Development

1. Clone the repository:

```bash
git clone https://github.com/goat-sdk/goat.git
cd goat/python
```

2. Install dependencies:

```bash
poetry install
```

3. Run tests:

```bash
poetry run pytest
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Community

-   [Discord](https://discord.gg/goat-sdk)
-   [Twitter](https://twitter.com/goat_sdk)
-   [GitHub Discussions](https://github.com/goat-sdk/goat/discussions)
