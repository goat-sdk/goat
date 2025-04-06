import os
from dotenv import load_dotenv
import traceback

# CrewAI imports
from crewai import Agent, Task, Crew, Process, LLM

# GOAT imports
from goat_adapters.crewai.adapter import get_crewai_tools
from goat_plugins.uniswap import uniswap, UniswapPluginOptions
from solders.keypair import Keypair
from solana.rpc.api import Client as SolanaClient
from goat_wallets.solana import solana
from goat_wallets.web3 import Web3EVMWalletClient
from web3 import Web3
from eth_account import Account
from web3.middleware import SignAndSendRawMiddlewareBuilder

# Load environment variables
load_dotenv()

# Initialize LLM
llm = LLM(
    model="gemini/gemini-2.0-flash",
    temperature=0.7,
    api_key=os.getenv("GEMINI_API_KEY")
)

# --- Setup GOAT Wallet and Plugins ---
print("Initializing wallet and GOAT plugins...")
ethereum_rpc = os.getenv("ETHEREUM_RPC")
ethereum_private_key = os.getenv("ETHEREUM_PRIVATE_KEY")
gemini_api_key = os.getenv("GEMINI_API_KEY")
uniswap_api_key = os.getenv("UNISWAP_API_KEY", "")  # Optional, defaults to empty string

if not ethereum_rpc or not ethereum_private_key:
    print("Error: Please set ETHEREUM_RPC and ETHEREUM_PRIVATE_KEY in your .env file.")
    exit(1)

if not gemini_api_key:
    print("Error: Please set GEMINI_API_KEY in your .env file for the LLM.")
    exit(1)

try:
    # Setup Ethereum wallet using Web3EVMWalletClient
    web3 = Web3(Web3.HTTPProvider(ethereum_rpc))
    if ethereum_private_key.startswith("0x"):
        ethereum_account = Account.from_key(ethereum_private_key)
    else:
        ethereum_account = Account.from_key(f"0x{ethereum_private_key}")
    
    # Add middleware for signing transactions
    web3.eth.default_account = ethereum_account.address
    web3.middleware_onion.add(SignAndSendRawMiddlewareBuilder.build(ethereum_account))
    
    # Create wallet client properly
    ethereum_wallet = Web3EVMWalletClient(web3)
    
    # Initialize Uniswap plugin with correct parameters
    print("Initializing Uniswap plugin...")
    uniswap_plugin = uniswap(
        UniswapPluginOptions(
            api_key=uniswap_api_key,
            base_url="https://api.uniswap.org/v1"  # Using base_url as per actual implementation
        )
    )
    print("Uniswap plugin initialized successfully")

    # Get CrewAI-compatible tools using ONLY the Ethereum wallet
    print("Getting CrewAI compatible tools...")
    goat_crewai_tools = get_crewai_tools(wallet=ethereum_wallet, plugins=[uniswap_plugin])
    if not goat_crewai_tools:
        print("Warning: No GOAT tools were loaded. Check adapter/plugin setup or tool compatibility.")
        exit(1)
    else:
        print(f"Successfully loaded {len(goat_crewai_tools)} GOAT tools for CrewAI.")
        # List available tools for debugging
        print("Available tools:")
        for tool in goat_crewai_tools:
            print(f"- {tool.name}: {tool.description}")

except Exception as e:
    print(f"Error during initialization: {e}")
    traceback.print_exc()
    exit(1)

# --- Define CrewAI Agent ---
print("Defining CrewAI Agent...")
swap_agent = Agent(
    role="DeFi Swap Assistant",
    goal="Help users swap tokens on Uniswap and provide token information.",
    backstory=(
        "You are an expert DeFi assistant specialized in Uniswap operations. "
        "You have access to tools that can check token prices and get swap quotes on Uniswap. "
        "Your task is to understand the user's request, use the appropriate tool(s) to fulfill it, "
        "and provide clear, concise information about the operations performed."
    ),
    verbose=True,
    allow_delegation=False,
    tools=goat_crewai_tools,
    llm=llm
)

# --- Define CrewAI Task ---
print("Defining CrewAI Task...")
swap_task = Task(
    description=(
        'Answer the user\'s question: "{user_question}". '
        "Use your available Uniswap tools to provide token information and quotes. "
        "For price checks and quotes, provide detailed information. "
        "Synthesize the results from the tools into a final, comprehensive answer."
    ),
    expected_output=(
        "A clear, accurate response based on the information retrieved by the tools. "
        "Include token prices, swap details, and gas estimates as applicable. "
        "If the tools cannot complete the requested operation, explain why and provide alternatives."
    ),
    agent=swap_agent,
)

# --- Create Crew ---
print("Creating Crew...")
defi_crew = Crew(
    agents=[swap_agent], 
    tasks=[swap_task], 
    process=Process.sequential, 
    verbose=True, 
    llm=llm
)

# Common token addresses for convenience
TOKEN_ADDRESSES = {
    "ETH": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",  # WETH
    "WETH": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "DAI": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    "USDC": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "USDT": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    "UNI": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
}


# --- Interactive Loop ---
def run_interactive_loop():
    print("\n--- DeFi Swap Assistant ---")
    print("Ask questions about tokens or request swaps on Uniswap. Type 'quit' to exit.")
    print("Example questions:")
    print("- What is the current price of ETH in DAI?")
    print("- Get a quote for swapping 0.1 ETH to USDC")
    
    print("\nAvailable tokens with addresses:")
    for symbol, address in TOKEN_ADDRESSES.items():
        print(f"- {symbol}: {address}")
    
    while True:
        try:
            user_query = input("\nYour question: ")
            if user_query.lower() == "quit":
                print("Exiting...")
                break
            if not user_query.strip():
                continue

            print("\nProcessing your request with the crew...")
            # Kick off the crew with the user's question
            result = defi_crew.kickoff(inputs={"user_question": user_query})

            print("\n✅ --- Crew Finished ---")
            print("Final Answer:")
            print(result)
            print("--------------------\n")

        except Exception as e:
            print(f"\n❌ An error occurred during the crew execution: {e}")
            traceback.print_exc()
        except KeyboardInterrupt:
            print("\nExiting...")
            break


if __name__ == "__main__":
    run_interactive_loop() 