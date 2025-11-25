/**
 * Protocols with VERIFIED BUYBACK mechanisms
 * 
 * Only includes protocols that actively purchase their own token
 * from the open market using protocol revenue.
 * 
 * EXCLUDED: ve-token models, staking distributions, fee sharing
 * (Curve, GMX, dYdX, Pendle, Aerodrome, Velodrome, etc.)
 */

import { ProtocolConfig } from './types';

export type { ProtocolConfig };

export const PROTOCOLS: ProtocolConfig[] = [
  {
    slug: 'hyperliquid-perps',
    name: 'Hyperliquid',
    symbol: 'HYPE',
    geckoId: 'hyperliquid',
    buybackSource: 'Perpetual trading fees (0.02-0.05% per trade)',
    businessModel: 'Decentralized perpetuals exchange. 99% of trading fees go to the Assistance Fund which buys HYPE tokens from the open market.',
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
    slug: 'ore-protocol',
    name: 'ORE',
    symbol: 'ORE',
    geckoId: 'ore',
    buybackSource: 'Mining protocol fees',
    businessModel: 'Proof-of-work mining protocol on Solana. Protocol fees used to buy back ORE tokens.',
    growthDrivers: 'Mining adoption, Solana ecosystem, token utility',
    risks: 'Mining profitability, competition, Solana network issues',
  },
  {
    slug: 'sky-lending',
    name: 'Maker (Sky)',
    symbol: 'MKR',
    geckoId: 'maker',
    buybackSource: 'DAI stability fees (interest on CDP loans)',
    businessModel: 'Issues DAI stablecoin. Charges stability fees on loans. Surplus used to buy and burn MKR via Smart Burn Engine.',
    growthDrivers: 'DAI supply growth, RWA adoption, new collateral types, Sky rebrand',
    risks: 'DAI depeg risk, regulatory pressure, competition from other stablecoins',
  },
  {
    slug: 'aave-v3',
    name: 'Aave',
    symbol: 'AAVE',
    geckoId: 'aave',
    buybackSource: 'Lending protocol interest spread',
    businessModel: 'Largest DeFi lending protocol. Takes spread between borrow/lend rates. Treasury buys AAVE from market for safety module.',
    growthDrivers: 'DeFi lending growth, GHO stablecoin adoption, new chains, institutional lending',
    risks: 'Bad debt events, competition from new lending protocols, regulatory risk',
  },
  {
    slug: 'raydium-amm',
    name: 'Raydium',
    symbol: 'RAY',
    geckoId: 'raydium',
    buybackSource: 'AMM trading fees (0.25%, 12% to buyback)',
    businessModel: 'Primary AMM on Solana. 12% of trading fees used to buy and burn RAY from the open market.',
    growthDrivers: 'Solana ecosystem growth, memecoin trading, new pools, Jupiter integration',
    risks: 'Orca competition, Solana network issues, liquidity migration',
  },
  {
    slug: 'pancakeswap-amm-v3',
    name: 'PancakeSwap',
    symbol: 'CAKE',
    geckoId: 'pancakeswap-token',
    buybackSource: 'DEX trading fees (0.25%)',
    businessModel: 'Largest DEX on BNB Chain. Trading fees used to buy and burn CAKE weekly from the open market.',
    growthDrivers: 'BNB Chain growth, multi-chain expansion, new features',
    risks: 'BNB Chain declining, competition, token inflation from farms',
  },
  {
    slug: 'sushiswap',
    name: 'SushiSwap',
    symbol: 'SUSHI',
    geckoId: 'sushi',
    buybackSource: 'DEX trading fees (0.3%, 0.05% to xSUSHI)',
    businessModel: 'Multi-chain DEX. 0.05% of all trades used to buy SUSHI from market and add to xSUSHI pool.',
    growthDrivers: 'Multi-chain presence, new products, Route Processor',
    risks: 'Declining market share, team instability, competition',
  },
  {
    slug: 'banana-gun-trading',
    name: 'Banana Gun',
    symbol: 'BANANA',
    geckoId: 'banana-gun',
    buybackSource: 'Telegram bot trading fees (0.5-1%)',
    businessModel: 'Telegram trading bot for sniping tokens. 40% of fees used to buy and burn BANANA from the open market.',
    growthDrivers: 'Memecoin trading volume, new chain support, bot features',
    risks: 'Bot competition (Maestro, Trojan), memecoin fatigue, Telegram risks',
  },
  {
    slug: 'helium-network',
    name: 'Helium',
    symbol: 'HNT',
    geckoId: 'helium',
    buybackSource: 'Network fees + Helium Mobile subscriber revenue',
    businessModel: 'Decentralized wireless network. HNT burned when converted to Data Credits. Network fees and mobile subscriber revenue fund buyback & burn program.',
    growthDrivers: 'IoT adoption, Helium Mobile growth, 5G expansion, enterprise partnerships',
    risks: 'Network adoption rates, competition from traditional telecom, hardware requirements',
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
