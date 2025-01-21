import { type Chain, PluginBase } from "@goat-sdk/core";
import { BalmyService } from "./balmy.service";

type ChainInfo = {
    chainId: number;
    publicRPCs: string[];
    name: string;
    ids: string[];
    nativeCurrency: { symbol: string; name: string };
    wToken: string;
    explorer: string;
    testnet?: boolean;
};

const Chains: Record<string, ChainInfo> = {
    ETHEREUM: {
        chainId: 1,
        name: "Ethereum",
        ids: ["ethereum", "mainnet", "homestead"],
        nativeCurrency: { symbol: "ETH", name: "Ethereum" },
        wToken: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        publicRPCs: ["https://eth.llamarpc.com"],
        explorer: "https://etherscan.io/",
    },
    OPTIMISM: {
        chainId: 10,
        name: "Optimism",
        ids: ["optimism"],
        nativeCurrency: { symbol: "ETH", name: "Ethereum" },
        wToken: "0x4200000000000000000000000000000000000006",
        publicRPCs: [
            "https://mainnet.optimism.io/",
            "https://1rpc.io/op",
            "https://optimism.api.onfinality.io/public",
            "https://endpoints.omniatech.io/v1/op/mainnet/public",
            "https://opt-mainnet.g.alchemy.com/v2/demo",
            "https://optimism.blockpi.network/v1/rpc/public",
            "https://optimism-mainnet.public.blastapi.io",
            "https://rpc.ankr.com/optimism",
            "https://op-pokt.nodies.app",
        ],
        explorer: "https://optimistic.etherscan.io/",
    },
    ARBITRUM: {
        chainId: 42161,
        name: "Arbitrum",
        ids: ["arbitrum"],
        nativeCurrency: { symbol: "ETH", name: "Ethereum" },
        wToken: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
        publicRPCs: [
            "https://arb1.arbitrum.io/rpc",
            "https://arb-mainnet-public.unifra.io",
            "https://arbitrum-one.public.blastapi.io",
            "https://arb1.croswap.com/rpc",
            "https://endpoints.omniatech.io/v1/arbitrum/one/public",
            "https://arbitrum.blockpi.network/v1/rpc/public",
            "https://rpc.ankr.com/arbitrum",
            "https://arb-pokt.nodies.app",
        ],
        explorer: "https://arbiscan.io/",
    },
    ARBITRUM_NOVA: {
        chainId: 42170,
        name: "Arbitrum Nova",
        ids: ["nova"],
        nativeCurrency: { symbol: "ETH", name: "Ethereum" },
        wToken: "0x722e8bdd2ce80a4422e880164f2079488e115365",
        publicRPCs: ["https://nova.arbitrum.io/rpc"],
        explorer: "https://nova.arbiscan.io/",
    },
    POLYGON: {
        chainId: 137,
        name: "Polygon",
        ids: ["polygon", "matic"],
        nativeCurrency: { symbol: "POL", name: "Polygon Ecosystem Token" },
        wToken: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
        publicRPCs: [
            "https://polygon-rpc.com",
            "https://polygon.llamarpc.com",
            "https://rpc-mainnet.maticvigil.com",
            "https://polygon-bor.publicnode.com",
            "https://polygon-mainnet.public.blastapi.io",
            "https://rpc.ankr.com/polygon",
            "https://rpc-mainnet.matic.quiknode.pro",
            "https://matic-mainnet.chainstacklabs.com",
            "https://polygon-pokt.nodies.app",
        ],
        explorer: "https://polygonscan.com/",
    },
    BNB_CHAIN: {
        chainId: 56,
        name: "BNB Chain",
        ids: ["bsc", "bnb"],
        nativeCurrency: { symbol: "BNB", name: "BNB" },
        wToken: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
        publicRPCs: [
            "https://rpc.ankr.com/bsc",
            "https://bsc-dataseed.binance.org",
            "https://bsc-dataseed1.defibit.io",
            "https://bsc-dataseed1.ninicoin.io",
            "https://bsc-dataseed1.binance.org",
            "https://bsc-dataseed2.defibit.io",
            "https://bsc-dataseed2.ninicoin.io",
            "https://bsc-dataseed2.binance.org",
            "https://bsc-dataseed3.defibit.io",
            "https://bsc-dataseed3.binance.org",
            "https://bsc-dataseed3.ninicoin.io",
            "https://bsc-dataseed4.defibit.io",
            "https://bsc-dataseed4.binance.org",
            "https://bsc-dataseed4.ninicoin.io",
            "https://bsc.rpc.blxrbdn.com",
            "https://bsc.publicnode.com",
            "https://bsc.meowrpc.com",
            "https://bsc.blockpi.network/v1/rpc/public",
            "https://endpoints.omniatech.io/v1/bsc/mainnet/public",
            "https://1rpc.io/bnb",
            "https://bscrpc.com",
            "https://bsc-mainnet.public.blastapi.io",
            "https://bnb.api.onfinality.io/public",
            "https://bsc-pokt.nodies.app",
        ],
        explorer: "https://bscscan.com/",
    },
    BASE: {
        chainId: 8453,
        name: "Base",
        ids: ["base"],
        nativeCurrency: { symbol: "ETH", name: "Ethereum" },
        wToken: "0x4200000000000000000000000000000000000006",
        publicRPCs: [
            "https://mainnet.base.org",
            "https://base-mainnet.public.blastapi.io",
            "https://base.blockpi.network/v1/rpc/public",
            "https://base-pokt.nodies.app",
            "https://base.llamarpc.com",
            "https://endpoints.omniatech.io/v1/base/mainnet/public",
            "https://developer-access-mainnet.base.org",
            "https://base.gateway.tenderly.co",
            "https://base.publicnode.com",
            "https://rpc.notadegen.com/base",
            "https://base.meowrpc.com",
            "https://1rpc.io/base",
            "https://base.drpc.org",
        ],
        explorer: "https://basescan.org/",
    },
    FANTOM: {
        chainId: 250,
        name: "Fantom",
        ids: ["fantom"],
        nativeCurrency: { symbol: "FTM", name: "Fantom" },
        wToken: "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
        publicRPCs: [
            "https://rpc.fantom.network",
            "https://rpc.ftm.tools/",
            "https://rpc.ankr.com/fantom",
            "https://rpcapi.fantom.network",
            "https://fantom-pokt.nodies.app",
        ],
        explorer: "https://ftmscan.com/",
    },
    CELO: {
        chainId: 42220,
        name: "Celo",
        ids: ["celo"],
        nativeCurrency: { symbol: "CELO", name: "Celo" },
        wToken: "0x149d5bf28fbace2950b52d4aca1c79bfd9bbb6fc",
        publicRPCs: [
            "https://rpc.ankr.com/celo",
            "https://celo-mainnet-archive.allthatnode.com",
            "https://celo-mainnet-rpc.allthatnode.com",
        ],
        explorer: "https://celoscan.io/",
    },
    METIS_ANDROMEDA: {
        chainId: 1088,
        name: "Metis Andromeda",
        ids: ["metis"],
        nativeCurrency: { symbol: "METIS", name: "Metis" },
        wToken: "0x75cb093e4d61d2a2e65d8e0bbb01de8d89b53481",
        publicRPCs: ["https://metis-pokt.nodies.app", "https://metis-mainnet.public.blastapi.io"],
        explorer: "https://explorer.metis.io/",
    },
    AVALANCHE: {
        chainId: 43114,
        name: "Avalanche",
        ids: ["avalanche", "avax"],
        nativeCurrency: { symbol: "AVAX", name: "Avalanche" },
        wToken: "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
        publicRPCs: [
            "https://api.avax.network/ext/bc/C/rpc",
            "https://rpc.ankr.com/avalanche",
            "https://avax-pokt.nodies.app",
        ],
        explorer: "https://cchain.explorer.avax.network/",
    },
    HECO: {
        chainId: 128,
        name: "Heco",
        ids: ["heco"],
        nativeCurrency: { symbol: "HT", name: "Heco" },
        wToken: "0x5545153ccfca01fbd7dd11c0b23ba694d9509a6f",
        publicRPCs: ["https://http-mainnet.hecochain.com", "https://pub001.hg.network/rpc"],
        explorer: "https://scan.hecochain.com/",
    },
    OKC: {
        chainId: 66,
        name: "OKC",
        ids: ["okc", "okexchain"],
        nativeCurrency: { symbol: "OKT", name: "OKC Token" },
        wToken: "0x8f8526dbfd6e38e3d8307702ca8469bae6c56c15",
        publicRPCs: ["https://exchainrpc.okex.org"],
        explorer: "https://www.oklink.com/en/okc/",
    },
    MOONRIVER: {
        chainId: 1285,
        name: "Moonriver",
        ids: ["moonriver"],
        nativeCurrency: { symbol: "MOVR", name: "Moonriver" },
        wToken: "0x98878b06940ae243284ca214f92bb71a2b032b8a",
        publicRPCs: ["https://rpc.api.moonriver.moonbeam.network/", "https://moonriver.api.onfinality.io/public"],
        explorer: "https://moonriver.moonscan.io/",
    },
    MOONBEAM: {
        chainId: 1284,
        name: "Moonbeam",
        ids: ["moonbeam"],
        nativeCurrency: { symbol: "GLMR", name: "Moonbeam" },
        wToken: "0xacc15dc74880c9944775448304b263d191c6077f",
        publicRPCs: [
            "https://rpc.api.moonbeam.network",
            "https://rpc.ankr.com/moonbeam",
            "https://moonbeam.public.blastapi.io",
            "https://moonbeam-rpc.dwellir.com",
            "https://endpoints.omniatech.io/v1/moonbeam/mainnet/public",
            "https://1rpc.io/glmr",
            "https://moonbeam.publicnode.com",
        ],
        explorer: "https://moonscan.io/",
    },
    FUSE: {
        chainId: 122,
        name: "Fuse",
        ids: ["fuse"],
        nativeCurrency: { symbol: "FUSE", name: "Fuse" },
        wToken: "0x0be9e53fd7edac9f859882afdda116645287c629",
        publicRPCs: ["https://fuse-pokt.nodies.app", "https://fuse-mainnet.chainstacklabs.com", "https://rpc.fuse.io"],
        explorer: "https://explorer.fuse.io/",
    },
    VELAS: {
        chainId: 106,
        name: "Velas",
        ids: ["velas"],
        nativeCurrency: { symbol: "VLX", name: "Velas" },
        wToken: "0xc579d1f3cf86749e05cd06f7ade17856c2ce3126",
        publicRPCs: ["https://evmexplorer.velas.com/api/eth-rpc", "https://explorer.velas.com/rpc"],
        explorer: "https://explorer.velas.com/",
    },
    GNOSIS: {
        chainId: 100,
        name: "Gnosis Chain",
        ids: ["gnosis", "xdai"],
        nativeCurrency: { symbol: "xDAI", name: "xDAI" },
        wToken: "0xe91d153e0b41518a2ce8dd3d7944fa863463a97d",
        publicRPCs: [
            "https://rpc.gnosischain.com/",
            "https://gnosis-pokt.nodies.app",
            "https://rpc.ankr.com/gnosis",
            "https://xdai-archive.blockscout.com",
            "https://gnosis-mainnet.public.blastapi.io",
            "https://gnosis.blockpi.network/v1/rpc/public",
            "https://rpc.gnosis.gateway.fm",
        ],
        explorer: "https://gnosisscan.io/",
    },
    CRONOS: {
        chainId: 25,
        name: "Cronos",
        ids: ["cronos"],
        nativeCurrency: { symbol: "CRO", name: "Cronos" },
        wToken: "0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23",
        publicRPCs: [
            "https://cronosrpc-1.xstaking.sg",
            "https://evm.cronos.org",
            "https://rpc.vvs.finance",
            "https://evm-cronos.crypto.org",
            "https://cronos.blockpi.network/v1/rpc/public",
            "https://cronos.drpc.org",
            "https://cronos-evm-rpc.publicnode.com",
        ],
        explorer: "https://cronoscan.com/",
    },
    BOBA: {
        chainId: 288,
        name: "Boba Network",
        ids: ["boba"],
        nativeCurrency: { symbol: "ETH", name: "Ethereum" },
        wToken: "0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000",
        publicRPCs: ["https://mainnet.boba.network/", "https://lightning-replica.boba.network"],
        explorer: "https://bobascan.com/",
    },
    ONTOLOGY: {
        chainId: 58,
        name: "Ontology",
        ids: ["ont", "ontology"],
        nativeCurrency: { symbol: "ONG", name: "Ontology Gas" },
        wToken: "0xd8bc24cfd45452ef2c8bc7618e32330b61f2691b",
        publicRPCs: [
            "https://dappnode1.ont.io:10339",
            "https://dappnode2.ont.io:10339",
            "https://dappnode3.ont.io:10339",
            "https://dappnode4.ont.io:10339",
        ],
        explorer: "https://explorer.ont.io/",
    },
    KAIA: {
        chainId: 8217,
        name: "Kaia",
        ids: ["klaytn", "kaia"],
        nativeCurrency: { symbol: "KAIA", name: "Kaia" },
        wToken: "0xe4f05a66ec68b54a58b17c22107b02e0232cc817",
        publicRPCs: [
            "https://public-en-cypress.klaytn.net",
            "https://public-node-api.klaytnapi.com/v1/cypress",
            "https://klaytn-pokt.nodies.app",
            "https://public-en.node.kaia.io",
        ],
        explorer: "https://kaiascan.io/",
    },
    AURORA: {
        chainId: 1313161554,
        name: "Aurora",
        ids: ["aurora"],
        nativeCurrency: { symbol: "ETH", name: "Ethereum" },
        wToken: "0xc9bdeed33cd01541e1eed10f90519d2c06fe3feb",
        publicRPCs: ["https://endpoints.omniatech.io/v1/aurora/mainnet/public", "https://mainnet.aurora.dev"],
        explorer: "https://explorer.mainnet.aurora.dev/",
    },
    ASTAR: {
        chainId: 592,
        name: "Astar",
        ids: ["astar"],
        nativeCurrency: { symbol: "ASTR", name: "Astar" },
        wToken: "0xaeaaf0e2c81af264101b9129c00f4440ccf0f720",
        publicRPCs: [
            "https://evm.astar.network/",
            "https://rpc.astar.network:8545",
            "https://astar.api.onfinality.io/public",
        ],
        explorer: "https://astar.subscan.io/",
    },
    HARMONY_SHARD_0: {
        chainId: 1666600000,
        name: "Harmony",
        ids: ["harmony"],
        nativeCurrency: { symbol: "ONE", name: "Harmony" },
        wToken: "0xcf664087a5bb0237a0bad6742852ec6c8d69a27a",
        publicRPCs: ["https://api.harmony.one", "https://hmyone-pokt.nodies.app"],
        explorer: "https://explorer.harmony.one/",
    },
    BIT_TORRENT: {
        chainId: 199,
        name: "BitTorrent",
        ids: ["bittorrent"],
        nativeCurrency: { symbol: "BTT", name: "BitTorrent" },
        wToken: "0x23181f21dea5936e24163ffaba4ea3b316b57f3c",
        publicRPCs: ["https://rpc.bittorrentchain.io"],
        explorer: "https://bttcscan.com/",
    },
    OASIS_EMERALD: {
        chainId: 42262,
        name: "Oasis Emerald",
        ids: ["oasis", "emerald"],
        nativeCurrency: { symbol: "ROSE", name: "Oasis Network" },
        wToken: "0x21c718c22d52d0f3a789b752d4c2fd5908a8a733",
        publicRPCs: ["https://emerald.oasis.dev"],
        explorer: "https://explorer.emerald.oasis.dev/",
    },
    opBNB: {
        chainId: 204,
        name: "opBNB",
        ids: ["opbnb"],
        nativeCurrency: { symbol: "BNB", name: "BNB" },
        wToken: "0x4200000000000000000000000000000000000006",
        publicRPCs: ["https://1rpc.io/opbnb", "https://opbnb-mainnet-rpc.bnbchain.org", "https://opbnb.publicnode.com"],
        explorer: "https://opbnb.bscscan.com/",
    },
    CANTO: {
        chainId: 7700,
        name: "Canto",
        ids: ["canto"],
        nativeCurrency: { symbol: "CANTO", name: "Canto" },
        wToken: "0x826551890dc65655a0aceca109ab11abdbd7a07b",
        publicRPCs: ["https://mainnode.plexnode.org:8545", "https://canto.slingshot.finance"],
        explorer: "https://evm.explorer.canto.io/",
    },
    EVMOS: {
        chainId: 9001,
        name: "EVMOS",
        ids: ["evmos"],
        nativeCurrency: { symbol: "EVMOS", name: "Evmos" },
        wToken: "0xd4949664cd82660aae99bedc034a0dea8a0bd517",
        publicRPCs: [
            "https://evmos-evm.publicnode.com",
            "https://eth.bd.evmos.org:8545",
            "https://evmos-mainnet.public.blastapi.io",
            "https://evmos-pokt.nodies.app",
        ],
        explorer: "https://escan.live/",
    },
    ROOTSTOCK: {
        chainId: 30,
        name: "Rootstock",
        ids: ["rsk"],
        nativeCurrency: { symbol: "RBTC", name: "RBTC" },
        wToken: "0x542fda317318ebf1d3deaf76e0b632741a7e677d",
        publicRPCs: ["https://public-node.rsk.co"],
        explorer: "https://rootstock.blockscout.com/",
    },
    POLYGON_ZKEVM: {
        chainId: 1101,
        name: "Polygon zkEVM",
        ids: ["polygon-zkevm"],
        nativeCurrency: { symbol: "ETH", name: "Ethereum" },
        wToken: "0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9",
        publicRPCs: [
            "https://zkevm-rpc.com",
            "https://rpc.ankr.com/polygon_zkevm",
            "https://rpc.polygon-zkevm.gateway.fm",
        ],
        explorer: "https://zkevm.polygonscan.com/",
    },
    KAVA: {
        chainId: 2222,
        name: "Kava",
        ids: ["kava"],
        nativeCurrency: { symbol: "KAVA", name: "Kava" },
        wToken: "0xc86c7c0efbd6a49b35e8714c5f59d99de09a225b",
        publicRPCs: [
            "https://evm.kava.io",
            "https://evm2.kava.io",
            "https://kava-pokt.nodies.app",
            "https://kava-evm-rpc.publicnode.com",
            "https://kava.drpc.org",
            "https://evm.kava-rpc.com",
        ],
        explorer: "https://explorer.kava.io/",
    },
    LINEA: {
        chainId: 59144,
        name: "Linea",
        ids: ["linea"],
        nativeCurrency: { symbol: "ETH", name: "Ethereum" },
        wToken: "0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f",
        publicRPCs: [
            "https://rpc.linea.build",
            "https://1rpc.io/linea",
            "https://linea.blockpi.network/v1/rpc/public",
            "https://linea.drpc.org",
        ],
        explorer: "https://lineascan.build/",
    },
    MODE: {
        chainId: 34443,
        name: "Mode",
        ids: ["mode"],
        nativeCurrency: { symbol: "ETH", name: "Ethereum" },
        wToken: "0x4200000000000000000000000000000000000006",
        publicRPCs: ["https://mainnet.mode.network", "https://1rpc.io/mode"],
        explorer: "https://explorer.mode.network/",
    },
    BLAST: {
        chainId: 81457,
        name: "Blast",
        ids: ["blast"],
        nativeCurrency: { symbol: "ETH", name: "Ethereum" },
        wToken: "0x4300000000000000000000000000000000000004",
        publicRPCs: [
            "https://rpc.blast.io",
            "https://rpc.ankr.com/blast",
            "https://blast.din.dev/rpc",
            "https://blastl2-mainnet.public.blastapi.io",
            "https://blast.blockpi.network/v1/rpc/public",
        ],
        explorer: "https://blastscan.io/",
    },
    SCROLL: {
        chainId: 534352,
        name: "Scroll",
        ids: ["scroll"],
        nativeCurrency: { symbol: "ETH", name: "Ethereum" },
        wToken: "0x5300000000000000000000000000000000000004",
        publicRPCs: [
            "https://scroll-mainnet.chainstacklabs.com",
            "https://rpc.ankr.com/scroll",
            "https://rpc.scroll.io",
            "https://1rpc.io/scroll",
        ],
        explorer: "https://scrollscan.com/",
    },
    MANTLE: {
        chainId: 5000,
        name: "Mantle",
        ids: ["mantle"],
        nativeCurrency: { symbol: "MNT", name: "Mantle" },
        wToken: "0x78c1b0c915c4faa5fffa6cabf0219da63d7f4cb8",
        publicRPCs: ["https://rpc.mantle.xyz", "https://rpc.ankr.com/mantle", "https://mantle.drpc.org"],
        explorer: "https://explorer.mantle.xyz/",
    },
    ETHEREUM_GOERLI: {
        chainId: 5,
        name: "Ethereum Goerli",
        ids: ["goerli"],
        nativeCurrency: { symbol: "ETH", name: "Ethereum" },
        wToken: "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6",
        publicRPCs: ["https://rpc.ankr.com/eth_goerli", "https://goerli.blockpi.network/v1/rpc/public"],
        explorer: "https://goerli.etherscan.io/",
        testnet: true,
    },
    ETHEREUM_SEPOLIA: {
        chainId: 11155111,
        name: "Ethereum Sepolia",
        ids: ["sepolia"],
        nativeCurrency: { symbol: "ETH", name: "Ethereum" },
        wToken: "0xf531b8f309be94191af87605cfbf600d71c2cfe0",
        publicRPCs: ["https://rpc.sepolia.org"],
        explorer: "https://sepolia.etherscan.io/",
        testnet: true,
    },
    POLYGON_MUMBAI: {
        chainId: 80001,
        name: "Polygon Mumbai",
        ids: ["mumbai"],
        nativeCurrency: { symbol: "POL", name: "Polygon Ecosystem Token" },
        wToken: "0x9c3c9283d3e44854697cd22d3faa240cfb032889",
        publicRPCs: [
            "https://rpc.ankr.com/polygon_mumbai",
            "https://polygon-mumbai.blockpi.network/v1/rpc/public",
            "https://polygon-mumbai-pokt.nodies.app",
        ],
        explorer: "https://mumbai.polygonscan.com/",
        testnet: true,
    },
    BASE_GOERLI: {
        chainId: 84531,
        name: "Base Goerli",
        ids: ["base-goerli"],
        nativeCurrency: { symbol: "ETH", name: "Ethereum" },
        wToken: "0x4200000000000000000000000000000000000006",
        publicRPCs: [
            "https://goerli.base.org",
            "https://base-goerli.public.blastapi.io",
            "https://base-goerli.blockpi.network/v1/rpc/public",
            "https://endpoints.omniatech.io/v1/base/goerli/public",
            "https://base-goerli.gateway.tenderly.co",
        ],
        explorer: "https://goerli.basescan.org/",
        testnet: true,
    },
};

