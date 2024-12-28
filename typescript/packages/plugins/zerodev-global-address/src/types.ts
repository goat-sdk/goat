import { type Chain } from '@goat-sdk/core'
import { type Address } from 'viem'
import { arbitrum, base, mainnet, optimism, polygon, mode, scroll } from 'viem/chains'
import { CALL } from '@zerodev/global-address'

export type TokenType = 'ERC20' | 'NATIVE' | 'USDC';

export interface TokenConfig {
  tokenType: TokenType;
  chain: typeof mainnet | typeof optimism | typeof arbitrum | typeof base | typeof polygon | typeof mode | typeof scroll;
}

export interface GlobalAddressConfig {
  owner?: Address;
  destChain?: typeof mainnet | typeof optimism | typeof arbitrum | typeof base | typeof polygon | typeof mode | typeof scroll;
  slippage?: number;
}

export interface GlobalAddressResponse {
  globalAddress: Address
  estimatedFees: bigint
}

export interface ActionConfig {
  action: CALL[]
  fallBack: CALL[]
}

export interface TokenActions {
  ERC20: ActionConfig
  NATIVE: ActionConfig
  USDC: ActionConfig
  WRAPPED_NATIVE: ActionConfig
}