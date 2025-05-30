#!/usr/bin/env python3
import os
import asyncio
import logging
import json
from dotenv import load_dotenv

# OpenAI imports
from openai import OpenAI

# For terminal interaction
import readline

# GOAT imports
from goat import get_tools
from goat_wallets.solana import solana
from goat_plugins.crossmint_headless_checkout import crossmint_headless_checkout, CrossmintHeadlessCheckoutPluginOptions

# Solana imports
from solana.rpc.api import Client
from solders.keypair import Keypair
import base58

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# System prompt
SYSTEM_PROMPT = """You are a helpful assistant that can purchase Amazon items using Solana cryptocurrency.

When a user asks to buy something from Amazon:

1. First, collect ALL required information:
   - Product URL or ID (extract productLocator as 'amazon:PRODUCT_ID')
   - Full shipping address (format: 'Name, Street, City, State ZIP, Country')
   - Recipient email address
   - Payment method preference (USDC-SPL, SOL, etc.)

2. Only proceed with purchase when all information is provided
3. Use the buy_token tool to execute the purchase
4. For Solana devnet usage, use payment method "solana-devnet"
5. The payer address will be automatically determined from the wallet
6. After successful purchase, inform the user that payment has been sent

Always be helpful and guide users through the process step by step.
After successfully creating an order with buy_token, you can use get_order with the order_id to retrieve and show the order details, including order status and transaction information.

Remember: Only provide fields that have actual values in the API request. Don't include null, undefined, or empty values."""