const SUPPORTED_CHAIN_IDS = [
    1, // Ethereum
    10, // Optimism
    42161, // Arbitrum
    42170, // Arbitrum Nova
    137, // Polygon
    56, // BNB Chain
    8453, // Base
    250, // Fantom
    42220, // Celo
    1088, // Metis
    43114, // Avalanche
    128, // Heco
    66, // OKC
    1285, // Moonriver
    1284, // Moonbeam
    122, // Fuse
    106, // Velas
    100, // Gnosis
    25, // Cronos
    288, // Boba
    58, // Ontology
    8217, // Kaia
    1313161554, // Aurora
    592, // Astar
    1666600000, // Harmony
    199, // BitTorrent
    42262, // Oasis
    204, // opBNB
    7700, // Canto
    9001, // Evmos
    30, // Rootstock
    1101, // Polygon zkEVM
    2222, // Kava
    59144, // Linea
    34443, // Mode
    81457, // Blast
    534352, // Scroll
    5000, // Mantle
    // Testnets
    5, // Goerli
    11155111, // Sepolia
    80001, // Mumbai
    84531, // Base Goerli
];

const DEFAULT_CONFIG = {
    quotes: {
        sourceList: {
            type: "local" as const,
        },
        defaultConfig: {
            global: {
                slippagePercentage: 0.5,
                txValidFor: "180s",
                disableValidation: true,
            },
            custom: {
                bebop: { enabled: false, apiKey: "" },
                "0x": { enabled: true, apiKey: "", baseUrl: "https://api.0x.org" },
                "li-fi": { apiKey: "" },
                paraswap: { enabled: false, sourceAllowlist: [], sourceDenylist: [] },
                "1inch": { enabled: false, customUrl: "", sourceAllowlist: [] },
            },
        },
    },
    provider: {
        source: {
            type: "http" as const,
            url: "", // Will be set dynamically
            supportedChains: SUPPORTED_CHAIN_IDS,
        },
        defaultConfig: {
            chainId: 1, // Will be set dynamically
            rpcUrl: "", // Will be set dynamically
        },
    },
};

