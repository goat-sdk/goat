import { createToolParameters } from "@goat-sdk/core";
// import { TdxQuoteHashAlgorithms } from "@phala/dstack-sdk";
import { z } from "zod";

type TdxQuoteHashAlgorithms =
  'sha256' | 'sha384' | 'sha512' | 'sha3-256' | 'sha3-384' | 'sha3-512' |
  'keccak256' | 'keccak384' | 'keccak512' | 'raw'

export class GetDerivedKeyParameters extends createToolParameters(
    z.object({
        path: z.string().describe("The path to derive the key from"),
        subject: z.string().describe("The subject to derive the key for"),
        altNames: z.array(z.string()).optional().describe("The alternative names to derive the key for"),
    }),
) {}

export class GetRemoteAttestationParameters extends createToolParameters(
    z.object({
        reportData: z
            .union([z.string(), z.instanceof(Buffer), z.instanceof(Uint8Array)])
            .describe("The report data to generate the attestation for"),
        hashAlgorithm: z.enum(['sha256', 'sha384', 'sha512', 'sha3-256', 'sha3-384', 'sha3-512', 'keccak256', 'keccak384', 'keccak512', 'raw']).optional().describe("The hash algorithm to use for the attestation"),
    }),
) {}