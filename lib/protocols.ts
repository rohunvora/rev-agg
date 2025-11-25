/**
 * Protocol configurations with buyback source explanations
 * 
 * To add a new protocol:
 * 1. Add entry to PROTOCOLS array below
 * 2. Ensure the slug matches DefiLlama's protocol slug
 * 3. Ensure the geckoId matches CoinGecko's coin ID
 */

import { ProtocolConfig } from './types';

export type { ProtocolConfig };

export const PROTOCOLS: ProtocolConfig[] = [
  {
    slug: 'hyperliquid',
    name: 'Hyperliquid',
    symbol: 'HYPE',
    geckoId: 'hyperliquid',
    buybackSource: 'Perpetual trading fees (0.02-0.05% per trade)',
    businessModel: 'Decentralized perpetuals exchange. 99% of trading fees go to the Assistance Fund which buys HYPE tokens. Higher trading volume = more buybacks.',
    growthDrivers: 'Perp DEX market share growth, new trading pairs, increased leverage demand, bear/bull market volatility',
    risks: 'Competition from other perp DEXs, regulatory risk, smart contract risk, market downturn reducing volume',
  },
  {
    slug: 'pump.fun',
    name: 'pump.fun',
    symbol: 'PUMP',
    geckoId: 'pump-fun',
    buybackSource: 'Token launch fees (1% of bonding curve) + trading fees',
    businessModel: 'Memecoin launchpad on Solana. Charges 1% on bonding curve trades. Protocol revenue used to buy back PUMP tokens.',
    growthDrivers: 'Memecoin speculation cycles, Solana ecosystem growth, new features, market euphoria',
    risks: 'Memecoin fatigue, competition from other launchpads, Solana network issues, regulatory scrutiny',
  },
  {
    slug: 'aerodrome',
    name: 'Aerodrome',
    symbol: 'AERO',
    geckoId: 'aerodrome-finance',
    buybackSource: 'DEX trading fees (0.3% swaps)',
    businessModel: 'Primary DEX on Base chain. Trading fees distributed to veAERO lockers weekly. More Base activity = more fees.',
    growthDrivers: 'Base ecosystem growth, Coinbase integration, new liquidity pairs, L2 adoption',
    risks: 'Competition on Base, Uniswap v4, liquidity fragmentation, Base growth stalling',
  },
  {
    slug: 'curve-dex',
    name: 'Curve',
    symbol: 'CRV',
    geckoId: 'curve-dao-token',
    buybackSource: 'Stablecoin/pegged asset swap fees (0.04%)',
    businessModel: 'Dominant stablecoin DEX. Low fees but massive volume. Fees to veCRV holders. Critical DeFi infrastructure.',
    growthDrivers: 'Stablecoin growth, RWA tokenization, new pegged assets, institutional DeFi',
    risks: 'Stablecoin depegs, competition, founder token unlocks, governance attacks',
  },
  {
    slug: 'aave',
    name: 'Aave',
    symbol: 'AAVE',
    geckoId: 'aave',
    buybackSource: 'Lending protocol interest spread',
    businessModel: 'Largest DeFi lending protocol. Takes spread between borrow/lend rates. DAO uses treasury to buy back AAVE.',
    growthDrivers: 'DeFi lending growth, GHO stablecoin adoption, new chains, institutional lending',
    risks: 'Bad debt events, competition from new lending protocols, regulatory risk',
  },
  {
    slug: 'pendle',
    name: 'Pendle',
    symbol: 'PENDLE',
    geckoId: 'pendle',
    buybackSource: 'Yield trading fees (3% of yield)',
    businessModel: 'Yield tokenization protocol. Splits yield-bearing assets into principal + yield tokens. Takes 3% of yield generated.',
    growthDrivers: 'Points/airdrop meta, new yield sources, institutional yield strategies, restaking growth',
    risks: 'Points meta ending, yield compression, smart contract risk, complexity limiting adoption',
  },
  {
    slug: 'raydium',
    name: 'Raydium',
    symbol: 'RAY',
    geckoId: 'raydium',
    buybackSource: 'AMM trading fees (0.25%, 12% to buyback)',
    businessModel: 'Primary AMM on Solana. 12% of trading fees used to buy and burn RAY. Benefits from all Solana DEX activity.',
    growthDrivers: 'Solana ecosystem growth, memecoin trading, new pools, Jupiter integration',
    risks: 'Orca competition, Solana network issues, liquidity migration',
  },
  {
    slug: 'gmx',
    name: 'GMX',
    symbol: 'GMX',
    geckoId: 'gmx',
    buybackSource: 'Perpetual trading fees (0.1% open/close)',
    businessModel: 'Perp DEX on Arbitrum/Avalanche. 30% of fees to GMX stakers, 70% to liquidity providers.',
    growthDrivers: 'Arbitrum growth, new trading pairs, v2 adoption, cross-chain expansion',
    risks: 'Hyperliquid competition, liquidity provider losses, smart contract risk',
  },
  {
    slug: 'dydx',
    name: 'dYdX',
    symbol: 'DYDX',
    geckoId: 'dydx-chain',
    buybackSource: 'Perpetual trading fees',
    businessModel: 'Decentralized perp exchange with own L1 chain. Trading fees distributed to DYDX stakers.',
    growthDrivers: 'Own chain adoption, institutional traders, new markets, MegaVault',
    risks: 'Competition from Hyperliquid, chain adoption challenges, token inflation',
  },
  {
    slug: 'pancakeswap-amm',
    name: 'PancakeSwap',
    symbol: 'CAKE',
    geckoId: 'pancakeswap-token',
    buybackSource: 'DEX trading fees (0.25%)',
    businessModel: 'Largest DEX on BNB Chain. Trading fees used to buy and burn CAKE weekly.',
    growthDrivers: 'BNB Chain growth, multi-chain expansion, new features',
    risks: 'BNB Chain declining, competition, token inflation from farms',
  },
  {
    slug: 'sushiswap',
    name: 'SushiSwap',
    symbol: 'SUSHI',
    geckoId: 'sushi',
    buybackSource: 'DEX trading fees (0.3%, 0.05% to xSUSHI)',
    businessModel: 'Multi-chain DEX. 0.05% of all trades to xSUSHI stakers.',
    growthDrivers: 'Multi-chain presence, new products, Route Processor',
    risks: 'Declining market share, team instability, competition',
  },
  {
    slug: 'ether.fi',
    name: 'ether.fi',
    symbol: 'ETHFI',
    geckoId: 'ether-fi',
    buybackSource: 'Liquid restaking fees (10% of restaking rewards)',
    businessModel: 'Largest liquid restaking protocol. Takes 10% of EigenLayer + AVS rewards. Distributed to ETHFI holders.',
    growthDrivers: 'EigenLayer AVS launches, restaking adoption, new AVS integrations',
    risks: 'EigenLayer risks, restaking yield compression, competition from Renzo/Kelp',
  },
  {
    slug: 'quickswap-dex',
    name: 'QuickSwap',
    symbol: 'QUICK',
    geckoId: 'quickswap',
    buybackSource: 'DEX trading fees on Polygon',
    businessModel: 'Primary DEX on Polygon. Fees distributed to QUICK stakers.',
    growthDrivers: 'Polygon growth, new chains, DragonFi products',
    risks: 'Polygon declining TVL, competition, Uniswap on Polygon',
  },
  {
    slug: 'orca',
    name: 'Orca',
    symbol: 'ORCA',
    geckoId: 'orca',
    buybackSource: 'Concentrated liquidity trading fees',
    businessModel: 'Concentrated liquidity DEX on Solana. Protocol fees to ORCA stakers.',
    growthDrivers: 'Solana DeFi growth, Whirlpools adoption, institutional LPs',
    risks: 'Raydium competition, Solana network issues',
  },
  {
    slug: 'velodrome-v2',
    name: 'Velodrome',
    symbol: 'VELO',
    geckoId: 'velodrome-finance',
    buybackSource: 'DEX trading fees on Optimism',
    businessModel: 'Primary DEX on Optimism. ve(3,3) model - fees to veVELO lockers.',
    growthDrivers: 'Optimism growth, new gauge votes, protocol integrations',
    risks: 'Optimism growth stalling, Aerodrome cannibalizing attention',
  },
  {
    slug: 'camelot-v3',
    name: 'Camelot',
    symbol: 'GRAIL',
    geckoId: 'camelot-token',
    buybackSource: 'DEX trading fees on Arbitrum',
    businessModel: 'Native DEX on Arbitrum. Fees to xGRAIL stakers and liquidity providers.',
    growthDrivers: 'Arbitrum native projects, launchpad deals, new pools',
    risks: 'Competition from Uniswap/Sushi on Arbitrum, GMX integration',
  },
  {
    slug: 'thena-v2',
    name: 'Thena',
    symbol: 'THE',
    geckoId: 'thena',
    buybackSource: 'DEX trading fees on BNB Chain',
    businessModel: 'Ve(3,3) DEX on BNB Chain. Fees distributed to veTHE lockers.',
    growthDrivers: 'BNB Chain DeFi growth, bribe revenue, new pools',
    risks: 'PancakeSwap dominance, BNB Chain declining activity',
  },
  {
    slug: 'banana-gun-trading',
    name: 'Banana Gun',
    symbol: 'BANANA',
    geckoId: 'banana-gun',
    buybackSource: 'Telegram bot trading fees (0.5-1%)',
    businessModel: 'Telegram trading bot for sniping tokens. 40% of fees to buyback and burn BANANA.',
    growthDrivers: 'Memecoin trading volume, new chain support, bot features',
    risks: 'Bot competition (Maestro, Trojan), memecoin fatigue, Telegram risks',
  },
  {
    slug: 'unibot',
    name: 'Unibot',
    symbol: 'UNIBOT',
    geckoId: 'unibot',
    buybackSource: 'Telegram bot trading fees',
    businessModel: 'Early Telegram trading bot. Fees distributed to UNIBOT holders.',
    growthDrivers: 'New features, chain expansion',
    risks: 'Lost market share to Banana Gun/Maestro, declining volume',
  },
  {
    slug: 'maker',
    name: 'Maker (Sky)',
    symbol: 'MKR',
    geckoId: 'maker',
    buybackSource: 'DAI stability fees (interest on CDP loans)',
    businessModel: 'Issues DAI stablecoin. Charges stability fees on loans. Surplus used to buy and burn MKR via Smart Burn Engine.',
    growthDrivers: 'DAI supply growth, RWA adoption, new collateral types, Sky rebrand',
    risks: 'DAI depeg risk, regulatory pressure, competition from other stablecoins',
  },
];

/**
 * Get protocol by slug
 */
export function getProtocol(slug: string): ProtocolConfig | undefined {
  return PROTOCOLS.find(p => p.slug === slug);
}

/**
 * Get all CoinGecko IDs for batch price fetching
 */
export function getAllGeckoIds(): string[] {
  return PROTOCOLS.map(p => p.geckoId).filter(Boolean);
}
