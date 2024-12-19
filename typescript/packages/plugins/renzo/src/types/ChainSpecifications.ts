import { Address } from "viem";
import { base, mode, arbitrum, bsc, linea } from "viem/chains";
export type ChainSpecifications = Record<
    number,
    {
        renzoDepositAddress: Address;
        l2EzEthAddress: Address;
    }
>;

export const RenzoOnMode: ChainSpecifications = {
    [mode.id]: {
        renzoDepositAddress: "0x4D7572040B84b41a6AA2efE4A93eFFF182388F88",
        l2EzEthAddress: "0x2416092f143378750bb29b79eD961ab195CcEea5",
    },
};

export const RenzoOnBase: ChainSpecifications = {
    [base.id]: {
        renzoDepositAddress: "0xf25484650484de3d554fb0b7125e7696efa4ab99",
        l2EzEthAddress: "0x2416092f143378750bb29b79eD961ab195CcEea5",
    },
};

export const RenzoOnArbitrum: ChainSpecifications = {
    [arbitrum.id]: {
        renzoDepositAddress: "0xf25484650484de3d554fb0b7125e7696efa4ab99",
        l2EzEthAddress: "0x2416092f143378750bb29b79eD961ab195CcEea5",
    },
};

export const RenzoOnBsc: ChainSpecifications = {
    [bsc.id]: {
        renzoDepositAddress: "0xf25484650484de3d554fb0b7125e7696efa4ab99",
        l2EzEthAddress: "0x2416092f143378750bb29b79eD961ab195CcEea5",
    },
};

export const RenzoOnLinea: ChainSpecifications = {
    [linea.id]: {
        renzoDepositAddress: "0x4D7572040B84b41a6AA2efE4A93eFFF182388F88",
        l2EzEthAddress: "0x2416092f143378750bb29b79eD961ab195CcEea5",
    },
};
