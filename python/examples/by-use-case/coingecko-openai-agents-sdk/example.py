import os
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Match import style of example.py
from agents.agent import Agent
from agents.run import Runner

from web3 import Web3
from web3.middleware import SignAndSendRawMiddlewareBuilder
from eth_account import Account
from goat_wallets.web3 import Web3EVMWalletClient

# GOAT SDK imports
from goat_adapters.openai_agents_sdk.adapter import get_on_chain_tools
from goat_plugins.coingecko import coingecko, CoinGeckoPluginOptions


# Check for OpenAI API key
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    # Temporarily use Gemini key for testing/demo, but warn user
    print("⚠️ WARNING: OPENAI_API_KEY not found in environment variables")
    print("This example requires an OpenAI API key to work properly.")
    print("Please add OPENAI_API_KEY to your .env file.")
    exit(1)

# Optional CoinGecko API key - free tier has limited requests
coingecko_api_key = os.getenv("COINGECKO_API_KEY", "")  # Optional, can be empty for free tier

# Set OpenAI API key for SDK
os.environ["OPENAI_API_KEY"] = openai_api_key


async def main():
    # Setup a basic wallet for the SDK requirements
    # We need to provide a wallet even though CoinGecko doesn't use it
    ethereum_rpc = os.getenv("RPC_PROVIDER_URL")
    ethereum_private_key = os.getenv("WALLET_PRIVATE_KEY")
    
    if not ethereum_rpc or not ethereum_private_key:
        print("Warning: RPC_PROVIDER_URL or WALLET_PRIVATE_KEY not set")
        print("This won't affect CoinGecko functionality, but is required by the SDK")
        ethereum_rpc = "https://eth.llamarpc.com"  # Default fallback
        ethereum_private_key = "0x0000000000000000000000000000000000000000000000000000000000000001"  # Dummy key

    # Create a dummy wallet just to satisfy the SDK requirements
    web3 = Web3(Web3.HTTPProvider(ethereum_rpc))
    if ethereum_private_key.startswith("0x"):
        ethereum_account = Account.from_key(ethereum_private_key)
    else:
        ethereum_account = Account.from_key(f"0x{ethereum_private_key}")
    
    web3.eth.default_account = ethereum_account.address
    web3.middleware_onion.add(SignAndSendRawMiddlewareBuilder.build(ethereum_account))
    ethereum_wallet = Web3EVMWalletClient(web3)

    # Initialize CoinGecko plugin
    print("Initializing CoinGecko plugin...")
    coingecko_plugin = coingecko(
        CoinGeckoPluginOptions(
            api_key=coingecko_api_key  # Can be empty for free tier
        )
    )
    
    # Get tools that work with OpenAI Agents SDK - pass the wallet
    tools = get_on_chain_tools(
        wallet=ethereum_wallet,  # Pass the wallet even though CoinGecko doesn't use it
        plugins=[coingecko_plugin]
    )
    
    print(f"Successfully loaded {len(tools)} CoinGecko tools")
    for tool in tools:
        print(f"- {tool.name}: {tool.description}")
    
    # Create the agent with OpenAI
    agent = Agent(
        name="Crypto Market Analyst",
        instructions=(
            "You are a helpful cryptocurrency market analyst that can provide real-time "
            "and historical market data using CoinGecko. You can look up token prices, "
            "market data, historical trends, and other cryptocurrency analytics. "
            "Always try to provide comprehensive and accurate information based on "
            "the data available from CoinGecko."
        ),
        tools=tools
    )
    
    print("\n--- Crypto Market Analyst powered by CoinGecko ---")
    print("Ask questions about cryptocurrency markets. Type 'quit' to exit.")
    print("Example questions:")
    print("- What's the current price of Bitcoin?")
    print("- Show me market data for Ethereum")
    print("- What's the price history of Solana for the last 30 days?")
    print("- Compare the prices of Bitcoin and Ethereum")
    
    while True:
        user_input = input("\nYou: ").strip()
        
        if user_input.lower() in ['quit', 'exit']:
            print("Goodbye!")
            break
            
        if not user_input:
            continue
            
        try:
            print("\nAnalyzing cryptocurrency data...")
            response = await Runner.run(agent, user_input)
            print("\nAnalyst:", response.final_output)
        except Exception as e:
            print("\nError:", str(e))
            import traceback
            traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main()) 