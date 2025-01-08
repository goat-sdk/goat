export type BitcoinTransaction = {
    to: string;
    amount: number; // Amount in satoshis
    feeRate?: number; // Optional fee rate in satoshis/byte
};

export type BitcoinQuery = {
    address?: string;
    txId?: string;
};

export type BitcoinTransactionResponse = {
    txId: string;
    hex: string;
};
