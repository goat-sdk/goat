# Superfluid Plugin for GOAT SDK

This plugin provides integration with Superfluid Protocol for the GOAT SDK, enabling token streaming and pool management capabilities.

## Features

- Create, update, or delete token streams
- Get flow rates between addresses
- Manage pool memberships
- Query pool statistics

## Installation

```bash
poetry add goat-sdk-plugin-superfluid
```

## Usage

```python
from goat_plugins.superfluid import superfluid, SuperfluidPluginOptions

# Initialize the plugin
plugin = superfluid()
```

## Tools

The plugin provides the following tools:

- `flow`: Create, update, or delete a flow of tokens
- `get_flowrate`: Get the current flowrate between addresses
- `update_member_units`: Update units for a pool member
- `get_units`: Get units of a pool member
- `get_member_flow_rate`: Get flow rate of a pool member
- `get_total_flow_rate`: Get total flow rate of a pool
