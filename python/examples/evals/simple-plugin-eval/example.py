import os
import asyncio
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from web3 import Web3

from goat import run_evals
from goat_wallets.web3 import Web3WalletClient
from goat_plugins.erc20 import Erc20Plugin

# Load environment variables
load_dotenv()

# Setup Web3 wallet
w3 = Web3(Web3.HTTPProvider(os.environ.get("RPC_PROVIDER_URL")))
wallet = Web3WalletClient(
    w3=w3,
    private_key=os.environ.get("WALLET_PRIVATE_KEY")
)

# Setup LLM
llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.3
)

# Dataset for testing ERC20 token information
ERC20_INFO_DATASET = [
    {
        "inputs": {
            "query": "What is the symbol for USDC?",
        },
        "referenceOutputs": {
            "tool": "erc20_token_information",
            "response": '{"tokenAddress":"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"}',
        },
    },
    {
        "inputs": {
            "query": "Tell me about the USDC token contract",
        },
        "referenceOutputs": {
            "tool": "erc20_token_information",
            "response": '{"tokenAddress":"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"}',
        },
    },
]

async def run_example():
    try:
        # Create plugin
        erc20_plugin = Erc20Plugin(tokens=[
            {"address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", "symbol": "USDC", "name": "USD Coin"}
        ])
        
        # Run evaluations
        result = await run_evals(
            dataset=ERC20_INFO_DATASET,
            wallet=wallet,
            plugins=[erc20_plugin],
            llm=llm,
            test_name="ERC20 Token Information Tests"
        )

        print("\nEvaluation Summary:")
        print(f"Success: {result.success}")
        print(f"Total: {len(result.results)}")
        print(f"Passed: {sum(1 for r in result.results if r.passed)}")
        print(f"Failed: {sum(1 for r in result.results if not r.passed)}")
    except Exception as e:
        print(f"Error running evaluations: {e}")

if __name__ == "__main__":
    asyncio.run(run_example())
