# Dynamic + Eleven Labs Conversational Agent Example

This example uses the ElevenLabs base project described [here](https://elevenlabs.io/docs/conversational-ai/guides/conversational-ai-guide-nextjs) and follows the steps to add client tool calling described [here](https://elevenlabs.io/docs/conversational-ai/customization/client-tools) as well as the Dynamic SDK to connect to the wallet and handle network switching etc.

Video demo: https://www.loom.com/share/5a89a3fc47a54df18ab051901bf7cc9b

## Setup

1. Copy the `.example.env` and populate with your values.

```
cp .example.env .env
```

2. Create an ElevenLabs agent and get the agent ID. You can follow this guide: https://elevenlabs.io/docs/conversational-ai/docs/agent-setup

3. Set the `NEXT_PUBLIC_ELEVEN_LABS_AGENT_ID` environment variable with the agent ID.

4. ElevenLabs requires you to register each tool manually through the ElevenLabs dashboard. To make it easier, we've added a `logTools` option to the `getOnChainTools` function. This will log the tools with their respective descriptions and parameters to the console.

```typescript
const tools = await getOnChainTools({
    wallet: viem(wallet),
    options: {
        logTools: true,
    },
});
```

5. Run the app with `pnpm dev`, connect your wallet, and start the conversation!
