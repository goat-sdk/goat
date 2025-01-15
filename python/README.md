# Goat 🐐 - Python

[Docs](https://ohmygoat.dev) | [Examples](https://github.com/goat-sdk/goat/tree/main/typescript/examples) | [Discord](https://discord.gg/goat-sdk)

## Plugin Development

GOAT SDK supports easy plugin development through our plugin generator script. This tool helps you quickly scaffold new plugins with the correct structure and boilerplate code.

### Creating a New Plugin

To create a new plugin, use the plugin generator script from the Python directory:

```bash
cd python
python scripts/create_plugin.py <plugin-name> [--evm]
```

Options:
- `<plugin-name>`: Name of your plugin (e.g., 'my-token', 'my-service')
- `--evm`: Optional flag to indicate if the plugin is EVM-compatible

Examples:
1. Create an EVM-compatible plugin:
```bash
python scripts/create_plugin.py my-token --evm
```

2. Create a chain-agnostic plugin:
```bash
python scripts/create_plugin.py my-service
```

### Generated Structure

The script generates a complete plugin package with the following structure:

```
src/plugins/<plugin-name>/
├── pyproject.toml          # Project configuration and dependencies
├── README.md              # Plugin documentation
└── goat_plugins/<plugin-name>/
    ├── __init__.py       # Plugin initialization and configuration
    ├── parameters.py     # Pydantic parameter models
    └── service.py        # Service implementation with Tool decorators
```
For more information about plugin development, check out our [documentation](https://ohmygoat.dev).


