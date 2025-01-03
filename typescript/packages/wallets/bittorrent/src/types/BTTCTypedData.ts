import type { TypedDataDomain } from "abitype";

export type BTTCTypedData = {
    domain: TypedDataDomain;
    types: Record<string, unknown>;
    primaryType: string;
    message: Record<string, unknown>;
};
