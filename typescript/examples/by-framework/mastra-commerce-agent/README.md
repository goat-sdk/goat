<div align="center">
<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</div>

# Gymshark Customer Service Agent with Mastra AI

## 🚀 Quickstart

This example demonstrates how to use GOAT to build a Shopify store customer service agent with [Mastra](https://github.com/mastra-ai/mastra) that can:

1. Receive and respond to SMS messages via [Twilio](https://www.twilio.com/)
2. Search for products in the Gymshark Shopify store based on customer queries using [Rye's API](https://docs.rye.com/)
3. Provide product recommendations and customer service assistance

You can use this example with any other agent framework, chain, and wallet of your choice.

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
cd examples/by-framework/mastra-commerce-agent
```

4. Copy the `.env.template` and populate with your values:
```bash
cp .env.template .env
```

Required environment variables:
- `OPENAI_API_KEY`: Your OpenAI API key for the LLM
- `TWILIO_ACCOUNT_SID`: Your Twilio account SID
- `TWILIO_AUTH_TOKEN`: Your Twilio auth token
- `TWILIO_PHONE_NUMBER`: Your Twilio phone number
- `RYE_API_KEY`: Your Rye API key for Shopify store search in JSON format

The Rye API key should be in JSON format with both the Authorization and Shopper IP headers:
```
RYE_API_KEY={"Authorization":"Basic YOUR_RYE_BASIC_AUTH_TOKEN","Rye-Shopper-IP":"YOUR_SHOPPER_IP"}
```

## Usage

### CLI Mode

1. Run the interactive CLI:
```bash
pnpm tsx src/index.ts
```

2. Chat with the agent:
- Ask questions like "I'm looking for men's workout shirts" or "Do you have any women's leggings?"
- The agent will search the Gymshark store and recommend products
- Type `twilio` to start the Twilio SMS server
- Type `exit` to quit the CLI

Example conversation:
```
Enter your prompt: I'm looking for men's workout shirts

-------------------

TOOLS CALLED

-------------------

[
  {
    "type": "tool_call",
    "id": "call_abc123",
    "name": "searchGymsharkProducts",
    "input": {
      "query": "men's workout shirts",
      "limit": 5
    }
  }
]

-------------------

RESPONSE

-------------------

I've found some great men's workout shirts from Gymshark for you:

1. Arrival T-Shirt - Black
   Price: USD 30
   Description: A versatile training t-shirt with a regular fit and soft, lightweight fabric...
   URL: https://www.gymshark.com/products/gymshark-arrival-t-shirt-black

2. Training T-Shirt - Blue
   Price: USD 35
   Description: Designed for intense workouts with sweat-wicking technology and a comfortable fit...
   URL: https://www.gymshark.com/products/gymshark-training-t-shirt-blue

3. Performance Tank - Grey
   Price: USD 28
   Description: Sleeveless design for maximum mobility during workouts with breathable fabric...
   URL: https://www.gymshark.com/products/gymshark-performance-tank-grey

Would you like more specific recommendations? I can help you find shirts for specific activities like running, weightlifting, or HIIT training.

-------------------
```

### Twilio SMS Server

1. Start the Twilio SMS server directly:
```bash
pnpm tsx src/twilio/server.ts
```

2. Use ngrok to expose your local server:
```bash
ngrok http 3000
```

3. Configure your Twilio phone number's webhook:
   - Go to the Twilio console
   - Set the webhook URL for SMS to your ngrok URL + "/sms" (e.g., https://abc123.ngrok.io/sms)
   - Set the HTTP method to POST

4. Send an SMS to your Twilio phone number to start interacting with the agent

## Key Features

### Gymshark Product Search

The agent uses Rye's API to search for products in the Gymshark Shopify store. This allows customers to find products based on:
- Product type (shirts, leggings, shorts, etc.)
- Gender (men's, women's)
- Size
- Color
- Activity type (running, training, yoga, etc.)

### Natural Language Understanding

Powered by the Mastra AI framework, the agent can understand complex queries and provide personalized recommendations based on customer needs.

### SMS Communication

The agent communicates with customers via SMS using Twilio's messaging API, making it accessible to anyone with a mobile phone.

## Troubleshooting

### Rye API Issues

If you encounter issues with the Rye API:

1. Verify your API key format in the `.env` file:
```
RYE_API_KEY={"Authorization":"Basic YOUR_RYE_BASIC_AUTH_TOKEN","Rye-Shopper-IP":"YOUR_SHOPPER_IP"}
```

2. Check the console logs for any error messages related to the Rye API
3. Ensure you have proper internet connectivity to reach the Rye API endpoint

### Twilio SMS Issues

If you encounter issues with Twilio SMS:

1. Verify your Twilio credentials in the `.env` file
2. Check that your ngrok tunnel is running and accessible
3. Verify the webhook URL in your Twilio phone number settings
4. Check the Twilio console for any error messages

## Using in Production

In production, developers require advanced wallet setups that utilize [smart wallets](https://docs.goat-sdk.com/concepts/smart-wallets), which allow them to:
1. **Increase security** by setting programmable permissions
2. **Maintain regulatory compliance** by ensuring agent wallets are non-custodial

For more information on production deployments, please refer to the [GOAT SDK documentation](https://docs.goat-sdk.com/).

<footer>
<br/>
<br/>
<div>
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
<div>
</footer>
