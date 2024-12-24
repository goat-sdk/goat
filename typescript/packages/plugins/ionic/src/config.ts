// typescript/packages/plugins/ionic/src/config.ts
export interface IonicProtocolAddresses {
    pools: {
        [poolId: string]: `0x${string}`;
    };
    assets: {
        [symbol: string]: {
            address?: `0x${string}`;
            decimals?: number;
        };
    };
    PoolDirectory?: `0x${string}`;
    PoolLens?: `0x${string}`;
}

export const ionicProtocolAddresses: {
    [chainId: number]: IonicProtocolAddresses;
} = {
    // Configuration for Mode network (chain ID 34443)
    34443: {
        pools: {
            "1": "0xfb3323e24743caf4add0fdccfb268565c0685556", // Main Pool Address
        },
        assets: {
            "USDC": { address: "0x2BE717340023C9e14C1Bb12cb3ecBcfd3c3fB038", decimals: 6 },
            "WETH": { address: "0x71ef7EDa2Be775E5A7aa8afD02C45F059833e9d2", decimals: 18 },
            "MODE": { address: "0xe77fb5c088b194c46695780322d39c791d5ada16", decimals: 18 },
            "ezETH": { address: "0x59e710215d45F584f44c0FEe83DA6d43D762D857", decimals: 18 },
            "STONE": { address: "0x959FA710CCBb22c7Ce1e59Da82A247e686629310", decimals: 18 },
            "wrsETH": { address: "0x49950319aBE7CE5c3A6C90698381b45989C99b46", decimals: 18 },
            "weETH": { address: "0xA0D844742B4abbbc43d8931a6Edb00C56325aA18", decimals: 18 },
            "dMBTC": { address: "0x5158ae44C1351682B3DC046541Edf84BF28c8ca4", decimals: 8 },
        },
        PoolDirectory: "0xBa47888839275e572435c8A1bA8A1Ca8822Bce23", // Mode PoolDirectory
        PoolLens: "0x41576595C989b4958b974117B3755547f94dd380",      // Mode PoolLens
    },
    // Configuration for Base network (chain ID 8453)
    8453: {
        pools: {
            "1": "0x05c9C6417F246600f8f5f49fcA9Ee991bfF73D13", // Base Main Pool
        },
        assets: {
            "ezETH": { address: "0x079f84161642D81aaFb67966123C9949F9284bf5", decimals: 18 },
            "wstETH": { address: "0x9D62e30c6cB7964C99314DCf5F847e36Fcb29ca9", decimals: 18 },
            "cbETH": { address: "0x9c201024A62466F9157b2dAaDda9326207ADDd29", decimals: 18 },
            "AERO": { address: "0x014e08F05ac11BB532BE62774A4C548368f59779", decimals: 18 },
            "USDC": { address: "0xa900A17a49Bc4D442bA7F72c39FA2108865671f0", decimals: 6 },
            "WETH": { address: "0x49420311B518f3d0c94e897592014de53831cfA3", decimals: 18 },
            "weETH": { address: "0x84341B650598002d427570298564d6701733c805", decimals: 18 },
            "eUSD": { address: "0x9c2A4f9c5471fd36bE3BBd8437A33935107215A1", decimals: 18 },
            "bsdETH": { address: "0x3D9669DE9E3E98DB41A1CbF6dC23446109945E3C", decimals: 18 },
            "hyUSD": { address: "0x751911bDa88eFcF412326ABE649B7A3b28c4dEDe", decimals: 18 },
            "RSR": { address: "0xfc6b82668E10AFF62f208C492fc95ef1fa9C0426", decimals: 18 },
            "wsuperOETHb": { address: "0xC462eb5587062e2f2391990b8609D2428d8Cf598", decimals: 18 },
            "wUSDM": { address: "0xe30965Acd0Ee1CE2e0Cd0AcBFB3596bD6fC78A51", decimals: 18 },
            "cbBTC": { address: "0x1De166df671AE6DB4C4C98903df88E8007593748", decimals: 8 },
            "EURC": { address: "0x0E5A87047F871050c0D713321Deb0F008a41C495", decimals: 18 },
            "OGN": { address: "0xE00B2B2ca7ac347bc7Ca82fE5CfF0f76222FF375", decimals: 18 },
            "USD+": { address: "0x74109171033F662D5b898A7a2FcAB2f1EF80c201", decimals: 18 },
            "USDz": { address: "0xa4442b665d4c6DBC6ea43137B336e3089f05626C", decimals: 18 },
            "wUSD+": { address: "0xF1bbECD6aCF648540eb79588Df692c6b2F0fbc09", decimals: 18 },
            "sUSDz": { address: "0xf64bfd19DdCB2Bb54e6f976a233d0A9400ed84eA", decimals: 18 },
            "uSOL": { address: "0xbd06905590b6E1b6Ac979Fc477A0AebB58d52371", decimals: 9 },
            "uSUI": { address: "0xAa255Cf8e294BD7fcAB21897C0791e50C99BAc69", decimals: 6 },
            "fBOMB": { address: "0xd333681242F376f9005d1208ff946C3EE73eD659", decimals: 18 },
            "KLIMA": { address: "0x600D660440f15EeADbC3fc1403375e04b318F07e", decimals: 18 },
        },
        PoolDirectory: "0x4b49784CB7fB959cA78c88a9487197fC0497739f", // Base PoolDirectory
        PoolLens: "0x4F8735782909162DC538f5c9278b498f5939879b",      // Base PoolLens
    },
    // Configuration for Optimism network (chain ID 10)
    10: {
        pools: {
            "1": "0xaFB4A254D125B0395610fdc8f1D022936c7b166B", // Optimism Main Pool
        },
        assets: {
            "WETH": { address: "0x53b1D15b24d93330b2fD359C798dE7183255e7f2", decimals: 18 },
            "LUSD": { address: "0x9F4089Ea33773A090ac514934517990dF04ae5a7", decimals: 18 },
            "USDC": { address: "0x50549be7e21C3dc0Db03c3AbAb83e1a78d07e6e0", decimals: 6 },
            "wstETH": { address: "0x2527e8cC363Ef3fd470c6320B22956021cacd149", decimals: 18 },
            "USDT": { address: "0xb2918350826C1FB3c8b25A553B5d49611698206f", decimals: 6 },
            "OP": { address: "0xAec01BB498bec2Fe8f3416314D5E0Db7EC76576b", decimals: 18 },
            "SNX": { address: "0xe4c5Aeb87762789F854B3Bae7515CF00d77a1f5e", decimals: 18 },
            "WBTC": { address: "0x863dccAaD60A1105f4B948C67895B4F0411C4497", decimals: 8 },
            "wUSDM": { address: "0xc63B18Fc9025ACC7830B9df05e5A0B208940a3EE", decimals: 18 },
            "weETH": { address: "0xC741af01903f39841228dE21d9DdD31Ba604Fec5", decimals: 18 },
        },
        PoolDirectory: "0x3f270120D901081C093c5180456146E088b1dCe1", // Optimism PoolDirectory
        PoolLens: "0x3F91140971473b1c875378cb159e53ca42b062C9",      // Optimism PoolLens
    },
};