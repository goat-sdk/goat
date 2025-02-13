<div align="center">

[Website](https://ohmygoat.dev) | [X](https://x.com/goat_sdk) | [Discord](https://discord.gg/goat-sdk)

GOAT is free software, MIT licensed, sponsored by [Crossmint](https://www.crossmint.com)

![NPM Downloads](https://img.shields.io/npm/dm/%40goat-sdk%2Fcore)
![GitHub License](https://img.shields.io/github/license/goat-sdk/goat)

![PyPI - Python Version](https://img.shields.io/pypi/pyversions/goat-sdk)

</div>

# GOAT 🐐 (Python)

![X (formerly Twitter) Follow](https://img.shields.io/twitter/follow/goat-sdk)

GOAT (Great Onchain Agent Toolkit) is a library that adds more than +200 onchain tools to your AI agent.

-   **[+200 tools](#plugins)**: DeFi (Uniswap, Jupiter, KIM, Orca, etc.), minting (OpenSea, MagicEden, etc.), betting (Polymarket, etc.), analytics (CoinGecko, BirdEye, Allora, etc.) and more
-   **Chains**: EVM (Base, Polygon, Mode, Sei, etc.), Solana, Aptos, Chromia, Fuel, Sui, Starknet and Zilliqa
-   **[Wallets](#wallets)**: keypair, smart wallets (Crossmint, etc.), LIT, MPC (Coinbase, etc.)
-   **[Agent Frameworks](#agent-frameworks-adapters)**: AI SDK, Langchain, Eliza, ZerePy, GAME, ElevenLabs, etc.

## Table of Contens

- [GOAT 🐐 (Python)](#goat--python)
  - [Table of Contens](#table-of-contens)
  - [Installation](#installation)
  - [Usage](#usage)
  - [How to create a plugin](#how-to-create-a-plugin)
    - [Using the Plugin Generator](#using-the-plugin-generator)
    - [Manual Creation](#manual-creation)
      - [1. Define your plugin extending the PluginBase class.](#1-define-your-plugin-extending-the-pluginbase-class)
      - [2. Add tools to the plugin](#2-add-tools-to-the-plugin)
      - [3. Add the plugin to the agent](#3-add-the-plugin-to-the-agent)
      - [Next steps](#next-steps)
  - [How to add a chain](#how-to-add-a-chain)
    - [1. Add the chain to the `chain.py` file](#1-add-the-chain-to-the-chainpy-file)
    - [2. Create a new wallet provider package](#2-create-a-new-wallet-provider-package)
    - [3. Create a plugin to allow sending your native token to a wallet](#3-create-a-plugin-to-allow-sending-your-native-token-to-a-wallet)
    - [4. Implement the wallet client](#4-implement-the-wallet-client)
    - [5. Submit a PR](#5-submit-a-pr)
  - [How to add a wallet provider](#how-to-add-a-wallet-provider)
  - [Packages](#packages)
    - [Core](#core)
    - [Wallets](#wallets)
    - [Agent Framework Adapters](#agent-framework-adapters)
    - [Plugins](#plugins)

## Installation

1. Install the core package

```bash
pip install goat-sdk
```

2. Depending on the type of wallet you want to use, install the corresponding wallet (see all wallets [here](#wallets)):

```bash
pip install goat-sdk-wallet-solana
```

3. Install the plugins for the protocols you need (see all available plugins [here](#plugins))

```bash
pip install goat-sdk-plugin-spl-token
```

4. Install the adapter for the agent framework you want to use (see all available adapters [here](#adapters))

```bash
pip install goat-sdk-adapter-langchain
```

## Usage

1. Configure your wallet

```python
from goat_wallets.solana import solana

# Initialize Solana client and wallet
client = SolanaClient(os.getenv("SOLANA_RPC_ENDPOINT"))
keypair = Keypair.from_base58_string(os.getenv("SOLANA_WALLET_SEED") or "")
wallet = solana(client, keypair)
```

2. Configure your tools for the framework you want to use

```python
# Initialize SPL Token plugin
spl_token_plugin = spl_token(SplTokenPluginOptions(
    network="devnet",  # Using devnet as specified in .env
    tokens=SPL_TOKENS
))

# Initialize tools with Solana wallet
tools = get_on_chain_tools(
    wallet=wallet,
    plugins=[spl_token_plugin]
)
```

3. Plug into your agent framework

```python
agent = create_tool_calling_agent(llm, tools, prompt)
agent_executor = AgentExecutor(
    agent=agent, tools=tools, handle_parsing_errors=True, verbose=True
)

response = agent_executor.invoke(
    {
        "input": "Send 10 USDC to ohmygoat.sol",
    }
)

print(response)
```

## How to create a plugin

GOAT plugins enable your agent to interact with various blockchain protocols.

Plugins can be chain-specific (EVM, Solana, etc.) or chain-agnostic. If a plugin is chain-specific it will fail to compile when being used with a wallet of a different chain.

You can see all available plugins [here](#plugins).

### Using the Plugin Generator

Run the plugin generator script from the `python` directory:

```bash
cd python
python scripts/create_plugin.py <plugin-name> [--evm]
```

Options:

-   `<plugin-name>`: Name of your plugin (e.g., 'my-token', 'my-service')
-   `--evm`: Optional flag to indicate if the plugin is EVM-compatible

Examples:

1. Create an EVM-compatible plugin:

```bash
python scripts/create_plugin.py my-token --evm
```

2. Create a chain-agnostic plugin:

```bash
python scripts/create_plugin.py my-service
```

The script generates a complete plugin package with the following structure:

```
src/plugins/<plugin-name>/
├── pyproject.toml          # Project configuration and dependencies
├── README.md              # Plugin documentation
└── goat_plugins/<plugin-name>/
    ├── __init__.py       # Plugin initialization and configuration
    ├── parameters.py     # Pydantic parameter models
    └── service.py        # Service implementation with Tool decorators
```

### Manual Creation

#### 1. Define your plugin extending the [PluginBase](https://github.com/goat-sdk/goat/tree/main/python/src/goat_sdk/goat/classes/plugin_base.py) class.

```python
from goat.classes.plugin_base import PluginBase

# For a chain-agnostic plugin we use the WalletClientBase interface, for a chain-specific plugin we use the EVMWalletClient, SolanaWalletClient, or corresponding interfaces
class MyPlugin(PluginBase[WalletClientBase]):
    def __init__(self):
        # We define the name of the plugin
        super("myPlugin", []);

    # We define the chain support for the plugin, in this case we support all chains
    def supports_chain(self, chain: Chain) -> bool:
        return True

# We export a factory function to create a new instance of the plugin
my_plugin = () => MyPlugin()
```

#### 2. Add tools to the plugin

You can create a class and decorate its methods with the `@Tool` decorator to create tools.

The tool methods will receive the wallet client as the first argument and the parameters as the second argument.

```python
from pydantic import BaseModel, Field

class SignMessageParameters(BaseModel):
    message: str = Field(..., description="The message to sign")

class MyTools {
    @Tool({
        "name": "sign_message",
        "description": "Sign a message",
        "parameters_schema": SignMessageParameters
    })
    async def sign_message(self, walletClient: WalletClientBase, parameters: dict):
        signed = await walletClient.sign_message(parameters.message);
        return signed.signed_message;
    }
```

Once we have our class we now need to import it in our plugin class.

```python
class MyPlugin(PluginBase[WalletClientBase]):
    def __init__(self):
        # We define the name of the plugin
        super("myPlugin", [MyTools()]);

    # We define the chain support for the plugin, in this case we support all chains
    def supports_chain(self, chain: Chain) -> bool:
        return True
}

# We export a factory function to create a new instance of the plugin
my_plugin = () => MyPlugin()
```

Inside the method, we will return an array of tools created using the `createTool` function.

```typescript
import { PluginBase, WalletClientBase, createTool } from "@goat-sdk/core";

// Since we are creating a chain-agnostic plugin, we can use the WalletClientBase interface
export class MyPlugin extends PluginBase<WalletClientBase> {
    constructor() {
        // We define the name of the plugin
        super("myPlugin", []);
    }

    // We define the chain support for the plugin, in this case we support all chains
    supportsChain = (chain: Chain) => true;

    getTools(walletClient: WalletClientBase) {
        return [
            // Create tool requires two arguments:
            // 1. The tool metadata (name, description, parameters)
            // 2. The tool method (the function that will be executed when the tool is used)
            createTool(
                {
                    name: "sign_message",
                    description: "Sign a message",
                    parameters: z.object({
                        message: z.string(),
                    }),
                },
                async (parameters) => {
                    const signed = await walletClient.signMessage(
                        parameters.message
                    );
                    return signed.signedMessage;
                }
            ),
        ];
    }
}

// We export a factory function to create a new instance of the plugin
export const myPlugin = () => new MyPlugin();
```

#### 3. Add the plugin to the agent

```python
tools = get_on_chain_tools(
    wallet=wallet,
    plugins=[my_plugin]
)
```

#### Next steps

-   Share your plugin with others!
-   Open a PR to add it to the [plugins registry](https://github.com/goat-sdk/goat/tree/main/python/src/plugins) in the [GOAT SDK](https://github.com/goat-sdk/goat).

## How to add a chain

### 1. Add the chain to the `chain.py` file

Add your chain to the `chain.py` file in the [core package](https://github.com/goat-sdk/goat/tree/main/python/src/goat_sdk/goat/types/chain.py).

```python
class MyAwesomeChain(TypedDict):
    """MyAwesomeChain chain type definition

    Args:
        type: Literal "my-awesome-chain" chain type identifier
    """
    type: Literal["my-awesome-chain"]

# ...
Chain = Union[EvmChain, SolanaChain, MyAwesomeChain]
```

### 2. Create a new wallet provider package

Create a new package in the [wallets directory](https://github.com/goat-sdk/goat/tree/main/python/src/wallets) with the name of your chain (e.g. `my-awesome-chain`) or copy an existing one (e.g. `evm`).
In this package you will define the abstract class for your chain's wallet client which will extend the `WalletClientBase` class defined in the [core package](https://github.com/goat-sdk/goat/tree/main/python/src/goat-sdk/goat/wallets/core.py).

WalletClientBase only includes the methods that are supported by all chains such as:

1. `get_address`
2. `get_chain`
3. `sign_message`
4. `balance_of`

As well as includes the `get_core_tools` method which returns the core tools for the chain.

```python
class MyAwesomeChainWalletClient(WalletClientBase):
    @abstractmethod
    def get_chain(self) -> MyAwesomeChain:
        """Get the EVM chain this wallet is connected to."""
        pass

    @abstractmethod
    def send_transaction(self, transaction: MyAwesomeChainTransaction) -> Dict[str, str]:
        """Send a transaction on the EVM chain."""
        pass

    @abstractmethod
    def read(self, request: MyAwesomeChainReadRequest) -> MyAwesomeChainReadResult:
        """Read data from a smart contract."""
        pass
}
```

### 3. Create a plugin to allow sending your native token to a wallet

Create a plugin to allow sending your native token to a wallet. Create a file in the same package as your wallet client and create a new file like `send<native-token>.py`.

Implement the core plugin.

```python
class SendMYAWESOMETOKENPlugin(PluginBase[MyAwesomeChainWalletClient]):
    def __init__(self):
        super().__init__("sendMYAWESOMETOKEN", [])

    def supports_chain(self, chain: Chain) -> bool:
        return chain["type"] == "my-awesome-chain"

    def get_tools(self, wallet_client: MyAwesomeChainWalletClient) -> List[ToolBase]:
        send_tool = create_tool(
            config={
                "name": f"send_myawesometoken",
                "description": f"Send MYAWESOMETOKEN to an address.",
                "parameters": SendMYAWESOMETOKENParameters,
            },
            execute_fn=lambda params: send_myawesometoken_method(
                wallet_client, cast(Dict[str, str], params)
            ),
        )
        return [send_tool]
```

### 4. Implement the wallet client

Extend your abstract class with the methods you need to implement and create your first wallet client! (e.g `MyAwesomeChainKeyPairWalletClient`)

```python
class MyAwesomeChainKeyPairWalletClient(MyAwesomeChainWalletClient):
    # Implement the methods here
    pass

# Export the wallet client with a factory function
my_awesome_chain_wallet_client = () => MyAwesomeChainKeyPairWalletClient()
```

### 5. Submit a PR

Submit a PR to add your wallet provider to the [wallets directory](https://github.com/goat-sdk/goat/tree/main/typescript/packages/wallets).

## How to add a wallet provider

If you don't see your wallet provider supported, you can easily integrate it by implementing the specific [WalletClient](https://github.com/goat-sdk/goat/blob/main/python/src/wallets) interface for the chain and type of wallet you want to support:

Checkout [here how the web3 client implementation](https://github.com/goat-sdk/goat/tree/main/python/src/wallets/web3).

If you would like to see your wallet provider supported, please open an issue or submit a PR.

## Packages

### Core

|      | PyPI package                                   |
| ---- | ---------------------------------------------- |
| Core | [goat-sdk](https://pypi.org/project/goat-sdk/) |

### Wallets

| Wallet | PyPI package                                                               |
| ------ | -------------------------------------------------------------------------- |
| EVM    | [goat-sdk-wallet-evm](https://pypi.org/project/goat-sdk-wallet-evm/)       |
| Web3   | [goat-sdk-wallet-web3](https://pypi.org/project/goat-sdk-wallet-web3/)     |
| Solana | [goat-sdk-wallet-solana](https://pypi.org/project/goat-sdk-wallet-solana/) |

### Agent Framework Adapters

| Adapter   | PyPI package                                                                       |
| --------- | ---------------------------------------------------------------------------------- |
| Langchain | [goat-sdk-adapter-langchain](https://pypi.org/project/goat-sdk-adapter-langchain/) |

\*_ZerePy and GAME have direct integrations on their respective repos._

### Plugins

| Plugin      | Tools                                       | PyPI package                                                                         |
| ----------- | ------------------------------------------- | ------------------------------------------------------------------------------------ | --- |
| 1inch       | Get wallet balances using 1inch API         | [goat-sdk-plugin-1inch](https://pypi.org/project/goat-sdk-plugin-1inch/)             |
| Allora      | Get price predictions using Allora API      | [goat-sdk-plugin-allora](https://pypi.org/project/goat-sdk-plugin-allora/)           |
| CoinGecko   | Get coin information using CoinGecko API    | [goat-sdk-plugin-coingecko](https://pypi.org/project/goat-sdk-plugin-coingecko/)     |
| Dexscreener | Get token information using Dexscreener API | [goat-sdk-plugin-dexscreener](https://pypi.org/project/goat-sdk-plugin-dexscreener/) |
| ERC20       | Interact with any ERC20 token               | [goat-sdk-plugin-erc20](https://pypi.org/project/goat-sdk-plugin-erc20/)             |
| Farcaster   | Read and post casts on Farcaster            | [goat-sdk-plugin-farcaster](https://pypi.org/project/goat-sdk-plugin-farcaster/)     |
| JSON RPC    | Call any JSON RPC endpoint                  | [goat-sdk-plugin-json-rpc](https://pypi.org/project/goat-sdk-plugin-json-rpc/)       |     |
| Jupiter     | Get price predictions using Jupiter API     | [goat-sdk-plugin-jupiter](https://pypi.org/project/goat-sdk-plugin-jupiter/)         |     |
| Nansen      | Get wallet insights using Nansen API        | [goat-sdk-plugin-nansen](https://pypi.org/project/goat-sdk-plugin-nansen/)           |     |
| OpenSea     | Get NFT and sales data from OpenSea         | [goat-sdk-plugin-opensea](https://pypi.org/project/goat-sdk-plugin-opensea/)         |     |
| Rugcheck    | Check if tokens are legit with Rugcheck     | [goat-sdk-plugin-rugcheck](https://pypi.org/project/goat-sdk-plugin-rugcheck/)       |     |
| SPL Tokens  | Interact with SPL tokens                    | [goat-sdk-plugin-spl-token](https://pypi.org/project/goat-sdk-plugin-spl-token/)     |     |
| Superfluid  | Create streams with Superfluid              | [goat-sdk-plugin-superfluid](https://pypi.org/project/goat-sdk-plugin-superfluid/)   |     |
| Uniswap     | Get quotes and swap on Uniswap              | [goat-sdk-plugin-uniswap](https://pypi.org/project/goat-sdk-plugin-uniswap/)         |     |
