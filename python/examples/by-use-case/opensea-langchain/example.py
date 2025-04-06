import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# LangChain imports
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_google_genai import ChatGoogleGenerativeAI

# Web3 imports
from web3 import Web3
from web3.middleware import SignAndSendRawMiddlewareBuilder
from eth_account import Account

# GOAT SDK imports
from goat_adapters.langchain import get_on_chain_tools
from goat_plugins.opensea import opensea, OpenSeaPluginOptions
from goat_wallets.web3 import Web3EVMWalletClient

# Initialize Web3 and account
w3 = Web3(Web3.HTTPProvider(os.getenv("RPC_PROVIDER_URL")))
private_key = os.getenv("WALLET_PRIVATE_KEY")
assert private_key is not None, "You must set WALLET_PRIVATE_KEY environment variable"
assert private_key.startswith("0x"), "Private key must start with 0x hex prefix"

account = Account.from_key(private_key)
w3.eth.default_account = account.address  # Set the default account
w3.middleware_onion.add(
    SignAndSendRawMiddlewareBuilder.build(account)
)  # Add middleware

# Initialize Gemini LLM
gemini_api_key = os.getenv("GEMINI_API_KEY")
assert gemini_api_key is not None, "You must set GEMINI_API_KEY environment variable"

llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-pro",
    temperature=0.7,
    google_api_key=gemini_api_key,
    convert_system_message_to_human=True
)

# Initialize OpenSea API key
opensea_api_key = os.getenv("OPENSEA_API_KEY", "")  # Optional, but recommended for higher rate limits

def main():
    # Create the prompt template
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", "You are an NFT expert assistant who can provide information about NFT collections, "
                      "sales, and market data from OpenSea. Provide detailed, accurate information when "
                      "asked about NFTs. Always include relevant details like floor prices, volume, and "
                      "recent sales when applicable."),
            ("placeholder", "{chat_history}"),
            ("human", "{input}"),
            ("placeholder", "{agent_scratchpad}"),
        ]
    )

    # Initialize the OpenSea plugin
    print("Initializing OpenSea plugin...")
    opensea_plugin = opensea(
        OpenSeaPluginOptions(
            api_key=opensea_api_key
        )
    )
    
    # Get LangChain-compatible tools from GOAT adapter
    tools = get_on_chain_tools(
        wallet=Web3EVMWalletClient(w3),
        plugins=[opensea_plugin],
    )
    
    print(f"Successfully loaded {len(tools)} OpenSea tools")
    for tool in tools:
        print(f"- {tool.name}: {tool.description}")
    
    # Create the agent
    agent = create_tool_calling_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(
        agent=agent, 
        tools=tools, 
        handle_parsing_errors=True, 
        verbose=True
    )
    
    # Example collections to suggest to users
    popular_collections = [
        "doodles-official",
        "boredapeyachtclub",
        "azuki",
        "cryptopunks",
        "pudgypenguins"
    ]
    
    print("\n--- NFT Explorer powered by OpenSea ---")
    print("Ask questions about NFT collections, sales, and market data. Type 'quit' to exit.")
    print("Example questions:")
    print("- What are the stats for the Bored Ape Yacht Club collection?")
    print("- Show me recent sales from the Doodles collection")
    print("- What is the floor price of Azuki?")
    print("- Get metadata for Cryptopunk #1234")
    
    print("\nPopular collections you can ask about:")
    for collection in popular_collections:
        print(f"- {collection}")
    
    while True:
        user_input = input("\nYou: ").strip()
        
        if user_input.lower() == 'quit':
            print("Goodbye!")
            break
            
        if not user_input:
            continue
            
        try:
            print("\nFetching NFT data...")
            response = agent_executor.invoke({
                "input": user_input,
                "chat_history": []
            })

            print("\nAssistant:", response["output"])
        except Exception as e:
            print("\nError:", str(e))
            import traceback
            traceback.print_exc()


if __name__ == "__main__":
    main() 