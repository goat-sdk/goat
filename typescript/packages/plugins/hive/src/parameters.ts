import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

// ─── Shared base ────────────────────────────────────────────────────────────

const HIVE_SERVICE_NAMES = [
    // AI / Evaluation
    "evaluator", "summarizer", "classifier", "sentiment", "extractor",
    "translator", "transcriber", "embeddings", "reranker", "router",
    // Data / Research
    "search", "news", "research", "scraper", "crawler", "parser",
    "enricher", "validator", "aggregator", "monitor",
    // Finance / Crypto
    "priceOracle", "portfolioAnalyzer", "riskScorer", "yieldOptimizer",
    "defiRouter", "nftAnalyzer", "walletProfiler", "contractAuditor",
    "gasEstimator", "bridgeRouter",
    // Business / Productivity
    "documentDrafter", "codeReviewer", "meetingNotes", "taskPlanner",
    "proposalWriter", "emailDrafter", "reportGenerator", "dataVisualizer",
    "chartBuilder", "presentationMaker",
    // Identity / Compliance
    "kycOracle", "amlChecker", "reputationScorer", "identityVerifier",
    "complianceAuditor",
    // Infrastructure
    "ipfsGateway", "webhookRelay", "cacheLayer", "rateLimiter", "loadBalancer",
] as const;

// ─── Tool parameter classes ──────────────────────────────────────────────────

export class NoParams extends createToolParameters(z.object({})) {}

export class CallHiveServiceParameters extends createToolParameters(
    z.object({
        serviceName: z
            .enum(HIVE_SERVICE_NAMES as unknown as [string, ...string[]])
            .describe(
                "Name of the Hive service to call. One of: " + HIVE_SERVICE_NAMES.join(", "),
            ),
        tool: z
            .string()
            .describe("The specific tool/endpoint within the service (e.g., 'submit_job', 'run', 'analyze')"),
        args: z
            .record(z.unknown())
            .optional()
            .default({})
            .describe("JSON arguments to pass to the tool. Service-specific — consult the Hive service docs."),
    }),
) {}

export class HiveEvaluatorParameters extends createToolParameters(
    z.object({
        text: z
            .string()
            .describe("The text content to evaluate for quality, accuracy, or relevance."),
        criteria: z
            .array(z.string())
            .optional()
            .describe("Optional list of evaluation criteria (e.g., ['accuracy', 'coherence', 'helpfulness'])"),
        rubric: z
            .string()
            .optional()
            .describe("Optional grading rubric as plain text to guide the evaluation."),
    }),
) {}