async def main():
    """Main function to run the Solana Amazon purchase agent."""
    
    # 1. Create Solana wallet client (fixed to match working examples)
    rpc_url = os.environ.get("RPC_PROVIDER_URL", "https://api.devnet.solana.com")
    client = Client(rpc_url)
    
    # Create wallet from private key
    private_key = os.environ.get("WALLET_PRIVATE_KEY")
    if not private_key:
        raise ValueError("WALLET_PRIVATE_KEY environment variable is required")
    
    # Handle different private key formats and create keypair
    try:
        if private_key.startswith("0x"):
            # Hex format - convert to bytes first, then to base58
            private_key_bytes = bytes.fromhex(private_key[2:])
            # Convert to base58 for Keypair
            import base58
            private_key_base58 = base58.b58encode(private_key_bytes).decode()
            keypair = Keypair.from_base58_string(private_key_base58)
        else:
            # Try as base58 first, then as hex if that fails
            try:
                keypair = Keypair.from_base58_string(private_key)
            except:
                # Try as hex without 0x prefix
                private_key_bytes = bytes.fromhex(private_key)
                private_key_base58 = base58.b58encode(private_key_bytes).decode()
                keypair = Keypair.from_base58_string(private_key_base58)
    except Exception as e:
        raise ValueError(f"Invalid private key format: {e}")
    
    # Create wallet using correct pattern from working examples
    wallet_client = solana(client, keypair)
    
    # 2. Get on-chain tools with Crossmint plugin
    api_key = os.environ.get("CROSSMINT_API_KEY")
    if not api_key:
        raise ValueError("CROSSMINT_API_KEY environment variable is required")
    
    tools = get_tools(
        wallet=wallet_client,
        plugins=[
            crossmint_headless_checkout(CrossmintHeadlessCheckoutPluginOptions(api_key=api_key))
        ]
    )
    
    # Convert tools to OpenAI Assistant format
    # Ensure all parameters are properly serializable
    assistant_tools = []
    for tool in tools:
        # Convert parameters to dict if it's a pydantic model or other complex type
        if hasattr(tool, 'parameters') and hasattr(tool.parameters, 'model_json_schema'):
            parameters = tool.parameters.model_json_schema()
        else:
            parameters = tool.parameters
            
        assistant_tools.append({
            "type": "function",
            "function": {
                "name": tool.name,
                "description": tool.description,
                "parameters": parameters
            }
        })
    
    # 3. Create OpenAI client
    openai_api_key = os.environ.get("OPENAI_API_KEY")
    if not openai_api_key:
        raise ValueError("OPENAI_API_KEY environment variable is required")
    
    client = OpenAI(api_key=openai_api_key)
    
    # Create an assistant
    assistant = client.beta.assistants.create(
        name="Solana Amazon Purchase Assistant",
        instructions=SYSTEM_PROMPT,
        model="gpt-4o",
        tools=assistant_tools
    )
    
    # Create a thread for conversation
    thread = client.beta.threads.create()
    
    # Store conversation history
    messages = []
    
    # 4. Interactive loop with conversation memory
    print("🛒 Welcome to the Solana Amazon Purchase Agent!")
    print("You can ask me to purchase Amazon items using Solana crypto.")
    print('Type "exit" to quit.\n')
    
    while True:
        try:
            # Get user input
            user_input = input("💬 You: ").strip()
            
            if user_input.lower() in ['exit', 'quit', 'bye']:
                print("👋 Goodbye!")
                break
            
            if not user_input:
                continue
            
            # Add the user message to the thread
            client.beta.threads.messages.create(
                thread_id=thread.id,
                role="user",
                content=user_input
            )
            
            print("\n🤖 Assistant:")
            print("\n-------------------")
            print("TOOLS CALLED")
            print("-------------------\n")
            
            # Run the assistant
            run = client.beta.threads.runs.create(
                thread_id=thread.id,
                assistant_id=assistant.id
            )
            
            # Wait for the run to complete
            while True:
                run_status = client.beta.threads.runs.retrieve(
                    thread_id=thread.id,
                    run_id=run.id
                )
                
                if run_status.status == "completed":
                    break
                
                if run_status.status == "requires_action":
                    tool_calls = run_status.required_action.submit_tool_outputs.tool_calls
                    tool_outputs = []
                    
                    for tool_call in tool_calls:
                        # Print tool call information
                        print(f"Tool: {tool_call.function.name}")
                        print(f"Arguments: {tool_call.function.arguments}")
                        
                        # Find the matching tool
                        for tool in tools:
                            if tool.name == tool_call.function.name:
                                try:
                                    # Parse JSON arguments if they're a string
                                    if isinstance(tool_call.function.arguments, str):
                                        arguments = json.loads(tool_call.function.arguments)
                                    else:
                                        arguments = tool_call.function.arguments
                                    
                                    # Execute the tool using the correct GOAT pattern
                                    result = tool.execute(arguments)
                                    
                                    # Handle async results if needed
                                    if hasattr(result, '__await__'):
                                        result = await result
                                    
                                    print(f"Result: {result}")
                                    
                                    tool_outputs.append({
                                        "tool_call_id": tool_call.id,
                                        "output": str(result)
                                    })
                                except Exception as e:
                                    print(f"Error executing tool: {e}")
                                    tool_outputs.append({
                                        "tool_call_id": tool_call.id,
                                        "output": f"Error: {str(e)}"
                                    })
                    
                    # Submit the tool outputs
                    client.beta.threads.runs.submit_tool_outputs(
                        thread_id=thread.id,
                        run_id=run.id,
                        tool_outputs=tool_outputs
                    )
                
                # Wait a bit before checking again
                await asyncio.sleep(1)
            
            # Get the assistant's response
            messages = client.beta.threads.messages.list(
                thread_id=thread.id
            )
            
            # Display the last message from the assistant
            assistant_messages = [m for m in messages.data if m.role == "assistant"]
            if assistant_messages:
                last_message = assistant_messages[0]
                
                print("\n-------------------")
                print("RESPONSE")
                print("-------------------\n")
                print(last_message.content[0].text.value)
            
            print("\n-------------------\n")
            
        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except Exception as e:
            logger.error(f"Error: {e}")
            print(f"❌ An error occurred: {e}\n")

if __name__ == "__main__":
    asyncio.run(main()) 