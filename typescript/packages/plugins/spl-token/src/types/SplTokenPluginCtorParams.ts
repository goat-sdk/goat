import { SolanaNetwork, Token } from "../tokens";

export interface SplTokenPluginCtorParams {
    network?: SolanaNetwork;
    tokens?: Token[];
}
