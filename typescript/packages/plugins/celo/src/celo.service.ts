import { Tool } from "@goat-sdk/core";
import { ERC20_ABI, ERC20_CONSTRUCTOR_ABI, ERC721_ABI, ERC721_CONSTRUCTOR_ABI } from "./abi";

import { ERC20_BYTECODE, ERC721_BYTECODE } from "./constant";
import {
    ApproveParameters,
    ConvertFromBaseUnitParameters,
    ConvertToBaseUnitParameters,
    DeployERC20Parameters,
    DeployERC721Parameters,
    GetERC721BalanceParameters,
    GetTokenAllowanceParameters,
    GetTokenBalanceParameters,
    GetTokenIdsParameters,
    GetTokenInfoBySymbolParameters,
    GetTokenTotalSupplyParameters,
    MintNFTParameters,
    RevokeApprovalParameters,
    TransferERC721Parameters,
    TransferFromParameters,
    TransferParameters,
} from "./parameters";
import { Token } from "./token";

import { ViemEVMWalletClient } from "@goat-sdk/wallet-viem";
export class CeloService {
    private tokens: Token[];

    constructor({ tokens }: { tokens?: Token[] } = {}) {
        this.tokens = tokens ?? [];
    }

    @Tool({
        description: "Deploys a standard ERC20 contract on the Celo blockchain. Returns the transaction hash.",
    })
    async deployERC20(walletClient: ViemEVMWalletClient, parameters: DeployERC20Parameters) {
        const txHash = await walletClient.deployContract({
            abi: ERC20_CONSTRUCTOR_ABI,
            args: [
                parameters.tokenName,
                parameters.tokenSymbol,
                BigInt(parameters.totalSupply),
                walletClient.getAddress(),
                BigInt(parameters.decimalUnits),
            ],
            bytecode: ERC20_BYTECODE as `0x${string}`,
        });
        return txHash.hash;
    }

    @Tool({
        description:
            "Deploy a standard ERC721 contract / NFT contract on the Celo blockchain. Returns the transaction hash.",
    })
    async deployERC721(walletClient: ViemEVMWalletClient, parameters: DeployERC721Parameters) {
        const txHash = await walletClient.deployContract({
            abi: ERC721_CONSTRUCTOR_ABI,
            args: [
                parameters.tokenName,
                parameters.tokenSymbol,
                BigInt(parameters.maxSupply),
                walletClient.getAddress(),
            ],
            bytecode: ERC721_BYTECODE as `0x${string}`,
        });
        return txHash.hash;
    }

    @Tool({
        description: "Get the ERC20 token info by its symbol, including the contract address, decimals, and name",
    })
    async getTokenInfoBySymbol(walletClient: ViemEVMWalletClient, parameters: GetTokenInfoBySymbolParameters) {
        const token = this.tokens.find((token) =>
            [token.symbol, token.symbol.toLowerCase()].includes(parameters.symbol),
        );

        if (!token) {
            throw Error(`Token with symbol ${parameters.symbol} not found`);
        }

        const chain = walletClient.getChain();

        const contractAddress = token.chains[chain.id]?.contractAddress;

        if (!contractAddress) {
            throw Error(`Token with symbol ${parameters.symbol} not found on chain ${chain.id}`);
        }

        return {
            symbol: token?.symbol,
            contractAddress,
            decimals: token?.decimals,
            name: token?.name,
        };
    }

    @Tool({
        description: "Get the balance of an ERC20 token in base units. Convert to decimal units before returning.",
    })
    async getTokenBalance(walletClient: ViemEVMWalletClient, parameters: GetTokenBalanceParameters) {
        try {
            const resolvedWalletAddress = await walletClient.resolveAddress(parameters.wallet);

            const rawBalance = await walletClient.read({
                address: parameters.tokenAddress,
                abi: ERC20_ABI,
                functionName: "balanceOf",
                args: [resolvedWalletAddress],
            });

            return Number(rawBalance.value);
        } catch (error) {
            throw Error(`Failed to fetch balance: ${error}`);
        }
    }

    @Tool({
        description: "Get the balance of an ERC721 token / NFT. Convert to decimal units before returning.",
    })
    async getERC721Balance(walletClient: ViemEVMWalletClient, parameters: GetERC721BalanceParameters) {
        try {
            const resolvedWalletAddress = await walletClient.resolveAddress(parameters.wallet);

            const rawBalance = await walletClient.read({
                address: parameters.tokenAddress,
                abi: ERC721_ABI,
                functionName: "balanceOf",
                args: [resolvedWalletAddress],
            });
            return Number(rawBalance.value);
        } catch (error) {
            throw Error(`Failed to fetch balance: ${error}`);
        }
    }

    @Tool({
        description: "Get the token IDs of an ERC721 token / NFT for a particular wallet address",
    })
    async getTokenIds(walletClient: ViemEVMWalletClient, parameters: GetTokenIdsParameters) {
        try {
            const resolvedWalletAddress = await walletClient.resolveAddress(parameters.wallet);

            const tokenIds = (await walletClient.read({
                address: parameters.tokenAddress,
                abi: ERC721_ABI,
                functionName: "tokensOfOwner",
                args: [resolvedWalletAddress],
            })) as { value: bigint[] };

            return tokenIds.value.map((id) => Number(id));
        } catch {}
    }

