import { parseAbi } from "viem";

export const STAKING_V3_ABI = parseAbi([
    "function balanceOf(address account) external view returns (uint256)",
    "function totalSupply() external view returns (uint256)",
    "function locked(address, bytes32) external view returns (uint256)",
    "function lockedAt(address, bytes32) external view returns (uint256)",
]);
