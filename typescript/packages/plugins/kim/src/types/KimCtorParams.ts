import { type Address } from "viem";

export type KimContractAddresses = {
    swapRouter: Address;
    quoterV2: Address;
};

export type KimCtorParams = {
    addresses: KimContractAddresses;
};
