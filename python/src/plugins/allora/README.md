# Allora Plugin for GOAT SDK

A plugin for the GOAT SDK that provides AI-powered blockchain analytics and predictive modeling capabilities through the Allora API.

## Installation

```bash
# Install the plugin
poetry add goat-sdk-plugin-allora

# Install optional wallet dependencies for chain-specific operations
poetry add goat-sdk-wallet-evm
poetry add goat-sdk-wallet-solana
```

## Usage

```python
from goat_plugins.allora import allora, AlloraPluginOptions

# Initialize the plugin
options = AlloraPluginOptions(
    api_key="${OPENAI_API_KEY}",  # Contact the Allora team on Discord for access to API keys
    model="allora-v1"  # Optional: Specify model version
)
plugin = allora(options)

# Get price prediction
prediction = await plugin.predict_price(
    token_address="0x6B175474E89094C44Da98b954EedeAC495271d0F",  # DAI
    chain_id=1,  # Ethereum
    timeframe="1d"  # Prediction timeframe
)

# Analyze token sentiment
sentiment = await plugin.analyze_sentiment(
    token_address="0x6B175474E89094C44Da98b954EedeAC495271d0F",  # DAI
    chain_id=1,
    data_sources=["social", "on-chain"]
)

# Get market insights
insights = await plugin.get_market_insights(
    chain_id=1,
    category="defi",
    timeframe="7d"
)
```

## Features

- AI-Powered Analytics:
  - Price predictions
  - Market sentiment analysis
  - Pattern recognition
  - Anomaly detection
  
- Data Integration:
  - On-chain data analysis
  - Social sentiment analysis
  - Technical indicators
  - Volume profiling
  
- Market Intelligence:
  - Trend identification
  - Risk assessment
  - Market correlation
  - Volatility analysis
  
- Supported Networks:
  - Ethereum
  - Polygon
  - BSC
  - Arbitrum
  - Optimism
  - Avalanche
  - Solana
  - Base
  
- Advanced Features:
  - Custom model training
  - Real-time predictions
  - Backtesting capabilities
  - Multi-timeframe analysis

## License

This project is licensed under the terms of the MIT license.
