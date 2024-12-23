export const STEER_POOL_ABI = [
    "function deposit(uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min, address to) external returns (uint256 shares)",
    "function withdraw(uint256 shares, uint256 amount0Min, uint256 amount1Min, address to) external returns (uint256 amount0, uint256 amount1)",
    "function balanceOf(address account) external view returns (uint256)",
    "function totalSupply() external view returns (uint256)",
    "function getVaultBalances() external view returns (uint256 amount0, uint256 amount1)",
];
