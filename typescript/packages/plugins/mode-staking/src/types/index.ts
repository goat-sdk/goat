export const MODE_CONTRACTS = {
    MODE_TOKEN: "0xDfc7C877a950e49D2610114102175A06C2e3167a" as const,
    VOTING_ESCROW: "0xff8AB822b8A853b01F9a9E9465321d6Fe77c9D2F" as const,
    VENFT_LOCK: "0x06ab1Dc3c330E9CeA4fDF0C7C6F6Fb6442A4273C" as const,
    EXIT_QUEUE: "0x915e50A7C53e05F72122bC883309a812A90bA163" as const,
    CLOCK: "0x66CC481755f8a9d415e75d29C17B0E3eF2Af70bD" as const,
} as const;

export const MODE_CHAIN_ID = 34443;

export type StakingPosition = {
    tokenId: string;
    amount: string;
    lockEnd: number;
    votingPower: string;
};

export type CooldownInfo = {
    isInCooldown: boolean;
    cooldownEnd: number;
    remainingTime: number;
};

export type WarmupInfo = {
    isInWarmup: boolean;
    warmupEnd: number;
    remainingTime: number;
};
