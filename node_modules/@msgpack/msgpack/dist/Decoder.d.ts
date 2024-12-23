import { ExtensionCodecType } from "./ExtensionCodec";
import { KeyDecoder } from "./CachedKeyDecoder";
import type { ContextOf } from "./context";
export type DecoderOptions<ContextType = undefined> = Readonly<Partial<{
    extensionCodec: ExtensionCodecType<ContextType>;
    /**
     * Decodes Int64 and Uint64 as bigint if it's set to true.
     * Depends on ES2020's {@link DataView#getBigInt64} and
     * {@link DataView#getBigUint64}.
     *
     * Defaults to false.
     */
    useBigInt64: boolean;
    /**
     * Maximum string length.
     *
     * Defaults to 4_294_967_295 (UINT32_MAX).
     */
    maxStrLength: number;
    /**
     * Maximum binary length.
     *
     * Defaults to 4_294_967_295 (UINT32_MAX).
     */
    maxBinLength: number;
    /**
     * Maximum array length.
     *
     * Defaults to 4_294_967_295 (UINT32_MAX).
     */
    maxArrayLength: number;
    /**
     * Maximum map length.
     *
     * Defaults to 4_294_967_295 (UINT32_MAX).
     */
    maxMapLength: number;
    /**
     * Maximum extension length.
     *
     * Defaults to 4_294_967_295 (UINT32_MAX).
     */
    maxExtLength: number;
    /**
     * An object key decoder. Defaults to the shared instance of {@link CachedKeyDecoder}.
     * `null` is a special value to disable the use of the key decoder at all.
     */
    keyDecoder: KeyDecoder | null;
}>> & ContextOf<ContextType>;
export declare const DataViewIndexOutOfBoundsError: RangeErrorConstructor;
export declare class Decoder<ContextType = undefined> {
    private readonly extensionCodec;
    private readonly context;
    private readonly useBigInt64;
    private readonly maxStrLength;
    private readonly maxBinLength;
    private readonly maxArrayLength;
    private readonly maxMapLength;
    private readonly maxExtLength;
    private readonly keyDecoder;
    private totalPos;
    private pos;
    private view;
    private bytes;
    private headByte;
    private readonly stack;
    constructor(options?: DecoderOptions<ContextType>);
    private reinitializeState;
    private setBuffer;
    private appendBuffer;
    private hasRemaining;
    private createExtraByteError;
    /**
     * @throws {@link DecodeError}
     * @throws {@link RangeError}
     */
    decode(buffer: ArrayLike<number> | BufferSource): unknown;
    decodeMulti(buffer: ArrayLike<number> | BufferSource): Generator<unknown, void, unknown>;
    decodeAsync(stream: AsyncIterable<ArrayLike<number> | BufferSource>): Promise<unknown>;
    decodeArrayStream(stream: AsyncIterable<ArrayLike<number> | BufferSource>): AsyncGenerator<unknown, void, unknown>;
    decodeStream(stream: AsyncIterable<ArrayLike<number> | BufferSource>): AsyncGenerator<unknown, void, unknown>;
    private decodeMultiAsync;
    private doDecodeSync;
    private readHeadByte;
    private complete;
    private readArraySize;
    private pushMapState;
    private pushArrayState;
    private decodeUtf8String;
    private stateIsMapKey;
    private decodeBinary;
    private decodeExtension;
    private lookU8;
    private lookU16;
    private lookU32;
    private readU8;
    private readI8;
    private readU16;
    private readI16;
    private readU32;
    private readI32;
    private readU64;
    private readI64;
    private readU64AsBigInt;
    private readI64AsBigInt;
    private readF32;
    private readF64;
}
