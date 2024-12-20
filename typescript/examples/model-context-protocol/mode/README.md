# Model Context Protocol with Mode

This example shows you how to integrate GOAT into Claude for Desktop using the Model Context Protocol.

## Setup

1. Install dependencies running `pnpm install`
2. Build the server running `pnpm build`
3. Install Claude client from [here](https://claude.ai/download)
4. We’ll need to configure Claude for Desktop for whichever MCP servers you want to use. To do this, open your Claude for Desktop App configuration at ~/Library/Application Support/Claude/claude_desktop_config.json in a text editor. Make sure to create the file if it doesn’t exist.
5. Add the following to the file:

If you use VSCode/Cursor, you can use the following command to create the file:

```
code ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

```json{
    "mcpServers": {
        "goat": {
            "command": "node",
            "args": [
                "/ABSOLUTE/PATH/TO/PARENT/FOLDER/build/index.js"
            ],
            "env": {
                "WALLET_PRIVATE_KEY": "<YOUR_PRIVATE_KEY>",
                "RPC_PROVIDER_URL": "https://mainnet.mode.network/"
            }
        }
    }
}
```

This tells Claude for Desktop:

There’s an MCP server named “goat”
Launch it by running node /ABSOLUTE/PATH/TO/PARENT/FOLDER/weather/build/index.js
Save the file, and restart Claude for Desktop.


4. Run Claude!

For more information on how to use the model context protocol, check out the [docs](https://modelcontextprotocol.io/quickstart/server).