    @Tool({
        description: "Transfer an amount of an ERC20 token to an address",
    })
    async transfer(walletClient: ViemEVMWalletClient, parameters: TransferParameters) {
        try {
            const to = await walletClient.resolveAddress(parameters.to);

            const hash = await walletClient.sendTransaction({
                to: parameters.tokenAddress,
                abi: ERC20_ABI,
                functionName: "transfer",
                args: [to, parameters.amount],
            });
            return hash.hash;
        } catch (error) {
            throw Error(`Failed to transfer: ${error}`);
        }
    }

    @Tool({
        description: "Transfer an ERC721 token / NFT to an address",
    })
    async transferERC721(walletClient: ViemEVMWalletClient, parameters: TransferERC721Parameters) {
        try {
            const from = await walletClient.resolveAddress(parameters.from);
            const to = await walletClient.resolveAddress(parameters.to);

            const hash = await walletClient.sendTransaction({
                to: parameters.tokenAddress,
                abi: ERC721_ABI,
                functionName: "safeTransferFrom",
                args: [from, to, parameters.tokenId],
            });
            return hash.hash;
        } catch (error) {
            throw Error(`Failed to transfer ERC721: ${error}`);
        }
    }

    @Tool({
        description: "Mint an NFT to an address",
    })
    async mintNFT(walletClient: ViemEVMWalletClient, parameters: MintNFTParameters) {
        try {
            const resolvedRecipientAddress = await walletClient.resolveAddress(parameters.to);
            const resolvedTokenAddress = await walletClient.resolveAddress(parameters.tokenAddress);

            const hash = await walletClient.sendTransaction({
                to: resolvedTokenAddress,
                abi: ERC721_ABI,
                functionName: "safeMint",
                args: [resolvedRecipientAddress],
            });
            return hash.hash;
        } catch (error) {
            throw Error(`Failed to mint NFT: ${error}`);
        }
    }

    @Tool({
        description: "Get the total supply of an ERC20 token",
    })
    async getTokenTotalSupply(walletClient: ViemEVMWalletClient, parameters: GetTokenTotalSupplyParameters) {
        try {
            const rawTotalSupply = await walletClient.read({
                address: parameters.tokenAddress,
                abi: ERC20_ABI,
                functionName: "totalSupply",
            });

            return rawTotalSupply.value;
        } catch (error) {
            throw Error(`Failed to fetch total supply: ${error}`);
        }
    }

    @Tool({
        description: "Get the allowance of an ERC20 token",
    })
    async getTokenAllowance(walletClient: ViemEVMWalletClient, parameters: GetTokenAllowanceParameters) {
        try {
            const owner = await walletClient.resolveAddress(parameters.owner);
            const spender = await walletClient.resolveAddress(parameters.spender);

            const rawAllowance = await walletClient.read({
                address: parameters.tokenAddress,
                abi: ERC20_ABI,
                functionName: "allowance",
                args: [owner, spender],
            });
            return Number(rawAllowance.value);
        } catch (error) {
            throw Error(`Failed to fetch allowance: ${error}`);
        }
    }

    @Tool({
        description: "Approve an amount of an ERC20 token to an address",
    })
    async approve(walletClient: ViemEVMWalletClient, parameters: ApproveParameters) {
        try {
            const spender = await walletClient.resolveAddress(parameters.spender);

            const hash = await walletClient.sendTransaction({
                to: parameters.tokenAddress,
                abi: ERC20_ABI,
                functionName: "approve",
                args: [spender, parameters.amount],
            });
            return hash.hash;
        } catch (error) {
            throw Error(`Failed to approve: ${error}`);
        }
    }

    @Tool({
        description: "Revoke approval for an ERC20 token to an address",
    })
    async revokeApproval(walletClient: ViemEVMWalletClient, parameters: RevokeApprovalParameters) {
        try {
            const spender = await walletClient.resolveAddress(parameters.spender);

            const hash = await walletClient.sendTransaction({
                to: parameters.tokenAddress,
                abi: ERC20_ABI,
                functionName: "approve",
                args: [spender, 0],
            });
            return hash.hash;
        } catch (error) {
            throw Error(`Failed to revoke approval: ${error}`);
        }
    }

    @Tool({
        description: "Transfer an amount of an ERC20 token from an address to another address",
    })
    async transferFrom(walletClient: ViemEVMWalletClient, parameters: TransferFromParameters) {
        try {
            const from = await walletClient.resolveAddress(parameters.from);
            const to = await walletClient.resolveAddress(parameters.to);

            const hash = await walletClient.sendTransaction({
                to: parameters.tokenAddress,
                abi: ERC20_ABI,
                functionName: "transferFrom",
                args: [from, to, parameters.amount],
            });
            return hash.hash;
        } catch (error) {
            throw Error(`Failed to transfer from: ${error}`);
        }
    }

    @Tool({
        description: "Convert an amount of an ERC20 token to its base unit",
    })
    async convertToBaseUnit(parameters: ConvertToBaseUnitParameters) {
        const { amount, decimals } = parameters;
        const baseUnit = amount * 10 ** decimals;
        return Number(baseUnit);
    }

    @Tool({
        description: "Convert an amount of an ERC20 token from its base unit to its decimal unit",
    })
    async convertFromBaseUnit(parameters: ConvertFromBaseUnitParameters) {
        const { amount, decimals } = parameters;
        const decimalUnit = amount / 10 ** decimals;
        return Number(decimalUnit);
    }
}
