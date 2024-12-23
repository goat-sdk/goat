import { parseAbi } from "viem";

export const MODE_TOKEN_ABI = parseAbi([
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)",
]);

export const VOTING_ESCROW_ABI = parseAbi([
    "function create_lock(uint256 amount, uint256 unlock_time) external returns (uint256)",
    "function increase_amount(uint256 tokenId, uint256 amount) external",
    "function increase_unlock_time(uint256 tokenId, uint256 unlock_time) external",
    "function withdraw(uint256 tokenId) external",
    "function balanceOfNFT(uint256 tokenId) external view returns (uint256)",
    "function locked(uint256 tokenId) external view returns (int128 amount, uint256 end)",
]);

export const VENFT_LOCK_ABI = parseAbi([
    "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)",
    "function balanceOf(address owner) external view returns (uint256)",
]);

export const EXIT_QUEUE_ABI = parseAbi([
    "function cooldowns(uint256 tokenId) external view returns (uint256)",
    "function warmups(uint256 tokenId) external view returns (uint256)",
    "function MIN_COOLDOWN() external view returns (uint256)",
    "function MIN_WARMUP() external view returns (uint256)",
]);

export const CLOCK_ABI = parseAbi([
    "function epoch() external view returns (uint256)",
    "function EPOCH_INTERVAL() external view returns (uint256)",
]);
