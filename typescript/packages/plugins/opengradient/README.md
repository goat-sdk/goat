<div align="center">
<a href="https://github.com/goat-sdk/goat">
<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# OpenGradient GOAT Plugin

This plugin integrates the OpenGradient service with the GOAT SDK, providing on-chain ML model inference and LLM interactions.

## Installation
```bash
npm install @goat-sdk/plugin-opengradient
yarn add @goat-sdk/plugin-opengradient
pnpm add @goat-sdk/plugin-opengradient
```

## Usage
```typescript
import { opengradient } from '@goat-sdk/plugin-opengradient';
import { Goat } from "@goat-sdk/core";

// Initialize with environment variables for secure credential management
const goat = new Goat()
  .plugin(
    opengradient({
      config: {
        // Configure with your authentication credentials
        // Use environment variables for secure credential management
      },
    })
  );

// Run model inference
const result = await goat.opengradient_model_inference({
  modelCid: "your-model-cid",
  inferenceMode: 0, // 0 for VANILLA, 1 for TEE
  modelInput: { /* your model input */ },
});

// LLM completion
const completion = await goat.opengradient_llm_completion({
  modelCid: "llm-model-cid",
  inferenceMode: 0, // 0 for VANILLA, 1 for TEE
  prompt: "Tell me a story about a robot learning to love.",
  maxTokens: 100,
  temperature: 0.7,
});

// LLM chat
const chatResponse = await goat.opengradient_llm_chat({
  modelCid: "llm-model-cid",
  inferenceMode: 0, // 0 for VANILLA, 1 for TEE
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "How can I learn about blockchain development?" },
  ],
  maxTokens: 150,
  temperature: 0.7,
});
```

## Tools
* `opengradient_model_inference` - Run inference on machine learning models using OpenGradient
* `opengradient_llm_completion` - Generate text completions using LLMs through OpenGradient
* `opengradient_llm_chat` - Interact with LLMs using a chat interface through OpenGradient

## Features
- Run inference on ML models through OpenGradient's on-chain infrastructure
- Generate text completions using LLMs
- Interact with LLMs using a chat interface
- Support for tool usage in LLM conversations

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
