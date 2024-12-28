import { zeroDevGlobalAddress } from '@goat-sdk/plugin-zerodev-global-address';
import { optimism } from 'viem/chains';
import { getAddress } from 'viem';

// Define interface for the fee structure
interface TokenFeeData {
    token: string;
    name: string;
    decimal: number;
    minDeposit: string;
    fee: string;
}

interface EstimatedFee {
    chainId: number;
    data: TokenFeeData[];
}

function formatTokenAmount(hexAmount: string, decimals: number): string {
    // Remove '0x' prefix and convert to decimal
    const amount = BigInt(hexAmount);
    // Convert to string with proper decimal places
    const amountStr = amount.toString();
    const padded = amountStr.padStart(decimals + 1, '0');
    const decimalIndex = padded.length - decimals;
    const formattedAmount = `${padded.slice(0, decimalIndex)}.${padded.slice(decimalIndex)}`;
    // Remove trailing zeros and decimal point if necessary
    return formattedAmount.replace(/\.?0+$/, '');
}

async function main() {
    // Initialize the plugin
    const plugin = zeroDevGlobalAddress();
    
    // Get the service from toolProviders
    const service = plugin.toolProviders[0] as any;
    
    // Example configuration
    const config = {
        owner: getAddress('0x228bB8BcbCEc34e5b2E82791D916E577FC6C6C7a'),
        destChain: optimism,
        slippage: 1000 // 1% slippage (in basis points)
    };

    try {
        // Create global address configuration
        const result = await service.createGlobalAddressConfig(config);
        
        console.log('\nGlobal Address:', result.globalAddress);
        console.log('\nEstimated Fees by Chain:');
        result.estimatedFees.forEach((fee: EstimatedFee) => {
            console.log(`\nChain ID ${fee.chainId}:`);
            fee.data.forEach((tokenFee: TokenFeeData) => {
                console.log(`\n${tokenFee.name} (${tokenFee.token}):`);
                console.log(`  Min Deposit: ${formatTokenAmount(tokenFee.minDeposit, tokenFee.decimal)}`);
                console.log(`  Fee: ${formatTokenAmount(tokenFee.fee, tokenFee.decimal)}`);
                console.log(`  Decimals: ${tokenFee.decimal}`);
            });
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

main().catch(console.error);
