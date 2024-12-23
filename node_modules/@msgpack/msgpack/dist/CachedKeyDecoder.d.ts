export interface KeyDecoder {
    canBeCached(byteLength: number): boolean;
    decode(bytes: Uint8Array, inputOffset: number, byteLength: number): string;
}
export declare class CachedKeyDecoder implements KeyDecoder {
    readonly maxKeyLength: number;
    readonly maxLengthPerKey: number;
    hit: number;
    miss: number;
    private readonly caches;
    constructor(maxKeyLength?: number, maxLengthPerKey?: number);
    canBeCached(byteLength: number): boolean;
    private find;
    private store;
    decode(bytes: Uint8Array, inputOffset: number, byteLength: number): string;
}
