import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_structured_chat_agent
from langchain.hub import pull
from web3 import Web3
from web3.middleware.signing import construct_sign_and_send_raw_middleware
from eth_account.signers.local import LocalAccount
from eth_account import Account

from goat_adapters.langchain import get_on_chain_tools
from goat_plugins.erc20.token import PEPE, USDC
from goat_plugins.erc20 import erc20, ERC20PluginOptions
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
    # Get the prompt template
    prompt = pull("hwchase17/structured-chat-agent")

    # Initialize tools with web3 wallet
    tools = get_on_chain_tools(
        wallet=Web3EVMWalletClient(w3),
        plugins=[send_eth(), erc20(options=ERC20PluginOptions(tokens=[USDC, PEPE]))],
    )

    # Create the agent
    agent = create_structured_chat_agent(llm=llm, tools=tools, prompt=prompt)

    # Create the executor
    agent_executor = AgentExecutor(agent=agent, tools=tools, handle_parsing_errors=True)

    # Execute the agent
    response = agent_executor.invoke({"input": "Get my balance in USDC"})

    print(response)


if __name__ == "__main__":
    main()
