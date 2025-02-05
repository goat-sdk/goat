# Vercel AI with Radix Example

This example demonstrates how to use GOAT with Vercel AI SDK to create an interactive DeFi assistant for Radix DLT. It provides a natural language interface for sending XRD token.

## Overview

The example showcases:

-   Interactive chat interface
-   Radix DLT integration

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Copy the `.env.template` and populate with your values:

```bash
cp .env.template .env
```

### Required Environment Variables:

-   `OPENAI_API_KEY`: Your OpenAI API key for the AI model

## Usage

1. Run the interactive chat:

```bash
pnpm dlx tsx ./index.ts
```

2. Example interactions:

```
# Token Operations
Send 420 XRD to address...

```

3. Understanding responses:
    - Transaction confirmations
    - Error messages
