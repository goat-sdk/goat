import { Tool } from "@goat-sdk/core";
import { GetDerivedKeyParameters, GetRemoteAttestationParameters } from "./parameters";
import { RemoteAttestationQuote, TEEMode } from "./tee.types";
import { DeriveKeyResponse, TdxQuoteResponse, TappdClient } from "@phala/dstack-sdk";

export class TeeService {
    private client: TappdClient;
    constructor(private readonly teeMode: TEEMode, private readonly teeSecretSalt: string) {
        let endpoint: string | undefined;
        // Both LOCAL and DOCKER modes use the simulator, just with different endpoints
        switch(teeMode) {
            case TEEMode.LOCAL:
                endpoint = "http://localhost:8090";
                console.log("TEE: Connecting to local simulator at localhost:8090");
                break;
            case TEEMode.DOCKER:
                endpoint = "http://host.docker.internal:8090";
                console.log("TEE: Connecting to simulator via Docker at host.docker.internal:8090");
                break;
            case TEEMode.PRODUCTION:
                endpoint = undefined;
                console.log("TEE: Running in production mode without simulator");
                break;
            default:
                throw new Error(`Invalid TEE_MODE: ${teeMode}. Must be one of: LOCAL, DOCKER, PRODUCTION`);
        }
        this.client = endpoint ? new TappdClient(endpoint) : new TappdClient();
    }

    @Tool({
        description: "Derive a key from TEE",
    })
    async getDerivedKey(parameters: GetDerivedKeyParameters) {
        try {
            console.log("Deriving Key in TEE...");
            const derivedKey: DeriveKeyResponse = await this.client.deriveKey(parameters.path, parameters.subject, parameters.altNames);
            console.log("Key Derived Successfully!");
            return derivedKey.asUint8Array();
        } catch (error) {
            throw new Error(`Failed to derive key in TEE: ${error}`);
        }
    }

    @Tool({
        description: "Generate a remote attestation quote for a given report data",
    })
    async getRemoteAttestation(parameters: GetRemoteAttestationParameters) {
        try {
            console.log("Generating attestation for: ", parameters.reportData);
            const tdxQuote: TdxQuoteResponse = await this.client.tdxQuote(parameters.reportData, parameters.hashAlgorithm);
            const rtmrs = tdxQuote.replayRtmrs();
            console.log(`rtmr0: ${rtmrs[0]}\nrtmr1: ${rtmrs[1]}\nrtmr2: ${rtmrs[2]}\nrtmr3: ${rtmrs[3]}f`);
            const quote: RemoteAttestationQuote = {
                quote: tdxQuote.quote,
                timestamp: Date.now(),
            };
            console.log("Remote attestation quote: ", quote);
            return quote.quote;
        } catch (error) {
            throw new Error(`Failed to generate remote attestation quote: ${error}`);
        }
    }
}