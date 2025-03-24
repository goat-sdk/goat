import os
import asyncio
from dotenv import load_dotenv
from goat_wallets.crossmint.smart_wallet import smart_wallet_factory

# Load environment variables
load_dotenv()

from goat_wallets.crossmint.custodial_solana_wallet import custodial_factory
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate
from solana.rpc.api import Client as SolanaClient

from goat_adapters.langchain import get_on_chain_tools
from goat_plugins.jupiter import jupiter, JupiterPluginOptions
from goat_plugins.spl_token import spl_token, SplTokenPluginOptions
from goat_plugins.spl_token.tokens import SPL_TOKENS
from goat_wallets.crossmint import crossmint

# Initialize Solana client
client = SolanaClient(os.getenv("SOLANA_RPC_ENDPOINT"))

crossmint = crossmint(os.getenv("CROSSMINT_API_KEY"))

crossmint_wallet = crossmint["custodial"]({
    "chain": "solana",
    "connection": client,
    "email": os.getenv("CROSSMINT_USER_EMAIL")
})

# Initialize LLM
llm = ChatOpenAI(model="gpt-4o-mini")

async def main():
    
    # Get the prompt template
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", "You are a helpful assistant"),
            ("placeholder", "{chat_history}"),
            ("human", "{input}"),
            ("placeholder", "{agent_scratchpad}"),
        ]
    )

    # Initialize tools with Solana wallet
    tools = get_on_chain_tools(
        wallet=crossmint_wallet,
        plugins=[
            jupiter(JupiterPluginOptions()),  # No options needed for Jupiter v6
            spl_token(SplTokenPluginOptions(
                network="mainnet",  # Using devnet as specified in .env
                tokens=SPL_TOKENS
            )),
        ],
    )
    
    agent = create_tool_calling_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(
        agent=agent, tools=tools, handle_parsing_errors=True, verbose=True
    )

    while True:
        user_input = input("\nYou: ").strip()

        if user_input.lower() == "quit":
            print("Goodbye!")
            break

        try:
            response = agent_executor.invoke(
                {
                    "input": user_input,
                }
            )

            print("\nAssistant:", response["output"])
        except Exception as e:
            print("\nError:", str(e))


if __name__ == "__main__":
    asyncio.run(main())
