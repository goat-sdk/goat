# Solana Amazon Purchase Agent

This example demonstrates how to create an AI agent that can purchase Amazon items using Solana cryptocurrency through the GOAT SDK and Crossmint's headless checkout.

## Features

- 🛒 Purchase Amazon items with Solana cryptocurrency
- 🔗 Support for USDC-SPL, SOL, and other Solana tokens
- 🤖 AI-powered conversational interface using LangChain
- 🔐 Secure wallet integration with private key management
- 📦 Complete shipping and billing address handling

## Prerequisites

- Python 3.8+
- Solana wallet with sufficient funds
- OpenAI API key
- Crossmint API key

## Installation

1. **Clone the repository and navigate to this example:**
   ```bash
   cd python/examples/by-use-case/solana-purchase-on-amazon
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

   For local development with the GOAT SDK:
   ```bash
   pip install -e ../../../src/goat-sdk
   pip install -e ../../../src/wallets/solana
   pip install -e ../../../src/adapters/langchain
   pip install -e ../../../src/plugins/headless
   ```

## Configuration

1. **Create a `.env` file:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your environment variables:**
   ```env
   # OpenAI API Key (required)
   OPENAI_API_KEY=your_openai_api_key_here

   # Crossmint API Key (required)
   CROSSMINT_API_KEY=your_crossmint_api_key_here

   # Solana wallet private key (required)
   # Can be in hex format (0x...) or base58 format
   WALLET_PRIVATE_KEY=your_solana_private_key_here

   # Solana RPC URL (optional, defaults to devnet)
   RPC_PROVIDER_URL=https://api.devnet.solana.com
   ```

## Usage

1. **Run the agent:**
   ```bash
   python main.py
   ```

2. **Interact with the agent:**
   ```
   🛒 Welcome to the Solana Amazon Purchase Agent!
   You can ask me to purchase Amazon items using Solana crypto.
   Type "exit" to quit.

   💬 You: I want to buy https://amazon.com/dp/B08SVZ775L
   ```

3. **Provide required information:**
   The agent will ask for:
   - Product URL or Amazon product ID
   - Full shipping address
   - Recipient email address
   - Payment method preference (USDC-SPL, SOL, etc.)

## Example Conversation

```
💬 You: I want to buy https://amazon.com/dp/B08SVZ775L

🤖 Assistant: I'd be happy to help you purchase that Amazon item using Solana cryptocurrency! 

To proceed with the purchase, I'll need the following information:

1. **Full shipping address** (format: Name, Street, City, State ZIP, Country)
2. **Recipient email address**
3. **Payment method preference** (USDC-SPL, SOL, etc.)

Please provide these details so I can process your order.

💬 You: Ship to John Doe, 123 Main St, New York, NY 10001, USA. Email: john@example.com. Pay with USDC-SPL.

🤖 Assistant: Perfect! I have all the information needed. Let me process your Amazon purchase now.

[Tool execution and purchase completion...]

✅ Your order has been successfully created and payment sent! 
Transaction ID: abc123...
Order ID: order_xyz789...
```

## Supported Features

### Payment Methods
- USDC-SPL (Solana USDC)
- SOL (Native Solana)
- Other SPL tokens (depending on availability)

### Amazon Products
- Physical products with shipping
- Digital products
- Subscription services (where supported)

### Shipping
- US and international shipping (where supported by Crossmint)
- Address validation
- Multiple shipping options

## Troubleshooting

### Common Issues

1. **"Invalid private key format" error:**
   - Ensure your private key is in the correct format (hex with 0x prefix or base58)
   - Check that the private key corresponds to a Solana wallet

2. **"Insufficient funds" error:**
   - Verify your wallet has enough balance for the purchase
   - Check that you're using the correct token type (USDC-SPL vs SOL)

3. **"API key invalid" error:**
   - Verify your Crossmint API key is correct
   - Ensure you're using the right environment (staging vs production)

4. **Network connection issues:**
   - Check your Solana RPC URL is accessible
   - Try switching to a different RPC provider

### Debug Mode

Enable debug logging by setting the log level:
```python
logging.basicConfig(level=logging.DEBUG)
```

## Security Considerations

- **Never commit your `.env` file** - it contains sensitive credentials
- **Use environment variables** for all sensitive data
- **Consider using a dedicated wallet** for testing
- **Verify transaction details** before confirming purchases

## Development

### Project Structure
```
solana-purchase-on-amazon/
├── main.py              # Main application
├── requirements.txt     # Python dependencies
├── README.md           # This file
└── .env.example        # Environment variables template
```

### Key Components
- **LangChain Agent**: Handles conversation and tool execution
- **Solana Wallet**: Manages Solana transactions and signing
- **Crossmint Plugin**: Handles Amazon purchase API integration
- **GOAT SDK**: Provides the framework for wallet and plugin integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the [GOAT SDK documentation](https://github.com/goat-sdk/goat)
- Visit the [Crossmint documentation](https://docs.crossmint.com)
- Open an issue in the repository 