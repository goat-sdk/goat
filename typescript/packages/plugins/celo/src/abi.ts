import { parseAbi } from "viem";

export const ERC20_ABI = parseAbi([
    "function transfer(address to, uint256 amount) external returns (bool)",
    "function balanceOf(address account) external view returns (uint256)",
    "function totalSupply() external view returns (uint256)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
]);

export const ERC721_ABI = parseAbi([
    // Transfer functions
    "function transferFrom(address from, address to, uint256 tokenId) external",
    "function safeMint(address to) external",
    "function safeTransferFrom(address from, address to, uint256 tokenId) external",
    "function safeTransferFrom(address from, address to, uint256 tokenId, bytes data) external",

    // Approval functions
    "function approve(address to, uint256 tokenId) external",
    "function setApprovalForAll(address operator, bool approved) external",
    "function getApproved(uint256 tokenId) external view returns (address)",
    "function isApprovedForAll(address owner, address operator) external view returns (bool)",

    // View functions
    "function balanceOf(address owner) external view returns (uint256)",
    "function ownerOf(uint256 tokenId) external view returns (address)",
    "function tokensOfOwner(address owner) external view returns (uint256[])",
]);

export const ERC20_CONSTRUCTOR_ABI = parseAbi([
    "constructor(string name, string symbol, uint256 totalSupply, address owner, uint8 decimals)",
]);

export const ERC721_CONSTRUCTOR_ABI = parseAbi([
    "constructor(string name, string symbol, uint256 maxSupply, address initialOwner)",
]);
