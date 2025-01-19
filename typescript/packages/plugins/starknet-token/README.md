# @goat/starknet-token

A Goat plugin for interacting with tokens on the Starknet blockchain.

## Features

- Support for ERC20 tokens on Starknet
- Balance checking
- Token transfers
- Allowance management (approve/check allowance)
- Pre-configured common tokens (ETH, USDC, STRK)
- Support for mainnet, testnet, and goerli networks

## Installation

```bash
npm install @goat/starknet-token
```

## Usage

```typescript
import { StarknetTokenPlugin, ETH, USDC } from "@goat/starknet-token";

// Initialize the plugin
const plugin = new StarknetTokenPlugin();
await plugin.init({ network: "mainnet" });

// Check balance
const balance = await plugin.getBalance(ETH);
console.log(`ETH Balance: ${balance}`);

// Transfer tokens
const recipient = "0x123...";
const amount = BigInt("1000000000000000000"); // 1 ETH
const txHash = await plugin.transfer(ETH, recipient, amount);
console.log(`Transfer transaction: ${txHash}`);

// Approve spending
const spender = "0x456...";
const approvalTxHash = await plugin.approve(USDC, spender, BigInt("1000000")); // 1 USDC
console.log(`Approval transaction: ${approvalTxHash}`);

// Check allowance
const owner = "0x789...";
const allowance = await plugin.getAllowance(USDC, owner, spender);
console.log(`USDC Allowance: ${allowance}`);
```

## Supported Networks

- Mainnet
- Testnet
- Goerli

## Pre-configured Tokens

- ETH (Ether)
- USDC (USD Coin)
- STRK (Starknet Token)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 