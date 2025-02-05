# Vercel AI with Mode Example

## Setup

Copy the `.env.template` and populate with your values.

```
cp .env.template .env
```

## Usage

Run the following command from the /mode directory:

```
npx ts-node index.ts
```

## Result

- User: what it the current price of btc?
- Assistant: The current price of Bitcoin (BTC) is $96,811.
- Tool: CoinGecko API
---
- User: what will be the price in 5 hours?
- Assistant: In 5 hours, the predicted price of Bitcoin is approximately **$97051.73**.
- Tool: Synth API
---
- User: what will be the bitcoin price tomorrow?
- Assistant: 
```
The predicted price of Bitcoin for tomorrow (February 6, 2025) shows a range of values throughout the day. Here are some key predictions:

- **00:00 UTC**: $96,447.06
- **06:00 UTC**: $95,515.82
- **12:00 UTC**: $94,412.36
- **18:00 UTC**: $89,826.51
- **22:00 UTC**: $89,883.51

Please note that these prices are predictions and can vary significantly.
```
- Tool: Synth API
