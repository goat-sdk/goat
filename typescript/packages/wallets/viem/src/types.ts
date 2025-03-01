import { Abi } from "viem";

export type DeployContractType = {
    bytecode: `0x${string}`;
    abi: Abi;
    args: unknown[];
};
