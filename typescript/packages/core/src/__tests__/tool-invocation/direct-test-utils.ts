import { vi } from "vitest";
import { WalletClientBase } from "../../classes";

/**
 * Creates a mock function that simulates a tool method
 * @param returnValue The value to be returned by the mock function
 * @returns A mock function that can be used to verify calls
 */
export function createToolMock<T>(returnValue: T) {
  return vi.fn().mockResolvedValue(returnValue);
}

/**
 * Creates a mock wallet client for testing
 * @param overrides Optional properties to override in the mock wallet
 * @returns A mock wallet client
 */
export function createMockWallet(overrides?: Partial<WalletClientBase>): WalletClientBase {
  return {
    getAddress: () => "0xmockaddress",
    getChain: () => ({ type: "evm", id: 1 }),
    signMessage: async () => ({ signature: "0xmocksignature" }),
    balanceOf: async () => ({
      decimals: 18,
      symbol: "ETH",
      name: "Ethereum",
      value: "100",
      inBaseUnits: "100000000000000000000"
    }),
    getCoreTools: () => [],
    ...overrides
  } as WalletClientBase;
}

/**
 * Creates a mock service with tool methods
 * @param methods Object containing mock methods to include in the service
 * @returns A mock service object with the specified methods
 */
export function createMockService<T extends Record<string, any>>(methods: T): T {
  return methods;
}

/**
 * Validates parameters against a schema
 * @param params Parameters to validate
 * @param requiredFields Array of field names that are required
 * @throws Error if any required field is missing
 */
export function validateParams(
  params: Record<string, any>,
  requiredFields: string[]
): void {
  for (const field of requiredFields) {
    if (params[field] === undefined) {
      throw new Error(`Missing required parameter: ${field}`);
    }
  }
}

/**
 * Extracts parameters from a prompt string
 * This is a simplified mock of what would happen in an LLM
 * @param prompt The prompt string
 * @param paramMapping Object mapping prompt patterns to parameter extraction functions
 * @returns Extracted parameters
 */
export function mockExtractParamsFromPrompt(
  prompt: string,
  paramMapping: Record<string, (prompt: string) => Record<string, any>>
): Record<string, any> {
  // Find the matching pattern
  for (const pattern in paramMapping) {
    if (prompt.includes(pattern)) {
      return paramMapping[pattern](prompt);
    }
  }
  
  // Default empty parameters if no pattern matches
  return {};
}
