import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate
from web3 import Web3
from web3.middleware.signing import construct_sign_and_send_raw_middleware
from eth_account.signers.local import LocalAccount
from eth_account import Account

from goat_adapters.langchain import get_on_chain_tools
from goat_plugins.uniswap import uniswap, UniswapPluginOptions
from goat_wallets.web3 import web3

# Initialize Web3 and account
# Connect to Base (Coinbase L2)
BASE_RPC_URL = os.getenv("BASE_RPC_URL", "https://mainnet.base.org")
w3 = Web3(Web3.HTTPProvider(BASE_RPC_URL))
private_key = os.getenv("WALLET_PRIVATE_KEY")
assert private_key is not None, "You must set WALLET_PRIVATE_KEY environment variable"
assert private_key.startswith("0x"), "Private key must start with 0x hex prefix"

# Verify we're on Base
chain_id = w3.eth.chain_id
if chain_id != 8453:  # Base chain ID
    raise ValueError(f"Must be connected to Base (chain_id: 8453), got chain_id: {chain_id}")

account: LocalAccount = Account.from_key(private_key)
w3.eth.default_account = account.address  # Set the default account
w3.eth.default_local_account = account
w3.middleware_onion.add(
    construct_sign_and_send_raw_middleware(account)
)  # Add middleware

# Initialize LLM
llm = ChatOpenAI(model="gpt-4o-mini")

def main():
    """Main function to demonstrate Uniswap plugin functionality."""
    # Get the prompt template
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", """You are the Uniswap plugin tester. You can help users test Uniswap functionality including:
1. Check token approvals using uniswap_check_approval
   Example: "Check if I have enough USDC approval for Uniswap"
2. Get swap quotes using uniswap_get_quote
   Example: "Get a quote to swap 1 WETH for USDC"
3. Execute token swaps using uniswap_swap_tokens
   Example: "Swap 0.1 WETH for USDC"

For testing purposes, use small amounts.

When users ask for token swaps:
1. First check approval using uniswap_check_approval
2. Then get a quote using uniswap_get_quote
3. Finally execute the swap using uniswap_swap_tokens

Always use base units (wei) for amounts. For example:
- 1 WETH = 1000000000000000000 (18 decimals)
- 1 USDC = 1000000 (6 decimals)"""),
            ("placeholder", "{chat_history}"),
            ("human", "{input}"),
            ("placeholder", "{agent_scratchpad}"),
        ]
    )

    # Initialize tools with web3 wallet and Uniswap plugin
    uniswap_api_key = os.getenv("UNISWAP_API_KEY")
    uniswap_base_url = os.getenv("UNISWAP_BASE_URL", "https://trade-api.gateway.uniswap.org/v1")
    assert uniswap_api_key is not None, "You must set UNISWAP_API_KEY environment variable"
    assert uniswap_base_url is not None, "You must set UNISWAP_BASE_URL environment variable"

    tools = get_on_chain_tools(
        wallet=web3(w3),
        plugins=[
            uniswap(options=UniswapPluginOptions(
                api_key=uniswap_api_key,
                base_url=uniswap_base_url
            )),
        ],
    )
    
    agent = create_tool_calling_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools, handle_parsing_errors=True, verbose=True)
    
    print("\nUniswap Plugin Test Interface")
    print("Example commands:")
    print("1. Check if I have enough USDC approval for Uniswap")
    print("2. Get a quote to swap 1 WETH for USDC")
    print("3. Swap 0.1 WETH for USDC")
    print("\nMainnet token addresses:")
    print("- WETH: 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2")
    print("- USDC: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48")
    print("\nTest amounts:")
    print("- 0.01 WETH = 10000000000000000 wei")
    print("- 10 USDC = 10000000 units")
    print("\nType 'quit' to exit\n")
    
    while True:
        user_input = input("\nYou: ").strip()
        
        if user_input.lower() == 'quit':
            print("Goodbye!")
            break
            
        try:
            response = agent_executor.invoke({
                "input": user_input,
            })

            print("\nAssistant:", response["output"])
        except Exception as e:
            print("\nError:", str(e))


if __name__ == "__main__":
    main()
