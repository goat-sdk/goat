import { ethers } from 'ethers';
import { Chain } from '@goat-sdk/core';

/**
 * Message format utilities for Hyperlane cross-chain communication
 */

// Constants for message formatting
export const MESSAGE_CONSTANTS = {
    PREFIX: '0x',
    RECIPIENT_LENGTH: 32,
    AMOUNT_LENGTH: 32,
    MIN_MESSAGE_LENGTH: 64, // recipient + amount minimum
    SUPPORTED_CHAIN_TYPES: ['evm', 'solana', 'cosmos'] as const
} as const;

/**
 * Message format types
 */
export interface FormattedMessage {
    recipient: string;
    amount: string;
    metadata?: string;
    raw: string;
}

/**
 * Chain compatibility interface
 */
interface ChainCompatibility {
    sourceType: typeof MESSAGE_CONSTANTS.SUPPORTED_CHAIN_TYPES[number];
    destinationType: typeof MESSAGE_CONSTANTS.SUPPORTED_CHAIN_TYPES[number];
    isCompatible: boolean;
}

/**
 * Error handling
 */
export class MessageFormatError extends Error {
    constructor(message: string) {
        super(`MessageFormat Error: ${message}`);
        this.name = 'MessageFormatError';
    }
}

/**
 * Utility functions for message formatting
 */
export const MessageFormat = {
    /**
     * Encode a message for cross-chain transfer
     */
    encodeMessage: (
        recipient: string,
        amount: string,
        metadata?: string
    ): string => {
        try {
            // Pad recipient address to 32 bytes
            const paddedRecipient = ethers.utils.hexZeroPad(recipient, 32);
            
            // Convert and pad amount to 32 bytes
            const paddedAmount = ethers.utils.hexZeroPad(
                ethers.utils.hexlify(amount),
                32
            );

            // Combine components
            return ethers.utils.hexConcat([
                paddedRecipient,
                paddedAmount,
                metadata || '0x'
            ]);
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new MessageFormatError(`Failed to encode message: ${error.message}`);
            }
            throw new MessageFormatError('Failed to encode message: Unknown error');
        }
    },

    /**
     * Decode a formatted message
     */
    decodeMessage: (message: string): FormattedMessage => {
        try {
            if (!message.startsWith('0x')) {
                throw new Error('Invalid message format: must start with 0x');
            }

            const raw = message;
            const recipient = ethers.utils.hexDataSlice(
                message,
                0,
                MESSAGE_CONSTANTS.RECIPIENT_LENGTH
            );
            const amount = ethers.utils.hexDataSlice(
                message,
                MESSAGE_CONSTANTS.RECIPIENT_LENGTH,
                MESSAGE_CONSTANTS.RECIPIENT_LENGTH + MESSAGE_CONSTANTS.AMOUNT_LENGTH
            );
            const metadata = message.length > MESSAGE_CONSTANTS.MIN_MESSAGE_LENGTH * 2 + 2
                ? ethers.utils.hexDataSlice(
                    message,
                    MESSAGE_CONSTANTS.RECIPIENT_LENGTH + MESSAGE_CONSTANTS.AMOUNT_LENGTH
                )
                : undefined;

            return {
                recipient,
                amount: ethers.BigNumber.from(amount).toString(),
                metadata,
                raw
            };
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new MessageFormatError(`Failed to decode message: ${error.message}`);
            }
            throw new MessageFormatError('Failed to decode message: Unknown error');
        }
    },

    /**
     * Get chain compatibility matrix
     */
    getChainCompatibility: (source: Chain, destination: Chain): ChainCompatibility => {
        return {
            sourceType: source.type as typeof MESSAGE_CONSTANTS.SUPPORTED_CHAIN_TYPES[number],
            destinationType: destination.type as typeof MESSAGE_CONSTANTS.SUPPORTED_CHAIN_TYPES[number],
            isCompatible: MESSAGE_CONSTANTS.SUPPORTED_CHAIN_TYPES.includes(source.type as any) &&
                         MESSAGE_CONSTANTS.SUPPORTED_CHAIN_TYPES.includes(destination.type as any)
        };
    },

    /**
     * Format gas payment data
     */
    formatGasPayment: (
        destinationChainId: number,
        gasAmount: string
    ): string => {
        try {
            return ethers.utils.defaultAbiCoder.encode(
                ['uint32', 'uint256'],
                [destinationChainId, gasAmount]
            );
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new MessageFormatError(`Failed to format gas payment: ${error.message}`);
            }
            throw new MessageFormatError('Failed to format gas payment: Unknown error');
        }
    },

    /**
     * Generate message identifier
     */
    generateMessageId: (
        sourceChainId: number,
        destinationChainId: number,
        sender: string,
        recipient: string,
        message: string
    ): string => {
        try {
            return ethers.utils.keccak256(
                ethers.utils.defaultAbiCoder.encode(
                    ['uint32', 'uint32', 'address', 'address', 'bytes'],
                    [sourceChainId, destinationChainId, sender, recipient, message]
                )
            );
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new MessageFormatError(`Failed to generate message ID: ${error.message}`);
            }
            throw new MessageFormatError('Failed to generate message ID: Unknown error');
        }
    },

    /**
     * Validate message format
     */
    validateMessage: (message: string): boolean => {
        try {
            if (!message.startsWith(MESSAGE_CONSTANTS.PREFIX)) {
                return false;
            }
            const decoded = MessageFormat.decodeMessage(message);
            return decoded.recipient.length === 42 && decoded.amount.length > 0;
        } catch {
            return false;
        }
    }
};

export default MessageFormat;