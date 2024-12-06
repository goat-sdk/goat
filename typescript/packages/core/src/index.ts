import type { Plugin } from "./plugins/plugins";
import { sendETH } from "./plugins/send-eth";
import { transferNFT } from "./plugins/send-nft";
import { sendSOL } from "./plugins/send-sol";
import {
	type GetToolsParams,
	type Tool,
	getTools,
	type DeferredTool,
	getDeferredTools,
	type GetDeferredToolsParams,
} from "./tools";
import { addParametersToDescription, parametersToJsonExample } from "./utils";
import type {
	Balance,
	Chain,
	EVMReadRequest,
	EVMSmartWalletClient,
	EVMTransaction,
	EVMTypedData,
	EVMWalletClient,
	Signature,
	SolanaReadRequest,
	SolanaTransaction,
	SolanaWalletClient,
	WalletClient,
	isEVMSmartWalletClient,
	isEVMWalletClient,
	isSolanaWalletClient,
	ChainForWalletClient,
} from "./wallets";

export {
	getTools,
	getDeferredTools,
	sendETH,
	sendSOL,
	transferNFT,
	addParametersToDescription,
	parametersToJsonExample,
	type Tool,
	type DeferredTool,
	type GetToolsParams,
	type GetDeferredToolsParams,
	type Plugin,
	type WalletClient,
	type EVMTransaction,
	type EVMReadRequest,
	type EVMWalletClient,
	type EVMSmartWalletClient,
	type SolanaTransaction,
	type SolanaReadRequest,
	type SolanaWalletClient,
	type Signature,
	type Balance,
	type EVMTypedData,
	type isEVMWalletClient,
	type isEVMSmartWalletClient,
	type isSolanaWalletClient,
	type Chain,
	type ChainForWalletClient,
};
