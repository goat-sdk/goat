import { z } from "zod";
/**
 * Token information from the Uniswap token list
 */
export interface TokenInfo {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
}

export interface TokenList {
  name: string;
  timestamp: string;
  version: {
    major: number;
    minor: number;
    patch: number;
  };
  tokens: TokenInfo[];
}

// Cache token list to avoid fetching it multiple times
// Token List: https://tokenlists.org/
let tokenListCache: TokenList | null = null;
const UNISWAP_TOKEN_LIST_URL = 'https://ipfs.io/ipns/tokens.uniswap.org';

/**
 * Fetches the Uniswap token list
 */
export async function fetchTokenList(): Promise<TokenList> {
  if (tokenListCache) {
    return tokenListCache;
  }
  
  try {
    const response = await fetch(UNISWAP_TOKEN_LIST_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch token list: ${response.statusText}`);
    }
    
    const data = await response.json();
    tokenListCache = data as TokenList;
    return tokenListCache;
  } catch (error) {
    console.error('Error fetching token list:', error);
    throw error;
  }
}

// Regular expression for valid Ethereum address
const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/i;


/**
 * Resolves a token identifier (symbol or address) to its address
 * @param tokenId Token symbol or address
 * @param chainId Chain ID
 * @returns The resolved token address
 * @throws Error if token can't be resolved
 */
export async function resolveTokenAddress(tokenId: string, chainId: number): Promise<string> {
  // If tokenId is already a valid address, return it
  if (ETH_ADDRESS_REGEX.test(tokenId)) {
    return tokenId;
  }
  
  // Special case for native ETH
  if (tokenId.toUpperCase() === 'ETH' && [1, 5, 11155111].includes(chainId)) {
    return '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'; // ETH placeholder address
  }
  
  try {
    const tokenList = await fetchTokenList();
     
    const token = tokenList.tokens.find(t => 
      t.chainId === chainId && 
      t.symbol.toUpperCase() === tokenId.toUpperCase()
    );
    
    if (!token) {
      throw new Error(`Token not found: ${tokenId} on chain ${chainId}`);
    }
    
    return token.address;
  } catch (error) {
    console.error('Error resolving token address:', error);
    throw error;
  }
}