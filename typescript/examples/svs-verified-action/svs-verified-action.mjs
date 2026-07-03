import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import * as GoatCore from "@goat-sdk/core";
import { z } from "zod";
import {
  GOAT_ADAPTER_VERSION,
  GOAT_PLUGIN_NAME,
  GOAT_TOOL_NAME,
  createSvsGoatPlugin
} from "@svsprotocol/solana/goat";

const REQUIRED_ENV = [
  "SVS_SERVER_URL",
  "SVS_BOT_ID",
  "SVS_BOT_POLICY_ID",
  "SVS_BOT_API_KEY",
  "SVS_BOT_REQUEST_SIGNING_SECRET",
  "SVS_BOT_EXPECTED_INTEGRATION_CONTRACT_HASH",
  "SOLANA_RPC_URL"
];

const LIVE_SUBMIT_REQUIRED_ENV = [
  ...REQUIRED_ENV,
  "SVS_SERIALIZED_TRANSACTION_BASE64"
];

export function createSvsVerifiedGoatPlugin(env = process.env) {
  assertRequiredEnv(env);

  return createSvsGoatPlugin({
    createTool: GoatCore.createTool,
    z,
    baseUrl: env.SVS_SERVER_URL,
    apiKey: env.SVS_BOT_API_KEY,
    requestSigningSecret: env.SVS_BOT_REQUEST_SIGNING_SECRET,
    expectedIntegrationContractHash: env.SVS_BOT_EXPECTED_INTEGRATION_CONTRACT_HASH,
    botId: env.SVS_BOT_ID,
    policyId: env.SVS_BOT_POLICY_ID,
    rpcUrl: env.SOLANA_RPC_URL,
    waitForProof: env.SVS_WAIT_FOR_PROOF === "true",
    fetchProof: true,
    checkReceiptRegistryChain: true
  });
}

export async function requireSvsVerifiedGoatReady(env = process.env) {
  const plugin = createSvsVerifiedGoatPlugin(env);

  await plugin.requireSvsProductionReady({
    requireNoExpiredPreviousSigningSecrets: true
  });

  return {
    ok: true,
    pluginName: plugin.name,
    toolName: plugin.tool?.name ?? GOAT_TOOL_NAME
  };
}

export async function submitSvsVerifiedGoatAction({
  requestId,
  intent,
  serializedTransaction,
  simulation,
  metadata = {}
}, env = process.env) {
  const plugin = createSvsVerifiedGoatPlugin(env);

  await plugin.requireSvsProductionReady({
    requireNoExpiredPreviousSigningSecrets: true
  });

  return plugin.verifyAndSubmitSolanaAction({
    requestId,
    idempotencyKey: requestId,
    intent,
    serializedTransaction,
    simulation,
    metadata,
    source: {
      agentFramework: "goat",
      adapter: GOAT_ADAPTER_VERSION,
      example: "svs-verified-action"
    }
  });
}

export function getSvsGoatExampleInfo() {
  return {
    ok: true,
    runtime: "GOAT",
    hostPackageImported: typeof GoatCore === "object",
    hostExportCount: Object.keys(GoatCore).length,
    adapterVersion: GOAT_ADAPTER_VERSION,
    pluginName: GOAT_PLUGIN_NAME,
    toolName: GOAT_TOOL_NAME,
    packageExport: "@svsprotocol/solana/goat",
    liveSubmitOptIn: "SVS_RUN_LIVE_SUBMIT=true"
  };
}

function assertRequiredEnv(env) {
  const missing = REQUIRED_ENV.filter((name) => !env[name]);

  if (missing.length > 0) {
    throw new Error(`Missing required SVS env values: ${missing.join(", ")}`);
  }
}

function assertLiveSubmitEnv(env) {
  const missing = LIVE_SUBMIT_REQUIRED_ENV.filter((name) => !env[name]);

  if (missing.length > 0) {
    throw new Error(`Missing required SVS live-submit env values: ${missing.join(", ")}`);
  }
}

function isDirectRun(metaUrl, argvPath = process.argv[1]) {
  if (!argvPath) {
    return false;
  }

  try {
    return realpathSync(fileURLToPath(metaUrl)) === realpathSync(argvPath);
  } catch {
    return fileURLToPath(metaUrl) === argvPath;
  }
}

if (isDirectRun(import.meta.url)) {
  const info = getSvsGoatExampleInfo();

  if (process.env.SVS_RUN_LIVE_SUBMIT !== "true") {
    console.log(JSON.stringify({
      ...info,
      status: "dry_run",
      nextAction: "Set SVS_RUN_LIVE_SUBMIT=true only after filling real SVS credentials and a prepared transaction."
    }, null, 2));
    process.exit(0);
  }

  assertLiveSubmitEnv(process.env);

  const result = await submitSvsVerifiedGoatAction({
    requestId: `svs-goat-${Date.now()}`,
    intent: {
      botId: process.env.SVS_BOT_ID,
      type: "memo",
      summary: "Submit a GOAT Solana action through SVS human approval."
    },
    serializedTransaction: process.env.SVS_SERIALIZED_TRANSACTION_BASE64,
    simulation: {
      ok: true,
      source: "provided-by-agent"
    }
  });

  console.log(JSON.stringify(result, null, 2));
}
