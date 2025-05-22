#!/usr/bin/env python3
import os
import asyncio
import sys
import json
from dotenv import load_dotenv

# OpenAI imports
from openai import OpenAI

# For terminal interaction
import readline

# GOAT imports
from goat import get_tools
from goat_wallets.web3.wallet import web3
from web3 import Web3
from web3.providers.rpc import HTTPProvider

# Import our local CrossmintHeadlessCheckoutPlugin
from crossmint_plugin import CrossmintHeadlessCheckoutService, CrossmintHeadlessCheckoutPlugin, CrossmintHeadlessCheckoutPluginOptions

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

async def main():
    # 1. Create an EVM wallet client for Base Sepolia
    # Initialize Web3 provider
    provider_url = os.environ.get("RPC_PROVIDER_URL")
    w3 = Web3(HTTPProvider(provider_url))
    
    # Create wallet using the web3 factory function
    wallet_client = web3(
        client=w3,
        options=None  # Use default options
    )
    
    # Create plugin options and plugin instance
    plugin_options = CrossmintHeadlessCheckoutPluginOptions(api_key=os.environ.get("CROSSMINT_API_KEY"))
    plugin = CrossmintHeadlessCheckoutPlugin(plugin_options)
    print("Using CrossmintHeadlessCheckoutPlugin")
              
    # 2. Get your onchain tools for your wallet
    tools = get_tools(
        wallet=wallet_client,
        plugins=[plugin]
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
    
    # 3. Create an OpenAI client
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    
    # Create an assistant
    assistant = client.beta.assistants.create(
        name="Amazon Purchase Assistant",
        instructions=SYSTEM_PROMPT,
        model="gpt-4o-mini",
        tools=assistant_tools
    )
    
    # Create a thread for conversation
    thread = client.beta.threads.create()
    
    # Store conversation history
    messages = []
    
    # 4. Run the interactive chat loop
    print("Welcome to the Amazon Purchase Agent!")
    print("You can ask to purchase an Amazon item using crypto.")
    print('Enter "exit" to quit the program.')
    
    while True:
        # Get user input
        prompt = input('\nEnter your prompt (or "exit" to quit): ')
        
        if prompt.lower() == 'exit':
            break
        
        # Add the user message to the thread
        client.beta.threads.messages.create(
            thread_id=thread.id,
            role="user",
            content=prompt
        )
        
        print("\n-------------------\n")
        print("TOOLS CALLED")
        print("\n-------------------\n")
        
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
                                # Execute the tool
                                result = await tool(wallet_client, tool_call.function.arguments)
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
            
            print("\n-------------------\n")
            print("RESPONSE")
            print("\n-------------------\n")
            print(last_message.content[0].text.value)
        
        print("\n-------------------\n")

if __name__ == "__main__":
    asyncio.run(main()) 