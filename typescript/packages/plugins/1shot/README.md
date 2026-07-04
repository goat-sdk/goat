<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# 1Shot API GOAT Plugin

This plugin provides integration with your 1Shot API subscription. The plugin provides a tool for each defined endpoint in 1Shot, as well as the ability to create more endpoints dynamically and do contract discovery. 1Shot provides 1Stop for all your blockchain + AI needs!

Using this plugin, your AI agent of choice can utilize any of your predefined endpoints of choice in 1Shot API out of the box. You only need your API key, secret, and a business ID. If you need to interact with multiple businesses, just instantiate multiple instances of the plugin. The more interesting case is if the agent needs to interact with smart contracts you have not already setup in 1Shot API. In that case, the agent is provided tools to search 1Shot API's contract prompt repository and look for the contracts it needs, and then to create the endpoints it needs from the repository, before using them. The agent can thus figure out how to achieve your aims. When you prompt something like, "Trade 10 USDC for WEth", the agent can find a contract such as Uniswap, create the endpoints for that contract, and execute your intention.

1Shot API provides great advantages for the average AI user in that you do not need to maintain a wallet on your local machine. Using 1Shot API's Wallets (a custodial hot wallet), you don't have to worry about protecting your funds. Using the API Credentials system, you can also limit the agent's access to only pre-approved endpoints.

## Design
The 1Shot API plugin potentially turn every method of every deployed smart contract into a tool that can be used by an agent- with well defined parameters. This greatly simplifies the agent's job and improves reliablility of contract calls. The problem is that there is a 128 tool limit, and 1Shot API potentially makes many more than that available. To overcome this limitation, this plugin is designed to allow the agent to choose the tools it needs. Using 1Shot Prompts, the agent can search for contracts relevant to it's needs, and then assure that tools for those contracts exist. The tools chosen by the agent are added to the available tools by the plugin, on the next subsequent invocation. This means, for efficient agentic operation, you must run the agent in at least two steps. The first step should be a contract search ending with one or more assure tools calls. The second agent will have the tools available to use. If you have a certain set of contracts you want the agent to use, you can assure those tools yourself before the first invocation of the agent. This avoids the need for a multi-agent invocation.

The most efficient flow looks like this:
 - First Agent
  1. Determines user intent
  2. Formulates semantic queries to locate likely contracts to carry out that intent. 
  3. It uses the search_smart_contracts tool to search 1Shot Prompts.
  4. From the prompts, it chooses prompts that meet the intent of the user.
  5. For each chosen prompt, it executes the assure_contract_methods_from_prompt tool.
 - Second Agent
  1. Agent is initialized with a new call to getOnChainTools(), which will return an augmented tool set.
  2. Agent uses the available tools to execute transactions on the Blockchain

## Installation
```bash
npm install @goat-sdk/plugin-1shot
yarn add @goat-sdk/plugin-1shot
pnpm add @goat-sdk/plugin-1shot
```

## Usage
```typescript
import { 1shot } from '@goat-sdk/plugin-1shot';

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
       oneshot(apiKey, apiSecret, businessId)
    ]
});
```

## Tools
The 1Shot API plugin has a number of static tools available, in addition to an agent-driven dynamic tool set. The plugin maintains a list of "working tools", which are Contract Methods chosen by the agent and added to the list via the add_contract_method_to_working_tools. 

### Static Tools
* search_smart_contracts: Performs a semantic search of 1Shot Prompts, and returns the closest matches.
* assure_contract_methods_from_prompt: Assures that Contract Methods exist for the chosen Prompt and Wallet. If no matches are found, it will create new Contract Methods. It returns the contract methods for the prompt, whether newly created or not. These can easily be added to the working tool set via add_contract_method_to_working_tools.
* list_contract_methods: Lists existing Contract Methods in 1Shot API.
* add_contract_method_to_working_tools: Adds a Contract Method to the working tool set. Whenever you call getonChainTools(), the static tools plus dynamic tools added via add_contract_method_to_working_tools will be returned.
* list_wallets: Lists all the Wallets you have access to. This is limited by the access of your API Credential (API key + secret). This includes balance information. Contract Methods are pre-configured to use a particular Wallet. 
 * list_transactions: Lists Transactions you have executed. You can see your transaction history this way.
 * get_transaction: Returns a single, specific Transaction using the Transaction ID. This is mainly useful for polling, to see if a newly executed transaction successfully completed or not.
 * get_recent_transactions: Returns a list of Transaction objects that were created via the execute_contract_method call. This list is stale, but provides something like a memory. If you have multiple agent inferences, this is useful for passing on transactions that were executed by the previous agent to the current agent.

### Dynamic Tools
Each Contract Method will create either 1 or 3 tools, based on the type. Read methods create only the read_contract_method tool, while write methods create read, test and estimate tools. The tools name will change to match the actual name of the contract method.
* read_contract_method: Reads a result from the blockchain
* execute_contract_method: The heart of 1Shot API, this allows the agent to execute a Transaction onchain. This will return a Transaction object, which is also added to the Recent Transactions list.
* test_contract_method: Simulates the execution of a Contract Method, returning the result or an error.
* estimate_contract_method: Returns the amount of gas that will be used to execute the Contract Method.

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
