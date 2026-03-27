import { Tool } from "@goat-sdk/core";
import type { ATVAPI } from "./api";
import {
    HistoricalDataParameters,
    ListVaultsParameters,
    NoParams,
    UserInvestmentsParameters,
    VaultAddressParameters,
    VaultAddressWithUserParameters,
} from "./parameters";

export class ATVService {
    constructor(private readonly api: ATVAPI) {}

    @Tool({
        name: "atv_list_vaults",
        description:
            "List all available ATV (Aarna) vaults. Returns vault metadata including address, chain, withdraw type, contract type, and supported deposit tokens with balances.",
    })
    async listVaults(parameters: ListVaultsParameters) {
        return this.api.get("/vaults", {
            chain: parameters.chain,
            userAddress: parameters.userAddress,
        });
    }

    @Tool({
        name: "atv_get_vault",
        description: "Get metadata for a specific ATV vault by its contract address.",
    })
    async getVault(parameters: VaultAddressWithUserParameters) {
        return this.api.get(`/vaults/${parameters.address}`, {
            userAddress: parameters.userAddress,
        });
    }

    @Tool({
        name: "atv_get_vault_apy",
        description:
            "Get the current APY breakdown (base + reward + total) for an ATV vault.",
    })
    async getVaultApy(parameters: VaultAddressParameters) {
        return this.api.get(`/vaults/${parameters.address}/apy`);
    }

    @Tool({
        name: "atv_get_vault_tvl",
        description:
            "Get the current Total Value Locked (TVL) of an ATV vault in USD.",
    })
    async getVaultTvl(parameters: VaultAddressParameters) {
        return this.api.get(`/vaults/${parameters.address}/tvl`);
    }

    @Tool({
        name: "atv_get_total_tvl",
        description: "Get the total TVL (Total Value Locked) across all ATV vaults.",
    })
    async getTotalTvl(parameters: NoParams) {
        return this.api.get("/vaults/tvl");
    }

    @Tool({
        name: "atv_get_vault_nav",
        description:
            "Get the current Net Asset Value (NAV) of an ATV vault in USD.",
    })
    async getVaultNav(parameters: VaultAddressParameters) {
        return this.api.get(`/vaults/${parameters.address}/nav`);
    }

    @Tool({
        name: "atv_get_historical_nav",
        description:
            "Get historical NAV (Net Asset Value) data points for an ATV vault over a specified period. Useful for charting price trends.",
    })
    async getHistoricalNav(parameters: HistoricalDataParameters) {
        return this.api.get(`/vaults/${parameters.address}/nav/history`, {
            days: parameters.days,
        });
    }

    @Tool({
        name: "atv_get_historical_tvl",
        description:
            "Get historical TVL (Total Value Locked) data points for an ATV vault over a specified period. Useful for charting TVL trends.",
    })
    async getHistoricalTvl(parameters: HistoricalDataParameters) {
        return this.api.get(`/vaults/${parameters.address}/tvl/history`, {
            days: parameters.days,
        });
    }

    @Tool({
        name: "atv_get_vault_portfolio",
        description:
            "Get the underlying token portfolio and breakdown data for an ATV vault.",
    })
    async getVaultPortfolio(parameters: VaultAddressParameters) {
        return this.api.get(`/vaults/${parameters.address}/portfolio`);
    }

    @Tool({
        name: "atv_get_user_investments",
        description:
            "Get a user's investment portfolio and position data for a specific ATV vault.",
    })
    async getUserInvestments(parameters: UserInvestmentsParameters) {
        return this.api.get(`/vaults/${parameters.vaultAddress}/investments`, {
            userAddress: parameters.userAddress,
        });
    }

    @Tool({
        name: "atv_get_deposit_status",
        description:
            "Check whether deposits are currently paused on an ATV vault. Use this before building a deposit transaction.",
    })
    async getDepositStatus(parameters: VaultAddressParameters) {
        return this.api.get(`/vaults/${parameters.address}/deposit/status`);
    }

    @Tool({
        name: "atv_get_withdraw_status",
        description:
            "Check whether withdrawals are currently paused on an ATV vault. Use this before building a withdraw transaction.",
    })
    async getWithdrawStatus(parameters: VaultAddressParameters) {
        return this.api.get(`/vaults/${parameters.address}/withdraw/status`);
    }

    @Tool({
        name: "atv_get_queue_withdraw_status",
        description:
            "Check whether queued (delayed) withdrawals are currently paused on an ATV vault.",
    })
    async getQueueWithdrawStatus(parameters: VaultAddressParameters) {
        return this.api.get(`/vaults/${parameters.address}/withdraw/queue/status`);
    }
}
