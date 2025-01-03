import { Balance, Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { ZilliqaWalletClient } from "@goat-sdk/wallet-zilliqa";
import { fromBech32Address, toBech32Address, toChecksumAddress } from "@zilliqa-js/crypto";
import { BN, Long, units as ZilliqaUnits, validation as ZilliqaValidation } from "@zilliqa-js/util";
import { Zilliqa } from "@zilliqa-js/zilliqa";
import * as viem from "viem";
import { AddressParameters, SayHelloParameters, TransferParameters } from "./parameters";
import { ZilliqaPluginParams } from "./types";

export type ZilliqaBalanceExtraFields = {
    nonce: string;
    comment: string | null;
};

export type ZilliqaBalance = Balance & ZilliqaBalanceExtraFields;

// Some of these action names are unnecessarily long - this is because
// eliza does some fancy partial matching when selecting an action
// name; if we don't name them very explicitly, the EVM names get
// picked even when the controlling intelligence is trying to run the
// Zilliqa functions and we end up with unexpected errors at the agent
// level.
export class ZilliqaService {
    @Tool({
        description: "Converts addresses from hex to bech32 format",
    })
    async convertToBech32(zilliqa: ZilliqaWalletClient, address: AddressParameters): Promise<string> {
        return toBech32Address(address.address);
    }

    @Tool({
        description: "Converts addresses from bech32 to hex format",
    })
    async convertFromBech32(zilliqa: ZilliqaWalletClient, address: AddressParameters): Promise<string> {
        return fromBech32Address(address.address);
    }

    @Tool({
        description:
            "Transfers ZIL from an EVM address to another EVM or Zilliqa address, in either hex or bech32 format. Never use any other transfer functions when transferring funds from an EVM address",
    })
    async transferFromEvmAddress(
        zilliqa: ZilliqaWalletClient,
        transferParameters: TransferParameters,
    ): Promise<string> {
        try {
            const hexToAddress = ZilliqaValidation.isBech32(transferParameters.toAddress)
                ? fromBech32Address(transferParameters.toAddress)
                : transferParameters.toAddress;
            const summed = viem.getAddress(hexToAddress);
            const amount = viem.parseEther(transferParameters.amount);
            const tx = await zilliqa.viem.sendTransaction({
                to: summed,
                value: amount,
            });
            return tx.hash;
        } catch (error) {
            throw new Error(`Failed to send ZIL: ${error}`);
        }
    }

    @Tool({
        description:
            "Transfers ZIL from a Zilliqa address to another EVM or Zilliqa address, in either hex or bech32 format. Never use any other transfer function when transferring fgunds from a Zilliqa address",
    })
    async transferFromZilliqaAddress(
        zilliqa: ZilliqaWalletClient,
        transferParameters: TransferParameters,
    ): Promise<string> {
        // Make sure the toaddress is formatted correctly.
        const hexToAddress = ZilliqaValidation.isBech32(transferParameters.toAddress)
            ? fromBech32Address(transferParameters.toAddress)
            : transferParameters.toAddress;
        const summed = toChecksumAddress(hexToAddress);
        const api = zilliqa.getZilliqa();
        const chainId = zilliqa.getZilliqaChainId();
        const version = (chainId << 16) | 1;
        try {
            // Transfer costs are fixed for the Zilliqa native API - and gas estimation in Zilliqa native is
            // in any case something of a black art.
            // TODO: Programmable gas fees and limits.
            const tx = await api.blockchain.createTransaction(
                api.transactions.new({
                    toAddr: summed,
                    amount: ZilliqaUnits.toQa(transferParameters.amount, ZilliqaUnits.Units.Zil),
                    gasPrice: new BN("2000000000"),
                    gasLimit: new Long(50),
                    version: version,
                }),
            );
            if (tx.isConfirmed()) {
                return `the transfer succeeded with transaction id ${tx.id}`;
            }
            if (tx.isRejected()) {
                return "the transfer failed and no ZIL was transferred";
            }
            return "the transfer timed out and probably did not succeed";
        } catch (e) {
            throw new Error(`an error occurred and the transfer probably did not succeed - ${e}`);
        }
    }

    @Tool({
        description:
            "Returns the balance of a bech32 address. A bech32 address starts with 'zil'. Can also return the balance of an ethereum address or EVM address which start with 0x",
    })
    async getZilliqaAddressBalance(
        zilliqa: ZilliqaWalletClient,
        address: AddressParameters,
    ): Promise<ZilliqaBalance | string> {
        const result = await zilliqa.getZilliqa().blockchain.getBalance(address.address);
        let value = "0";
        let nonce = "0";
        let comment = null;

        if (result?.error) {
            if (result.error?.code === -5) {
                // Just continue - account not created; the defaults are correct.
                comment = "This account has not yet been created so its balance is 0";
            } else {
                return `An error occurred - ${result.error?.message}`;
            }
        } else {
            const innerResult = result?.result;
            value = innerResult?.balance;
            nonce = innerResult?.nonce;
        }
        const bal: ZilliqaBalance = {
            value: ZilliqaUnits.fromQa(new BN(value), ZilliqaUnits.Units.Zil),
            decimals: 12,
            symbol: "ZIL",
            name: "Zil",
            inBaseUnits: value,
            nonce: nonce,
            comment: comment,
        };
        return bal;
    }
}
