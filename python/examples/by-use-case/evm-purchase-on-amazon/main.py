#!/usr/bin/env python3
import os
import sys
from dotenv import load_dotenv

# Add the src directory to Python path so we can import local GOAT SDK modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../../src/goat-sdk'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../../src/wallets/web3'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../../src/adapters/langchain'))

# LangChain imports
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage, AIMessage

# Web3 imports
from web3 import Web3
from web3.middleware import SignAndSendRawMiddlewareBuilder
from eth_account.signers.local import LocalAccount
from eth_account import Account

# GOAT imports
from goat_adapters.langchain import get_on_chain_tools
from goat_wallets.web3 import web3

# Import our local CrossmintHeadlessCheckoutPlugin
from crossmint_plugin import CrossmintHeadlessCheckoutPlugin, CrossmintHeadlessCheckoutPluginOptions

# Load environment variables from .env file
load_dotenv()

# Define system prompt for our agent
SYSTEM_PROMPT = """No need to check the token balance of the user first.

When buying a product:

Always ask for ALL required information in the first response:
1) Name
2) Shipping address
3) Recipient email address
4) Payment method (USDC, SOL, or ETH)
5) Preferred chain (EVM or Solana)
            
Only proceed with the purchase when all information is provided.
1) Use productLocator format 'amazon:B08SVZ775L'
2) Extract product locator from URLs
3) Require and parse valid shipping address (in format 'Name, Street, City, State ZIP, Country') and email
4) The recipient WILL be the email provided by the user
5) You can get the payer address using the get_wallet_address tool
            
Once the order is executed via the buy_token, consider the purchase complete, and the payment sent. You can ask the user if they want to purchase something else

Don't ask to confirm payment to finalize orders."""

def main():
    # 1. Create an EVM wallet client for Base Sepolia
    # Initialize Web3 provider
    provider_url = os.environ.get("RPC_PROVIDER_URL")
    w3 = Web3(Web3.HTTPProvider(provider_url))
    
    # Setup account from private key
    private_key = os.environ.get("WALLET_PRIVATE_KEY")
    if not private_key.startswith("0x"):
        private_key = "0x" + private_key
    assert private_key is not None, "You must set WALLET_PRIVATE_KEY environment variable"

    account: LocalAccount = Account.from_key(private_key)
    w3.eth.default_account = account.address  # Set the default account
    w3.middleware_onion.add(
        SignAndSendRawMiddlewareBuilder.build(account)
    )  # Add middleware
    
    # Create wallet using the GOAT SDK web3 factory function
    wallet_client = web3(w3)
    
    # Create plugin options and plugin instance
    plugin_options = CrossmintHeadlessCheckoutPluginOptions(api_key=os.environ.get("CROSSMINT_API_KEY"))
    plugin = CrossmintHeadlessCheckoutPlugin(plugin_options)
    print("Using CrossmintHeadlessCheckoutPlugin")
              
    # 2. Get your onchain tools for your wallet
    tools = get_on_chain_tools(
        wallet=wallet_client,
        plugins=[plugin]
    )
    
    # 3. Initialize LLM
    llm = ChatOpenAI(model="gpt-4o-mini")
    
    # Get the prompt template
    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        ("placeholder", "{chat_history}"),
        ("human", "{input}"),
        ("placeholder", "{agent_scratchpad}"),
    ])

    agent = create_tool_calling_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(
        agent=agent, tools=tools, handle_parsing_errors=True, verbose=True
    )
    
    # Initialize conversation history
    chat_history = []
    
    # 4. Run the interactive chat loop
    print("Welcome to the Amazon Purchase Agent!")
    print("You can ask to purchase an Amazon item using crypto.")
    print('Enter "exit" to quit the program.')
    
    while True:
        user_input = input('\nEnter your prompt (or "exit" to quit): ')
        
        if user_input.lower() == 'exit':
            print("Goodbye!")
            break
        
        try:
            # Invoke agent with chat history
            response = agent_executor.invoke({
                "input": user_input,
                "chat_history": chat_history,
            })

            assistant_response = response["output"]
            print("\nAssistant:", assistant_response)
            
            # Add the conversation to history
            chat_history.extend([
                HumanMessage(content=user_input),
                AIMessage(content=assistant_response)
            ])
            
            # Keep history manageable (last 20 messages = 10 exchanges)
            if len(chat_history) > 20:
                chat_history = chat_history[-20:]
                
        except Exception as e:
            print("\nError:", str(e))
            # Still add user message to history even if there was an error
            chat_history.append(HumanMessage(content=user_input))

if __name__ == "__main__":
    main() 