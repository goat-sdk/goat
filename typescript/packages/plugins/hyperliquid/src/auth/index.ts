/**
          _____                    _____                    _____                    _____           _______                   _____          
         /\    \                  /\    \                  /\    \                  /\    \         /::\    \                 /\    \         
        /::\    \                /::\    \                /::\    \                /::\____\       /::::\    \               /:::\____\        
       /::::\    \               \:::\    \              /::::\    \              /:::/    /      /::::::\    \             /:::/    /        
      /::::::\    \               \:::\    \            /::::::\    \            /:::/    /      /::::::::\    \           /:::/   _/___      
     /:::/\:::\    \               \:::\    \          /:::/\:::\    \          /:::/    /      /:::/~~\:::\    \         /:::/   /\    \     
    /:::/__\:::\    \               \:::\    \        /:::/__\:::\    \        /:::/    /      /:::/    \:::\    \       /:::/   /::\____\    
   /::::\   \:::\    \              /::::\    \      /::::\   \:::\    \      /:::/    /      /:::/    / \:::\    \     /:::/   /:::/    /    
  /::::::\   \:::\    \    ____    /::::::\    \    /::::::\   \:::\    \    /:::/    /      /:::/____/   \:::\____\   /:::/   /:::/   _/___  
 /:::/\:::\   \:::\    \  /\   \  /:::/\:::\    \  /:::/\:::\   \:::\    \  /:::/    /      |:::|    |     |:::|    | /:::/___/:::/   /\    \ 
/:::/  \:::\   \:::\____\/::\   \/:::/  \:::\____\/:::/  \:::\   \:::\____\/:::/____/       |:::|____|     |:::|    ||:::|   /:::/   /::\____\
\::/    \:::\  /:::/    /\:::\  /:::/    \::/    /\::/    \:::\   \::/    /\:::\    \        \:::\    \   /:::/    / |:::|__/:::/   /:::/    /
 \/____/ \:::\/:::/    /  \:::\/:::/    / \/____/  \/____/ \:::\   \/____/  \:::\    \        \:::\    \ /:::/    /   \:::\/:::/   /:::/    / 
          \::::::/    /    \::::::/    /                    \:::\    \       \:::\    \        \:::\    /:::/    /     \::::::/   /:::/    /  
           \::::/    /      \::::/____/                      \:::\____\       \:::\    \        \:::\__/:::/    /       \::::/___/:::/    /   
           /:::/    /        \:::\    \                       \::/    /        \:::\    \        \::::::::/    /         \:::\__/:::/    /    
          /:::/    /          \:::\    \                       \/____/          \:::\    \        \::::::/    /           \::::::::/    /     
         /:::/    /            \:::\    \                                        \:::\    \        \::::/    /             \::::::/    /      
        /:::/    /              \:::\    \                                        \:::\____\        \::/____/               \::::/    /       
        \::/    /                \:::\____\                                        \::/    /         ~~                      \::/____/        
         \/____/                  \::/    /                                         \/____/                                   ~~              
                                  \/____/                                                                                                     
*/

import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { arbitrum } from 'viem/chains';
import type { Hex } from '../types/common';

/**
 * Create a wallet client for signing messages.
 * @param privateKey Private key in hex format.
 * @returns Wallet client instance.
 */
export function createClient(privateKey: Hex) {
    const account = privateKeyToAccount(privateKey);
    return createWalletClient({
        account,
        chain: arbitrum,
        transport: http()
    });
}

/**
 * Sign a message using EIP-712.
 * @param client Wallet client instance.
 * @param domain EIP-712 domain.
 * @param types EIP-712 types.
 * @param value Message to sign.
 * @returns Signature components (r, s, v).
 */
export async function signTypedData(
    client: ReturnType<typeof createClient>,
    domain: {
        name: string;
        version: string;
        chainId: number;
        verifyingContract: Hex;
    },
    types: Record<string, { name: string; type: string }[]>,
    value: Record<string, unknown>
) {
    const signature = await client.signTypedData({
        domain,
        types,
        primaryType: Object.keys(types)[0],
        message: value
    });

    // Split signature into r, s, v components
    const r = signature.slice(0, 66) as Hex;
    const s = `0x${signature.slice(66, 130)}` as Hex;
    const v = parseInt(signature.slice(130, 132), 16);

    return { r, s, v };
}

/**
 * Sign an order request.
 * @param client Wallet client instance.
 * @param order Order request to sign.
 * @returns Signed order request.
 */
export async function signOrder(
    client: ReturnType<typeof createClient>,
    order: Record<string, unknown>
) {
    const domain = {
        name: 'Hyperliquid',
        version: '1',
        chainId: arbitrum.id,
        verifyingContract: '0x0000000000000000000000000000000000000000' as Hex
    };

    const types = {
        Order: [
            { name: 'action', type: 'string' },
            { name: 'asset', type: 'uint256' },
            { name: 'isBuy', type: 'bool' },
            { name: 'limitPx', type: 'string' },
            { name: 'sz', type: 'string' },
            { name: 'reduceOnly', type: 'bool' },
            { name: 'cloid', type: 'bytes32' },
            { name: 'timestamp', type: 'uint256' }
        ]
    };

    return signTypedData(client, domain, types, order);
}

/**
 * Sign a withdrawal request.
 * @param client Wallet client instance.
 * @param withdrawal Withdrawal request to sign.
 * @returns Signed withdrawal request.
 */
export async function signWithdrawal(
    client: ReturnType<typeof createClient>,
    withdrawal: Record<string, unknown>
) {
    const domain = {
        name: 'Hyperliquid',
        version: '1',
        chainId: arbitrum.id,
        verifyingContract: '0x0000000000000000000000000000000000000000' as Hex
    };

    const types = {
        Withdrawal: [
            { name: 'action', type: 'string' },
            { name: 'amount', type: 'string' },
            { name: 'destination', type: 'address' },
            { name: 'timestamp', type: 'uint256' }
        ]
    };

    return signTypedData(client, domain, types, withdrawal);
}

/**
 * Sign a transfer request.
 * @param client Wallet client instance.
 * @param transfer Transfer request to sign.
 * @returns Signed transfer request.
 */
export async function signTransfer(
    client: ReturnType<typeof createClient>,
    transfer: Record<string, unknown>
) {
    const domain = {
        name: 'Hyperliquid',
        version: '1',
        chainId: arbitrum.id,
        verifyingContract: '0x0000000000000000000000000000000000000000' as Hex
    };

    const types = {
        Transfer: [
            { name: 'action', type: 'string' },
            { name: 'amount', type: 'string' },
            { name: 'destination', type: 'address' },
            { name: 'timestamp', type: 'uint256' }
        ]
    };

    return signTypedData(client, domain, types, transfer);
}
