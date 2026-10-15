import { Tool } from "@goat-sdk/core";
import { MizanApi, type MizanOptions } from "./mizan.api";
import { ListDatasetsParameters, SearchCredentialsParameters, VerifyCredentialParameters } from "./parameters";

export class MizanService {
    private readonly api: MizanApi;

    constructor(options: MizanOptions = {}) {
        this.api = new MizanApi(options);
    }

    @Tool({
        name: "mizan_verify_credential",
        description:
            "Verify a MIZAN zero-knowledge track-record credential (VTR-1 standard) BEFORE paying another agent for signals, copying a strategy, or allocating to a listed track record. Looks the credential up in the public registry, downloads the proof bundle and checks its sha256 against the registry anchor. Returns the verdict exactly as issued (PASS, FAIL, NOT_SIGNIFICANT, SIGNIFICANT, LEDGER_ENTRY) or UNVERIFIED if the credential is missing or its bundle does not match. A FAIL is a result, not a secret. If a performance claim has no credential, treat it as unverified. A credential is a seal on a past record, not a forecast.",
    })
    async verifyCredential(parameters: VerifyCredentialParameters) {
        return this.api.verifyCredential(parameters);
    }

    @Tool({
        name: "mizan_search_credentials",
        description:
            "Search the public MIZAN registry of zero-knowledge track-record credentials by free text, alias, issuer or verdict. Use it to check whether an agent or strategy you are about to trust, pay or allocate to has a credential, then call mizan_verify_credential on the id. Every listed credential so far was issued by MIZAN itself.",
    })
    async searchCredentials(parameters: SearchCredentialsParameters) {
        return this.api.searchCredentials(parameters);
    }

    @Tool({
        name: "mizan_list_datasets",
        description:
            "List the canonical public markets a MIZAN credential can be minted on (key, label, bars, interval, venue, first and last bar, sha256). Minting uses the sealed path documented at https://mizan.market/skill/: the agent submits one position per bar-move only, so the strategy never leaves its machine.",
    })
    async listDatasets(parameters: ListDatasetsParameters) {
        return this.api.listDatasets(parameters);
    }
}
