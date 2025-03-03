<div align="center">
<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</div>

# Model Context Protocol
## 🚀 Quickstart

This example demonstrates how to use GOAT to allow Claude for Desktop to **send and receive ETH and ERC-20 tokens** on EVM networks using the [Model Context Protocol](https://modelcontextprotocol.io/). This example uses [Base Sepolia](https://base.org) but you can implement it with any other EVM network by changing the chain and RPC URL.

You can use this example with any other agent framework, chain, and wallet of your choice.

## Requirements
- Have Claude for Desktop installed. You can download it from [here](https://claude.ai/download)

## Setup
1. Clone the repository:
```bash
git clone https://github.com/goat-sdk/goat.git && cd goat
```

2. Run the following commands from the `typescript` directory:
```bash
cd typescript
pnpm install
pnpm build
```

3. Go to the example directory:
```bash
cd examples/by-framework/model-context-protocol
```

4. Copy the `.env.template` and populate with your values:
```bash
cp .env.template .env
```
- `WALLET_PRIVATE_KEY`
- `RPC_PROVIDER_URL`

5. Add some test funds to your wallet by going to any [Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia)

### Configure the MCP server for Claude
1. Open your Claude for Desktop App configuration at `~/Library/Application Support/Claude/claude_desktop_config.json` in a text editor. Make sure to create the file if it doesn’t exist.

2. Add the following to the file:
```json
{
    "mcpServers": {
        "goat": {
            "command": "node",
            "args": [
                "/ABSOLUTE/PATH/TO/PARENT/model-context-protocol/build/index.js"
            ],
            "env": {
                "WALLET_PRIVATE_KEY": "<YOUR_PRIVATE_KEY>",
                "RPC_PROVIDER_URL": "<YOUR_RPC_PROVIDER_URL>"
            }
        }
    }
}
```

This tells Claude for Desktop:
- There’s an MCP server named “goat”
- Launch it by running `node /ABSOLUTE/PATH/TO/PARENT/FOLDER/model-context-protocol/build/index.js`

3. Save the file, and restart Claude for Desktop.

## Usage
1. Run Claude for Desktop

2. Chat with the agent:
- Check your balance for ERC-20 tokens
- Send ERC-20 tokens to another address
- Check your balance again to see the tokens you just sent

For more information on how to use the model context protocol, check out the [docs](https://modelcontextprotocol.io/quickstart/server).

<footer>
<br/>
<br/>
<div>
  <img src="https://github.com/user-attachments/assets/4821833e-52e5-4126-a2a1-59e9fa9bebd7" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">

<div>
</footer>
