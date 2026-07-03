import { type Chain, PluginBase, type ToolBase, createTool } from "@goat-sdk/core";
import type { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { wrapFetchWithPaymentFromConfig } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm";
import { HIVE_TREASURY, HIVE_CHAIN_ID, HIVE_USDC } from "./abi";
import {
    CallHiveServiceParameters,
    HiveEvaluatorParameters,
    NoParams,
} from "./parameters";

// ─── Service URL catalog ─────────────────────────────────────────────────────

export const HIVE_SERVICES: Record<string, string> = {
    // AI / Evaluation
    evaluator:          "https://api.hiveciv.com/v1/evaluator",
    summarizer:         "https://api.hiveciv.com/v1/summarizer",
    classifier:         "https://api.hiveciv.com/v1/classifier",
    sentiment:          "https://api.hiveciv.com/v1/sentiment",
    extractor:          "https://api.hiveciv.com/v1/extractor",
    translator:         "https://api.hiveciv.com/v1/translator",
    transcriber:        "https://api.hiveciv.com/v1/transcriber",
    embeddings:         "https://api.hiveciv.com/v1/embeddings",
    reranker:           "https://api.hiveciv.com/v1/reranker",
    router:             "https://api.hiveciv.com/v1/router",
    // Data / Research
    search:             "https://api.hiveciv.com/v1/search",
    news:               "https://api.hiveciv.com/v1/news",
    research:           "https://api.hiveciv.com/v1/research",
    scraper:            "https://api.hiveciv.com/v1/scraper",
    crawler:            "https://api.hiveciv.com/v1/crawler",
    parser:             "https://api.hiveciv.com/v1/parser",
    enricher:           "https://api.hiveciv.com/v1/enricher",
    validator:          "https://api.hiveciv.com/v1/validator",
    aggregator:         "https://api.hiveciv.com/v1/aggregator",
    monitor:            "https://api.hiveciv.com/v1/monitor",
    // Finance / Crypto
    priceOracle:        "https://api.hiveciv.com/v1/price-oracle",
    portfolioAnalyzer:  "https://api.hiveciv.com/v1/portfolio-analyzer",
    riskScorer:         "https://api.hiveciv.com/v1/risk-scorer",
    yieldOptimizer:     "https://api.hiveciv.com/v1/yield-optimizer",
    defiRouter:         "https://api.hiveciv.com/v1/defi-router",
    nftAnalyzer:        "https://api.hiveciv.com/v1/nft-analyzer",
    walletProfiler:     "https://api.hiveciv.com/v1/wallet-profiler",
    contractAuditor:    "https://api.hiveciv.com/v1/contract-auditor",
    gasEstimator:       "https://api.hiveciv.com/v1/gas-estimator",
    bridgeRouter:       "https://api.hiveciv.com/v1/bridge-router",
    // Business / Productivity
    documentDrafter:    "https://api.hiveciv.com/v1/document-drafter",
    codeReviewer:       "https://api.hiveciv.com/v1/code-reviewer",
    meetingNotes:       "https://api.hiveciv.com/v1/meeting-notes",
    taskPlanner:        "https://api.hiveciv.com/v1/task-planner",
    proposalWriter:     "https://api.hiveciv.com/v1/proposal-writer",
    emailDrafter:       "https://api.hiveciv.com/v1/email-drafter",
    reportGenerator:    "https://api.hiveciv.com/v1/report-generator",
    dataVisualizer:     "https://api.hiveciv.com/v1/data-visualizer",
    chartBuilder:       "https://api.hiveciv.com/v1/chart-builder",
    presentationMaker:  "https://api.hiveciv.com/v1/presentation-maker",
    // Identity / Compliance
    kycOracle:          "https://api.hiveciv.com/v1/kyc-oracle",
    amlChecker:         "https://api.hiveciv.com/v1/aml-checker",
    reputationScorer:   "https://api.hiveciv.com/v1/reputation-scorer",
    identityVerifier:   "https://api.hiveciv.com/v1/identity-verifier",
    complianceAuditor:  "https://api.hiveciv.com/v1/compliance-auditor",
    // Infrastructure
    ipfsGateway:        "https://api.hiveciv.com/v1/ipfs-gateway",
    webhookRelay:       "https://api.hiveciv.com/v1/webhook-relay",
    cacheLayer:         "https://api.hiveciv.com/v1/cache-layer",
    rateLimiter:        "https://api.hiveciv.com/v1/rate-limiter",
    loadBalancer:       "https://api.hiveciv.com/v1/load-balancer",
};

// ─── Helper: build x402-aware fetch from EVMWalletClient ────────────────────

function buildPayFetch(walletClient: EVMWalletClient): typeof fetch {
    const address = walletClient.getAddress() as `0x${string}`;

    // Build a minimal ClientEvmSigner from the GOAT EVMWalletClient.
    const signer = {
        address,
        signTypedData: async (args: {
            domain: Record<string, unknown>;
            types: Record<string, unknown>;
            primaryType: string;
            message: Record<string, unknown>;
        }) => {
            const result = await walletClient.signTypedData(args as any);
            return result.value as `0x${string}`;
        },
    };

    return wrapFetchWithPaymentFromConfig(fetch, {
        schemes: [
            {
                network: `eip155:${HIVE_CHAIN_ID}`,
                client: new ExactEvmScheme(signer as any),
            },
        ],
    });
}

// ─── HivePlugin ───────────────────────────────────────────────────────────────

/**
 * HivePlugin — GOAT plugin for Hive Civilization x402 services.
 *
 * Exposes 50 x402-wired AI, data, finance, compliance, and infrastructure
 * services on Base mainnet to any GOAT-powered agent.
 *
 * Payments are made in USDC on Base, routed automatically to the Hive treasury:
 * 0x15184bf50b3d3f52b60434f8942b7d52f2eb436e
 *
 * NOT AFFILIATED WITH COINBASE. x402 is an open protocol.
 *
 * @example
 * ```typescript
 * import { hive } from "@goat-sdk/plugin-hive";
 *
 * const tools = await getOnChainTools({
 *   wallet,
 *   plugins: [hive()]
 * });
 * ```
 */
export class HivePlugin extends PluginBase<EVMWalletClient> {
    constructor() {
        super("hive", []);
    }

    supportsChain = (chain: Chain) => chain.type === "evm";

    override getTools(walletClient: EVMWalletClient): ToolBase[] {
        const payFetch = buildPayFetch(walletClient);

        // ── get_hive_catalog ─────────────────────────────────────────────────
        const catalogTool = createTool(
            {
                name: "get_hive_catalog",
                description:
                    `Returns the full Hive Civilization service catalog — 50 x402-wired AI, data, finance, ` +
                    `compliance, and infrastructure services on Base mainnet. Free to call, no payment required. ` +
                    `Treasury: ${HIVE_TREASURY}. USDC: ${HIVE_USDC}.`,
                parameters: NoParams.schema,
            },
            async (_params: NoParams) => {
                const services = Object.entries(HIVE_SERVICES).map(([name, url]) => ({
                    name,
                    url,
                    chainId: HIVE_CHAIN_ID,
                    treasury: HIVE_TREASURY,
                    paymentToken: HIVE_USDC,
                }));
                return {
                    services,
                    totalCount: services.length,
                    treasury: HIVE_TREASURY,
                    chainId: HIVE_CHAIN_ID,
                    paymentToken: HIVE_USDC,
                    protocol: "x402",
                    network: "Base mainnet",
                };
            },
        );

        // ── call_hive_service ─────────────────────────────────────────────────
        const callTool = createTool(
            {
                name: "call_hive_service",
                description:
                    `Generic paid wrapper for any Hive Civilization service. Automatically handles x402 ` +
                    `challenge/retry using the connected wallet's USDC balance on Base mainnet. Payments ` +
                    `route to Hive treasury (${HIVE_TREASURY}). Use get_hive_catalog to discover service names.`,
                parameters: CallHiveServiceParameters.schema,
            },
            async (params: CallHiveServiceParameters) => {
                const { serviceName, tool, args } = params;
                const baseUrl = HIVE_SERVICES[serviceName];
                if (!baseUrl) {
                    throw new Error(
                        `Unknown Hive service: "${serviceName}". Run get_hive_catalog to see available services.`,
                    );
                }
                const url = `${baseUrl}/${tool}`;
                const response = await payFetch(url as any, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Hive-Client": "@goat-sdk/plugin-hive@1.0.0",
                    },
                    body: JSON.stringify(args ?? {}),
                });
                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(`Hive "${serviceName}/${tool}" returned ${response.status}: ${text}`);
                }
                return response.json();
            },
        );

        // ── hive_evaluator_submit_job ─────────────────────────────────────────
        const evaluatorTool = createTool(
            {
                name: "hive_evaluator_submit_job",
                description:
                    `Submit a text evaluation job to Hive's AI Evaluator service. Costs ~$0.01 USDC on ` +
                    `Base mainnet, paid automatically via x402. Returns quality score, reasoning, and ` +
                    `per-criterion breakdown. Treasury: ${HIVE_TREASURY}.`,
                parameters: HiveEvaluatorParameters.schema,
            },
            async (params: HiveEvaluatorParameters) => {
                const { text, criteria, rubric } = params;
                const response = await payFetch(
                    `${HIVE_SERVICES.evaluator}/submit_job` as any,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-Hive-Client": "@goat-sdk/plugin-hive@1.0.0",
                        },
                        body: JSON.stringify({ text, criteria, rubric }),
                    },
                );
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Hive evaluator returned ${response.status}: ${errorText}`);
                }
                return response.json();
            },
        );

        return [catalogTool, callTool, evaluatorTool];
    }
}

export function hive(): HivePlugin {
    return new HivePlugin();
}
