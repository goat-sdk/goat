

```markdown
# `@goat-sdk/plugin-ionic`

This plugin enables AI agents to interact with the Ionic Protocol's lending markets through the GOAT SDK. It provides functionalities for supplying and borrowing assets, as well as monitoring position health.

## Features

*   **Integration with Ionic Protocol:** Seamless interaction with Ionic lending pools using the `@ionicprotocol/sdk` (implicitly via viem).
*   **Key Lending Functions:**
    *   `supplyAsset`: Supply assets to lending pools.
    *   `getHealthMetrics`: Monitor health metrics and liquidation risks.
*   **Type Safety:** Utilizes `zod` schemas for enhanced type safety and validation.
*   **EVM Chain Support:** Supports interaction across EVM-compatible chains.
*   **Configurable:** Supports customization for chains and tokens.



### Configuration

To use the plugin, you need to configure it with the chain ID and the supported tokens. You should initialize it after your wallet client.

```typescript
import { ionicPlugin } from "@goat-sdk/plugin-ionic";
import { createWalletClient, custom } from 'viem';
import { mainnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts'
import { EVMWalletClient } from '@goat-sdk/wallet-evm';
import { Goat } from "@goat-sdk/core";

const account = privateKeyToAccount('0x...'); // Replace with your private key
const transport = custom(window.ethereum) // Use appropriate transport here, like window.ethereum or an RPC URL

const walletClient = createWalletClient({
    account,
    chain: mainnet,
    transport
})


const goat = new Goat({
    plugins: [
        ionicPlugin()
    ],
    walletClient: new EVMWalletClient(walletClient)
})


const ionic = goat.getPlugin("ionic")

```

### Usage

Here are examples of how to use the plugin's functions:

#### Supply Asset

```typescript
async function supplyAssetExample() {
    try {
        await ionic.supplyAsset({
            poolId: "0x...",  // Replace with the actual pool address
            asset: "0x...",  // Replace with the actual asset address
            amount: "1000000",
        });
    
        console.log("Asset supplied successfully!");
    } catch (error) {
        console.error("Failed to supply asset:", error);
    }
}
supplyAssetExample()
```

#### Get Health Metrics

```typescript
async function getHealthMetricsExample() {
    try {
        const metrics = await ionic.getHealthMetrics({
            poolId: "0x...", // Replace with the actual pool address
        });
        console.log("Health Metrics:", metrics);
    } catch (error) {
        console.error("Failed to get health metrics:", error);
    }
}

getHealthMetricsExample()
```

## Plugin Structure

The plugin is structured as follows:

*   `ionic.plugin.ts`: The main entry point, defines the plugin and manages the service.
*   `ionic.service.ts`: Contains the core logic for interacting with the Ionic Protocol.
*   `abi.ts`: Includes the ABI used for interacting with the smart contracts of Ionic Protocol
*   `types.ts`: Defines the required types.

## API

### `IonicPlugin`

The main plugin class which adds `IonicService` to the GOAT SDK.
*   `constructor()`:  Initializes the plugin.
*   `supportsChain(chain: Chain)`: Method to check for support for EVM chains.

### `IonicService`

The service that provides interaction with Ionic Protocol.

*   `supplyAsset(walletClient: EVMWalletClient, parameters: { poolId: string; asset: string; amount: string })`:  Supplies an asset to the specified Ionic pool.
*   `getHealthMetrics(walletClient: EVMWalletClient, parameters: { poolId: string }): Promise<HealthMetrics>`: Fetches the health metrics of the specified Ionic pool.

### Types

#### `HealthMetrics`
```typescript
interface HealthMetrics {
    ltv: number;
    liquidationRisk: 'LOW' | 'MEDIUM' | 'HIGH';
    assetPerformance: Record<string, any>;
}
```

### ABI

#### `COMPTROLLER_ABI`
This is the ABI used for interacting with the ionic protocol smart contracts. The specific functions used by this plugin are `getAccountLiquidity` and `supply`.

## Dependencies

This plugin depends on the following packages:

*   `@goat-sdk/core`: The core GOAT SDK library.
*   `@goat-sdk/wallet-evm`: The EVM wallet client library.
*   `viem`: A library for interacting with Ethereum.
*   `zod`: A schema declaration and validation library.

## Development

### Building
To build the plugin, run:
```bash
pnpm run build
```