export class BalmyPlugin extends PluginBase {
    private balmyService: BalmyService;

    constructor() {
        const service = new BalmyService(DEFAULT_CONFIG);
        super("balmy", [service]);
        this.balmyService = service;
    }

    supportsChain = (chain: Chain) => {
        if (chain.type !== "evm" || !SUPPORTED_CHAIN_IDS.includes(chain.id)) {
            return false;
        }

        // Update config with chain-specific RPC URL
        const rpcUrl = this.getRpcUrlForChain(chain.id);
        if (!rpcUrl) return false;

        this.updateConfig(chain.id, rpcUrl);
        return true;
    };

    private getRpcUrlForChain(chainId: number): string | undefined {
        // Get RPC URL from the Chains data
        const chain = Object.values(Chains).find((c) => c.chainId === chainId);
        return chain?.publicRPCs[0];
    }

    private updateConfig(chainId: number, rpcUrl: string) {
        const config = {
            ...DEFAULT_CONFIG,
            provider: {
                ...DEFAULT_CONFIG.provider,
                source: {
                    ...DEFAULT_CONFIG.provider.source,
                    url: rpcUrl,
                    supportedChains: [chainId],
                },
                defaultConfig: {
                    chainId,
                    rpcUrl,
                },
            },
        };

        this.balmyService = new BalmyService(config);
    }
}

export function balmy() {
    return new BalmyPlugin();
}
