<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# 1shot GOAT Plugin

This plugin provides integration with your 1Shot API subscription. The plugin provides a tool for each defined endpoint in 1Shot, as well as the ability to create more endpoints dynamically and do contract discovery. 1Shot provides 1Stop for all your blockchain + AI needs!

Using this plugin, your AI agent of choice can utilize any of your predefined endpoints of choice in 1Shot out of the box. You only need your API key, secret, and a business ID. If you need to interact with multiple businesses, just instantiate multiple instances of the plugin. The more interesting case is if the agent needs to interact with smart contracts you have not already setup in 1Shot. In that case, the agent is provided tools to search 1Shot's contract repository and look for the contracts it needs, and then to create the endpoints it needs from the repository, before using them. The agent can thus figure out how to achieve your aims. When you prompt sometihng like, "Trade 10 USDC for WEth", the agent can find a contract such as Uniswap, create the endpoints for that contract, and execute your intention.

1Shot provides great advantages for the average AI user in that you do not need to maintain a wallet on your local machine. Using 1Shot's Escrow Wallets (a custodial hot wallet), you don't have to worry about protecting your funds. Using the API Credentials system, you can also limit the agent's access to only pre-approved endpoints.

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
Every endpoint in 1Shot is automatically converted to a proper tool. There are also some static tools
* list_transactions
Lists all the endpoints you have available. This is done internally to generate the tools.
* list_escrow_wallets
Lists all the escrow wallets you have access to. This is limited by the access of your API Credential (API key + secret). This includes balance information. Endpoints are pre-configured to use a particular
escrow wallet. 

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
