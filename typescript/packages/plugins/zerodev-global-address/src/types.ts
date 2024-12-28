import { type Chain } from 'viem/chains'
import { type Address } from 'viem'
import { CALL } from '@zerodev/global-address'

export type TokenType = 'ERC20' | 'NATIVE' | 'USDC' | 'WRAPPED_NATIVE';

export interface TokenConfig {
  tokenType: TokenType;
  chain: Chain;
}

export interface GlobalAddressConfig {
  owner?: Address;
  destChain?: Chain;
  slippage?: number;
}

export interface GlobalAddressResponse {
  globalAddress: Address;
  estimatedFees: bigint[];
}

export interface ActionConfig {
  action: CALL[];
  fallBack: CALL[];
}

export interface TokenActions {
  ERC20: ActionConfig;
  NATIVE: ActionConfig;
  USDC: ActionConfig;
  WRAPPED_NATIVE: ActionConfig;
}