import { Balance, Signature } from "@goat-sdk/core";
import * as bitcoin from "bitcoinjs-lib";
import type { Signer } from "bitcoinjs-lib";
import { ECPairFactory, ECPairInterface } from "ecpair";
import * as ecc from "tiny-secp256k1";
import { BitcoinWalletClient } from "./BitcoinWalletClient";
import { BlockCypherService } from "./blockcypher.service";
import type { BitcoinQuery, BitcoinTransaction, BitcoinTransactionResponse } from "./types";

const ECPair = ECPairFactory(ecc);

export class BitcoinKeyPairWalletClient extends BitcoinWalletClient {
    private keyPair: ECPairInterface & Signer;
    private network: bitcoin.Network;
    private blockCypherService: BlockCypherService;

    /**
     * Creates a new BitcoinKeyPairWalletClient instance
     * @param keyPair - The ECPair instance for signing transactions
     * @param network - Bitcoin network configuration (default: bitcoin.networks.bitcoin for mainnet)
     *                 Use bitcoin.networks.testnet for testnet
     */
    constructor(keyPair: ECPairInterface, network: bitcoin.Network = bitcoin.networks.bitcoin) {
        super();
        // Ensure keyPair implements Signer interface
        this.keyPair = {
            ...keyPair,
            sign(hash: Buffer): Buffer {
                return keyPair.sign(hash);
            },
            publicKey: keyPair.publicKey,
        };
        this.network = network;

        // Configure BlockCypher service based on network
        const networkType = network === bitcoin.networks.bitcoin ? "main" : "test";
        this.blockCypherService = new BlockCypherService(networkType);

        // Validate network configuration
        if (network !== bitcoin.networks.bitcoin && network !== bitcoin.networks.testnet) {
            throw new Error("Unsupported Bitcoin network. Use bitcoin.networks.bitcoin or bitcoin.networks.testnet");
        }
    }

    getAddress(): string {
        const { address } = bitcoin.payments.p2pkh({
            pubkey: Buffer.from(this.keyPair.publicKey),
            network: this.network,
        });
        if (!address) throw new Error("Cannot derive Bitcoin address");
        return address;
    }

    async signMessage(message: string): Promise<Signature> {
        const messageHash = bitcoin.crypto.sha256(Buffer.from(message));
        const privateKey = this.keyPair.privateKey;
        if (!privateKey) throw new Error("Missing private key");

        const signature = this.keyPair.sign(messageHash);
        return {
            signature: Buffer.from(signature).toString("hex"),
        };
    }

    async balanceOf(address: string): Promise<Balance> {
        const satoshis = await this.blockCypherService.getBalance(address);
        return {
            decimals: 8,
            symbol: "BTC",
            name: "Bitcoin",
            value: (satoshis / 1e8).toString(),
            inBaseUnits: satoshis.toString(),
        };
    }

    async sendTransaction(transaction: BitcoinTransaction): Promise<BitcoinTransactionResponse> {
        const address = this.getAddress();
        const utxos = await this.blockCypherService.getUTXOs(address);

        if (utxos.length === 0) {
            throw new Error("No UTXOs available for spending");
        }

        const feeRate = transaction.feeRate || (await this.blockCypherService.getFeeRate());
        const psbt = new bitcoin.Psbt({ network: this.network });

        // Add inputs
        let totalInput = 0;
        for (const utxo of utxos) {
            const prevOutScript = bitcoin.address.toOutputScript(this.getAddress(), this.network);
            psbt.addInput({
                hash: utxo.txid,
                index: utxo.vout,
                nonWitnessUtxo: Buffer.from(utxo.script, "hex"),
                witnessUtxo: {
                    script: prevOutScript,
                    value: utxo.value,
                },
            });
            totalInput += utxo.value;
        }

        // Calculate fee (assuming P2PKH, ~180 bytes per tx)
        const estimatedSize = 180;
        const fee = estimatedSize * feeRate;

        // Verify we have enough funds
        if (totalInput < transaction.amount + fee) {
            throw new Error("Insufficient funds including fee");
        }

        // Add outputs
        psbt.addOutput({
            address: transaction.to,
            value: transaction.amount,
        });

        // Add change output if needed
        const change = totalInput - transaction.amount - fee;
        if (change > 0) {
            psbt.addOutput({
                address: address, // Send change back to sender
                value: change,
            });
        }

        // Sign all inputs
        psbt.signAllInputs(this.keyPair);
        psbt.finalizeAllInputs();

        // Extract transaction
        const tx = psbt.extractTransaction();
        const txHex = tx.toHex();

        // Broadcast
        const txId = await this.blockCypherService.broadcastTransaction(txHex);

        return {
            txId,
            hex: txHex,
        };
    }

    async read(query: BitcoinQuery): Promise<Balance | BitcoinTransactionResponse> {
        if (query.address) {
            return this.balanceOf(query.address);
        }
        if (query.txId) {
            const txData = await this.blockCypherService.getTransaction(query.txId);
            return {
                txId: query.txId,
                hex: txData.hex,
            };
        }
        throw new Error("Invalid query parameters");
    }

    // Utility method to create a new wallet
    static createWallet(network: bitcoin.Network = bitcoin.networks.bitcoin): BitcoinKeyPairWalletClient {
        const keyPair = ECPair.makeRandom({ network });
        return new BitcoinKeyPairWalletClient(keyPair, network);
    }
}
