export type ModeGaugeInfo = {
    address: string;
    weight: number;
};

export type VotingPowerInfo = {
    amount: string;
    timestamp: number;
};

export const MODE_CONTRACTS = {
    GAUGE_VOTER: "0x71439Ae82068E19ea90e4F506c74936aE170Cf58" as const,
    VOTING_ESCROW: "0xff8AB822b8A853b01F9a9E9465321d6Fe77c9D2F" as const,
} as const;

export const MODE_CHAIN_ID = 34443; // Mode Network
