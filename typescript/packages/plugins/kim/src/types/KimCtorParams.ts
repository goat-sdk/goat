import { type Address } from "viem";

export type KimContractAddresses = {
    swapRouter: Address;
    quoterV2: Address;
    factory: Address;
};

export type KimCtorParams = {
    addresses: KimContractAddresses;
};
