/**
 * OWS (Open Wallet Standard) wallet adapter for GOAT SDK.
 *
 * Loads signing keys from an OWS encrypted vault instead of
 * plaintext env vars. Supports both EVM and Solana chains.
 *
 * @example
 * ```ts
 * import { owsEvm } from "@goat-sdk/wallet-ows";
 * import { viem } from "@goat-sdk/wallet-viem";
 *
 * // Before: plaintext key
 * const wallet = viem(walletClient);
 *
 * // After: key from OWS vault
 * const account = owsEvm("my-wallet");
 * const wallet = viem(createWalletClient({ account, ... }));
 * ```
 */

import { privateKeyToAccount } from "viem/accounts";
import type { Account } from "viem";

/**
 * Load an EVM account from an OWS encrypted vault.
 */
export function owsEvm(walletNameOrId: string): Account {
  const { exportWallet } = require("@open-wallet-standard/core") as {
    exportWallet: (nameOrId: string) => string;
  };

  const exported = exportWallet(walletNameOrId);
  let privateKey: `0x${string}`;

  try {
    const keys = JSON.parse(exported);
    const hex = keys.secp256k1 ?? "";
    privateKey = (hex.startsWith("0x") ? hex : `0x${hex}`) as `0x${string}`;
  } catch {
    const { deriveAddress } = require("@open-wallet-standard/core") as {
      deriveAddress: (mnemonic: string, chain: string) => { private_key?: string; privateKey?: string };
    };
    const info = deriveAddress(exported, "evm");
    const hex = info.private_key ?? info.privateKey ?? "";
    privateKey = (hex.startsWith("0x") ? hex : `0x${hex}`) as `0x${string}`;
  }

  return privateKeyToAccount(privateKey);
}

/**
 * Load a Solana keypair from an OWS encrypted vault.
 */
export function owsSolana(walletNameOrId: string): Uint8Array {
  const { exportWallet } = require("@open-wallet-standard/core") as {
    exportWallet: (nameOrId: string) => string;
  };

  const exported = exportWallet(walletNameOrId);

  try {
    const keys = JSON.parse(exported);
    const hex = keys.ed25519 ?? "";
    const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
    return Uint8Array.from(clean.match(/.{2}/g)!.map((b: string) => parseInt(b, 16)));
  } catch {
    throw new Error("OWS mnemonic wallets not yet supported for Solana in GOAT. Use an imported key wallet.");
  }
}
