import axios from "axios";

const BLOCKCYPHER_API_BASE = "https://api.blockcypher.com/v1";

export interface UTXO {
    txid: string;
    vout: number;
    value: number;
    script: string;
    confirmations: number;
}

export interface BlockCypherUTXOResponse {
    txrefs: Array<{
        tx_hash: string;
        tx_output_n: number;
        value: number;
        script: string;
        confirmations: number;
    }>;
}

export interface BlockCypherBroadcastResponse {
    tx: {
        hash: string;
    };
}

export class BlockCypherService {
    private readonly network: string;

    constructor(network: "main" | "test" = "main") {
        this.network = network === "main" ? "btc/main" : "btc/test3";
    }

    async getUTXOs(address: string): Promise<UTXO[]> {
        const response = await axios.get<BlockCypherUTXOResponse>(
            `${BLOCKCYPHER_API_BASE}/${this.network}/addrs/${address}?unspentOnly=true`,
        );

        return response.data.txrefs.map((utxo) => ({
            txid: utxo.tx_hash,
            vout: utxo.tx_output_n,
            value: utxo.value,
            script: utxo.script,
            confirmations: utxo.confirmations,
        }));
    }

    async broadcastTransaction(rawTransaction: string): Promise<string> {
        const response = await axios.post<BlockCypherBroadcastResponse>(
            `${BLOCKCYPHER_API_BASE}/${this.network}/txs/push`,
            { tx: rawTransaction },
        );

        return response.data.tx.hash;
    }

    async getBalance(address: string): Promise<number> {
        const utxos = await this.getUTXOs(address);
        return utxos.reduce((sum, utxo) => sum + utxo.value, 0);
    }

    async getFeeRate(): Promise<number> {
        const response = await axios.get(`${BLOCKCYPHER_API_BASE}/${this.network}`);
        // Convert from BTC/kb to satoshis/byte
        return Math.ceil((response.data.high_fee_per_kb || 100000) / 1000);
    }

    async getTransaction(txId: string): Promise<{ hex: string }> {
        const response = await axios.get(`${BLOCKCYPHER_API_BASE}/${this.network}/txs/${txId}?includeHex=true`);

        if (!response.data.hex) {
            throw new Error("Transaction hex not available");
        }

        return {
            hex: response.data.hex,
        };
    }
}
