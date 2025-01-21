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
from goat_wallets.evm import send_eth
from goat_wallets.web3 import Web3EVMWalletClient

# Initialize Web3 and account
w3 = Web3(Web3.HTTPProvider(os.getenv("RPC_PROVIDER_URL")))
private_key = os.getenv("WALLET_PRIVATE_KEY")
assert private_key is not None, "You must set WALLET_PRIVATE_KEY environment variable"
assert private_key.startswith("0x"), "Private key must start with 0x hex prefix"

account: LocalAccount = Account.from_key(private_key)
w3.eth.default_account = account.address  # Set the default account
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

You understand common token addresses:
- WETH: 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
- USDC: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
- USDT: 0xdAC17F958D2ee523a2206206994597C13D831ec7
- DAI: 0x6B175474E89094C44Da98b954EedeAC495271d0F

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
    assert uniswap_api_key is not None, "You must set UNISWAP_API_KEY environment variable"

    tools = get_on_chain_tools(
        wallet=Web3EVMWalletClient(w3),
        plugins=[
            send_eth(),
            uniswap(options=UniswapPluginOptions(api_key=uniswap_api_key)),
        ],
    )
    
    agent = create_tool_calling_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools, handle_parsing_errors=True, verbose=True)
    
    print("\nUniswap Plugin Test Interface")
    print("Example commands:")
    print("1. Check if I have enough USDC approval for Uniswap")
    print("2. Get a quote to swap 1 WETH for USDC")
    print("3. Swap 0.1 WETH for USDC")
    print("\nCommon token addresses:")
    print("- WETH: 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2")
    print("- USDC: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48")
    print("- USDT: 0xdAC17F958D2ee523a2206206994597C13D831ec7")
    print("- DAI: 0x6B175474E89094C44Da98b954EedeAC495271d0F")
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
