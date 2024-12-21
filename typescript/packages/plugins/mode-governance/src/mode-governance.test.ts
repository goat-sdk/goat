import { describe, it, expect } from "vitest";
import { modeGovernance } from "./index";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mode } from "viem/chains";

describe("Mode Governance Plugin", () => {
    it("should stake MODE tokens", async () => {
        const account = privateKeyToAccount("0x1234..."); // Add test private key
        const client = createWalletClient({
            account,
            chain: mode,
            transport: http(),
        });

        const plugin = modeGovernance();

        
        
        // Example prompt:
        /*
        I want to stake 100 MODE tokens in Mode's governance system.
        First, I need to approve the tokens:
        
        1. Use the ERC20 plugin to approve MODE tokens
        2. Use this plugin to stake the tokens
        */
        
        const result = await plugin.executeFunction("stakeTokens", {
            amount: "100",
            tokenType: "MODE",
        });
        
        expect(result).toBeDefined();
    });
}); 