import os
from dotenv import load_dotenv

# CrewAI imports
from crewai import Agent, Task, Crew, Process, LLM

# GOAT imports
from goat_adapters.crewai.adapter import get_crewai_tools
from goat_plugins.rugcheck import rugcheck, RugCheckPluginOptions
from solders.keypair import Keypair
from solana.rpc.api import Client as SolanaClient
from goat_wallets.solana import solana


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
etherscan_api_key = os.getenv("ETHERSCAN_API_KEY")
solana_rpc_endpoint = os.getenv("SOLANA_RPC_ENDPOINT")
solana_wallet_seed = os.getenv("SOLANA_WALLET_SEED")
gemini_api_key = os.getenv("GEMINI_API_KEY")

if not solana_rpc_endpoint or not solana_wallet_seed:
    print("Error: Please set SOLANA_RPC_ENDPOINT and SOLANA_WALLET_SEED in your .env file.")
    exit(1)

if not etherscan_api_key or etherscan_api_key == "YourEtherscanApiKey":
    print("Warning: ETHERSCAN_API_KEY not set or using default value. Some functionality may be limited.")

if not gemini_api_key:
    print("Error: Please set GEMINI_API_KEY in your .env file for the LLM.")
    exit(1)

try:
    # Setup Solana wallet
    client = SolanaClient(solana_rpc_endpoint)
    keypair = Keypair.from_base58_string(solana_wallet_seed)
    wallet = solana(client, keypair)

    # Initialize rugcheck plugin with correct base URL
    rugcheck_plugin = rugcheck(
        RugCheckPluginOptions(
            jwt_token=etherscan_api_key,
            base_url="https://api.rugcheck.xyz/v1"  # Fixed URL with /v1 endpoint
        )
    )

    # Get CrewAI-compatible tools from GOAT adapter
    goat_crewai_tools = get_crewai_tools(wallet=wallet, plugins=[rugcheck_plugin])
    if not goat_crewai_tools:
        print("Warning: No GOAT tools were loaded. Check adapter/plugin setup or tool compatibility.")
        exit(1)
    else:
        print(f"Successfully loaded {len(goat_crewai_tools)} GOAT tools for CrewAI.")

except Exception as e:
    print(f"Error during initialization: {e}")
    exit(1)

# --- Define CrewAI Agent ---
print("Defining CrewAI Agent...")
crypto_analyst = Agent(
    role="Crypto Security Analyst",
    goal="Provide accurate security analysis of crypto tokens using RugCheck tools.",
    backstory=(
        "You are an expert security analyst focused on identifying potential risks in cryptocurrency tokens. "
        "You have access to specialized tools from RugCheck that can analyze token security and market trends. "
        "Your task is to understand the user's question, use the appropriate tool(s) to get token information, "
        "and provide a clear, concise assessment based only on the information retrieved from the tools. "
        "If the tools cannot provide the information needed to answer the question, clearly state that."
    ),
    verbose=True,
    allow_delegation=False,
    tools=goat_crewai_tools,
    llm=llm
)

# --- Define CrewAI Task ---
print("Defining CrewAI Task...")
analysis_task = Task(
    description=(
        'Answer the user\'s question: "{user_question}". '
        "Use your available RugCheck tools to analyze token information and security. "
        "Your tools can: get recently detected tokens, trending tokens, most voted tokens, "
        "recently verified tokens, and generate token report summaries. "
        "Synthesize the results from the tools into a final, comprehensive answer."
    ),
    expected_output=(
        "A clear, accurate token analysis based only on the information retrieved by the tools. "
        "Include token details, trends, and security information if available. "
        "If the tools cannot answer the question, state that clearly."
    ),
    agent=crypto_analyst,
)

# --- Create Crew ---
print("Creating Crew...")
crypto_crew = Crew(
    agents=[crypto_analyst], 
    tasks=[analysis_task], 
    process=Process.sequential, 
    verbose=True, 
    llm=llm
)


# --- Interactive Loop ---
def run_interactive_loop():
    print("\n--- Crypto Security Analyst with RugCheck ---")
    print("Ask questions about token security and trends. Type 'quit' to exit.")
    print("Example questions:")
    print("- What are the recently detected tokens?")
    print("- What are the trending tokens in the last 24 hours?")
    print("- Generate a report for WIF token (CnLTN3CmJnpRe2dyKXKbJZiNxri6JQHYuvc2EkecJQP5)")
    print("- What tokens have the most votes recently?")
    
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
            result = crypto_crew.kickoff(inputs={"user_question": user_query})

            print("\n✅ --- Crew Finished ---")
            print("Final Answer:")
            print(result)
            print("--------------------\n")

        except Exception as e:
            print(f"\n❌ An error occurred during the crew execution: {e}")
        except KeyboardInterrupt:
            print("\nExiting...")
            break


if __name__ == "__main__":
    run_interactive_loop() 