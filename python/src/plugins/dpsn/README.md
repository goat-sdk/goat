# Dpsn Plugin for GOAT SDK

This plugin enables goat-agents to  connect  , subscribe to, and interact with data streams available on the [DPSN Data Streams MarketPlace](https://streams.dpsn.org/).

Agents can leverage this plugin to consume real-time data for decision-making, reacting to events, or integrating external information feeds.

To provide personalized data streams for your agents, you can create and publish data into your own DPSN topics using the [dpsn-client for node](https://github.com/DPSN-org/dpsn-client-nodejs).

For more information, visit:
-   [DPSN Official Website](https://dpsn.org)

## ✨ Features

- **Seamless Integration**: Connect your GOAT agents to DPSN's decentralized pub/sub network
- **Real-time Data Processing**: Subscribe to and process real-time data streams in your agents
- **Topic Management**: Subscribe and unsubscribe to DPSN topics programmatically or through llm queries
- **Event-based Architecture**: Use event handlers to handle incoming messages efficiently

## Installation

```bash
# Install the plugin
poetry add goat-sdk-plugin-dpsn

```

## Usage

```python
from goat_plugins.dpsn import dpsn,DpsnPluginOptions


# setup a message callback handler to consume incoming messages from topic subscription

def handle_message(message:Dict[str,Any]):
    return message

# Initialize the plugin
options = DpsnPluginOptions(
    dpsn_url="betanet.dpsn.org",
    evm_wallet_pvt_key="ethereum_pvt_key",# can use any ethrereum compliant pvt , just used for authentication purpose
    handle_message
)
plugin = dpsn_plugin(options)

# subscribe to topic 
plugin.subscribe("0xe14768a6d8798e4390ec4cb8a4c991202c2115a5cd7a6c0a7ababcaf93b4d2d4/BTCUSDT/ticker")

#unsubscribe to topic
plugin.unsubscribe("0xe14768a6d8798e4390ec4cb8a4c991202c2115a5cd7a6c0a7ababcaf93b4d2d4/BTCUSDT/ticker")
```
## Tools
* Subscribe to a dpsn topic
* Unsubscribe to a dpsn topic




## License

This project is licensed under the terms of the MIT license.
