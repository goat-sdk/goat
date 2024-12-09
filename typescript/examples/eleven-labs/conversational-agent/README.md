# Eleven Labs Conversational Agent Example

This example uses the ElevenLabs base project described [here](https://elevenlabs.io/docs/conversational-ai/guides/conversational-ai-guide-nextjs) and follows the steps to add client tool calling described [here](https://elevenlabs.io/docs/conversational-ai/customization/client-tools).

https://github.com/user-attachments/assets/2a53b2af-eefe-46c7-a3d4-9441eefe0f81

## Setup

1. Copy the `.example.env` and populate with your values.

```
cp .example.env .env
```
`NEXT_PUBLIC_ELEVEN_LABS_AGENT_ID` - create an agent [here](https://elevenlabs.io/app/conversational-ai), and copy agent ID

`NEXT_PUBLIC_SEPOLIA_RPC_URL` - create your first app on [Alchemy](https://dashboard.alchemy.com/apps), and go to the Networks tab to copy Ethereum Sepolia API key

`NEXT_PUBLIC_COINGECKO_API_KEY` - create your demo account API key on the Coingecko developer [dashboard](https://www.coingecko.com/en/developers/dashboard)

2. Run `pnpm install` on the root directory (/goat). Then, go to the /conversational-agent directory to run `pnpm install && build`. After a successful build, run the app with `pnpm dev`, connect your wallet, and start the conversation!

**Note**: ElevenLabs requires you to register each tool manually through the ElevenLabs dashboard. To make it easier, we've added a `logTools` option to the `getOnChainTools` function. This will log the tools with their respective descriptions and parameters to the console.

```typescript
const tools = await getOnChainTools({
    wallet: viem(wallet),
    options: {
        logTools: true,
    },
});
```
When you load the site, the console logs each tool that is called, which you would need to add into your agent's dashboard as a `client tool`. The logs will look something like this:

```
get_eth_balance

Description: This tool returns the ETH balance of an EVM wallet.

Parameters:

- address (optional) (string): The address to get the balance of, defaults to the address of the wallet
```
Add it in the Eleven Labs Agent console like so:

<img width="576" alt="Screenshot 2024-12-09 at 6 04 09 PM" src="https://github.com/user-attachments/assets/3e713bc4-9830-4487-b9f8-515cfe050d7a">
