import asyncio
import os
import logging
from langchain_openai import OpenAI
from langchain import hub as prompts
from langchain.agents import AgentExecutor, create_structured_chat_agent
from web3 import Web3

from goat_sdk.adapters.langchain import getOnChainTools
from goat_sdk.wallets.web3 import Web3EVMWalletClient

logging.basicConfig(
    format="%(asctime)s %(levelname)s: %(message)s", level=logging.DEBUG
)


async def main():
    logger = logging.getLogger(__name__)
    chain = "sepolia"
    prompt = prompts.pull("hwchase17/structured-chat-agent")
    llm = OpenAI(model="gpt-4o-mini")

    w3 = Web3(
        Web3.HTTPProvider(
            # TODO: Export RPC_PROVIDER_URL
            "https://eth-%s.g.alchemy.com/v2/%s"
            % (chain, os.environ["ALCHEMY_API_KEY"])
        )
    )

    walletClient = Web3EVMWalletClient(w3)

    tools = await getOnChainTools(wallet=walletClient, plugins=[])
    logger.debug("Tools: %s", tools)
    agent = create_structured_chat_agent(llm, tools, prompt)
    logger.debug("Agent: %s", agent)

    logger.debug("Create an agent executor by passing in the agent and tools")
    agent_executor = AgentExecutor(
        agent=agent,
        tools=tools,
        verbose=True,
        handle_parsing_errors=True,
    )

    response = agent_executor.invoke({"input": "Get my balance in USDC"})
    logger.info("Agent response: %s", response)


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
