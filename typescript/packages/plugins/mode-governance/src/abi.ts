import { parseAbi } from "viem";

export const VOTING_ESCROW_ABI = parseAbi([
    "function stake(uint256 amount) external",
    "function unstake(uint256 amount) external",
    "function balanceOf(address account) external view returns (uint256)",
    "function getWarmupPeriod() external view returns (uint256)",
    "function getCooldownPeriod() external view returns (uint256)",
    "function getUserStakeInfo(address user) external view returns (uint256 stakedAmount, uint256 warmupEndTime, uint256 cooldownEndTime)",
]);

export const MODE_TOKEN_ABI = parseAbi([
    "function balanceOf(address account) external view returns (uint256)",
    "function approve(address spender, uint256 amount) external returns (bool)",
]);

export const BPT_TOKEN_ABI = parseAbi([
    "function balanceOf(address account) external view returns (uint256)",
    "function approve(address spender, uint256 amount) external returns (bool)",
]); 