# Goat Celo Plugin 🐐 - TypeScript

The Celo plugin for Goat allows you to create tools for interacting with ERC20 and ERC721 tokens on the Celo blockchain. This includes deploying contracts, transferring tokens, checking balances, minting NFTs, and more.

## Installation

```
npm install @goat-sdk/plugin-celo
```

## Usage

Here's a basic example of how to use the plugin:

```typescript
import { celoPlugin } from "@goat-sdk/plugin-celo";

const plugin = celoPlugin({
    tokens: [],
});
```

### Adding custom tokens

You can add custom tokens by specifying their details, such as decimals, symbol, name, and contract address for specific chains:

```typescript
import { celoPlugin } from "@goat-sdk/plugin-celo";

const plugin = celoPlugin({
    tokens: [
        {
            decimals: 18,
            symbol: "CELO",
            name: "Celo Native Token",
            chains: {
                "42220": {
                    contractAddress:
                        "0x471EcE3750Da237f93B8E339c536989b8978a438",
                },
            },
        },
        // Add more tokens as needed
    ],
});
```

## Features

- Deploy ERC20 and ERC721 Contracts: Deploy standard ERC20 and ERC721 contracts on the Celo blockchain.
- Transfer Tokens: Transfer ERC20 and ERC721 tokens to other addresses.
- Check Balances: Retrieve the balance of ERC20 and ERC721 tokens for a given address.
- Mint NFTs: Mint NFTs using the ERC721 standard.
- Token Allowance: Check and manage token allowances.

## API Reference

### Deploy ERC20

Deploy a new ERC20 token contract:

```typescript
async deployERC20(walletClient: ViemEVMWalletClient, parameters: DeployERC20Parameters): Promise<string>
```

### Deploy ERC721

Deploy a new ERC721 token contract:

```typescript
async deployERC721(walletClient: ViemEVMWalletClient, parameters: DeployERC721Parameters): Promise<string>
```

### Transfer ERC20 Tokens

Transfer an amount of an ERC20 token to an address:

```typescript
async transfer(walletClient: ViemEVMWalletClient, parameters: TransferParameters): Promise<string>
```

### Transfer ERC721 Tokens

Transfer an ERC721 token to an address:

```typescript
async transferERC721(walletClient: ViemEVMWalletClient, parameters: TransferERC721Parameters): Promise<string>
```

### Mint NFT

Mint an NFT to an address:

```typescript
async mintNFT(walletClient: ViemEVMWalletClient, parameters: MintNFTParameters): Promise<string>
```

## Upcoming Features

- Deposit liquidity to a pool (Ubeswap and Uniswap)
- Create a pool (Ubeswap and Uniswap)
- Withdraw liquidity from a pool (Ubeswap and Uniswap)
- Check current pool liquidity (Ubeswap and Uniswap)
- Fetch token price from Oracles (Chainlink and Redstone)
- Registed phone number on Self protocol
- Trade and perform swap (Ubeswap and Uniswap)
- Wallet Creation
- Sign Transaction

## Goat

<div align="center">
Go out and eat some grass.

[Docs](https://ohmygoat.dev) | [Examples](https://github.com/goat-sdk/goat/tree/main/typescript/examples) | [Discord](https://discord.gg/goat-sdk)</div>

## Goat 🐐

Goat 🐐 (Great Onchain Agent Toolkit) is an open-source library enabling AI agents to interact with blockchain protocols and smart contracts via their own wallets.

---

Feel free to adjust the content to better fit your specific needs or to include additional details about the plugin's capabilities.
