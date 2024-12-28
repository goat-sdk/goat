import {
  createGlobalAddress,
  createCall,
  FLEX,
  CreateGlobalAddressParams,
} from '@zerodev/global-address'
import {  erc20Abi, getAddress, type Address } from 'viem'
import { base, arbitrum, mainnet, optimism, scroll, mode } from 'viem/chains'
import { Tool } from "@goat-sdk/core"
import { TokenConfig, GlobalAddressConfig, GlobalAddressResponse, TokenActions } from './types'

export class ZeroDevGlobalAddressService {
  constructor(
    private readonly defaultOwner: Address = getAddress('0x228bB8BcbCEc34e5B2E82791D916E577FC6C6C7a'),
    private readonly defaultSlippage: number = 5000
  ) {}

  
  async createGlobalAddressConfig(
    config: GlobalAddressConfig = {}
  ): Promise<GlobalAddressResponse> {
    const { owner = this.defaultOwner, destChain = optimism, slippage = this.defaultSlippage } = config
    const allSrcTokens = this.getSourceTokens()
    const srcTokens = allSrcTokens.filter(token => token.chain.id !== destChain.id)

    const actions = this.createActionConfig(owner)

    const { globalAddress, estimatedFees } = await createGlobalAddress({
      destChain,
      owner,
      slippage,
      actions,
      srcTokens,
    })

    return {
      globalAddress,
      estimatedFees,
    }
  }

  // Helper methods made private
  private getSourceTokens(): TokenConfig[] {
    return [
        // Ethereum Mainnet
        { tokenType: 'NATIVE', chain: mainnet },  // ETH
        { tokenType: 'ERC20', chain: mainnet },   // USDC

        // Base
        { tokenType: 'NATIVE', chain: base },     // ETH
        { tokenType: 'ERC20', chain: base },      // WETH

        // Optimism
        { tokenType: 'NATIVE', chain: optimism }, // ETH
        { tokenType: 'ERC20', chain: optimism },  // DAI

        // Arbitrum
        { tokenType: 'NATIVE', chain: arbitrum }, // ETH
        { tokenType: 'ERC20', chain: arbitrum },  // DAI

        // Scroll
        { tokenType: 'NATIVE', chain: scroll },   // ETH
        { tokenType: 'ERC20', chain: scroll },    // WETH

        // Mode
        { tokenType: 'NATIVE', chain: mode },     // ETH
        { tokenType: 'ERC20', chain: mode }       // WETH
    ];
  }

  private createERC20TransferCall(owner: Address) {
    return createCall({
      target: FLEX.TOKEN_ADDRESS,
      value: 0n,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [owner, FLEX.AMOUNT],
    })
  }

  private createNativeTransferCall(owner: Address) {
    return createCall({
      target: owner,
      value: FLEX.NATIVE_AMOUNT,
    })
  }

  private createActionConfig(owner: Address): TokenActions {
    return {
      ERC20: {
        action: [this.createERC20TransferCall(owner)],
        fallBack: [],
      },
      NATIVE: {
        action: [this.createNativeTransferCall(owner)],
        fallBack: [],
      },
      USDC: {
        action: [this.createERC20TransferCall(owner)],
        fallBack: [],
      },
      WRAPPED_NATIVE: {
        action: [this.createERC20TransferCall(owner)],
        fallBack: [],
      }
    }
  }
}

// Example usage


