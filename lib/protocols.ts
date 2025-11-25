/**
 * Protocols with VERIFIED BUYBACK mechanisms
 * 
 * Only includes protocols that actively purchase their own token
 * from the open market using protocol revenue.
 * 
 * EXCLUDED: ve-token models, staking distributions, fee sharing
 * (Curve, GMX, dYdX, Pendle, Aerodrome, Velodrome, SushiSwap, etc.)
 */

import { ProtocolConfig } from './types';

export type { ProtocolConfig };

export const PROTOCOLS: ProtocolConfig[] = [
  {
    slug: 'hyperliquid-perps',
    name: 'Hyperliquid',
    symbol: 'HYPE',
    geckoId: 'hyperliquid',
    buybackSource: 'Perpetual trading fees',
    buybackPct: '97-99% of fees',
    businessModel: 'Decentralized perpetuals exchange. 99% of trading fees go to the Assistance Fund which buys HYPE from the open market.',
    growthDrivers: 'Perp DEX market share growth, new trading pairs, leverage demand',
    risks: 'Competition from other perp DEXs, regulatory risk, market downturn',
    verifyUrl: 'https://stats.hyperliquid.xyz/',
  },
  {
    slug: 'pump.fun',
    name: 'pump.fun',
    symbol: 'PUMP',
    geckoId: 'pump-fun',
    buybackSource: 'Token launch fees (1% bonding curve)',
    buybackPct: '~98% of revenue',
    businessModel: 'Memecoin launchpad on Solana. Charges 1% on bonding curve trades. Revenue used to buy and burn PUMP.',
    growthDrivers: 'Memecoin cycles, Solana growth, market euphoria',
    risks: 'Memecoin fatigue, launchpad competition, regulatory scrutiny',
    notes: ['Team has sold >$400M USDC', '18% supply to private investors'],
    verifyUrl: 'https://solscan.io/account/CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM',
  },
  {
    slug: 'ore-protocol',
    name: 'ORE',
    symbol: 'ORE',
    geckoId: 'ore',
    buybackSource: 'Mining protocol fees (10% of SOL)',
    buybackPct: '10% of mining revenue',
    businessModel: 'Proof-of-work mining on Solana. 10% of SOL mining fees buy ORE: 90% burned, 10% to stakers.',
    growthDrivers: 'Mining adoption, Solana ecosystem, token utility',
    risks: 'Mining profitability, competition, Solana network issues',
    notes: ['Max supply capped at 5M ORE', '90% of buyback is burned, 10% to stakers'],
    verifyUrl: 'https://ore.supply/',
  },
  {
    slug: 'sky-lending',
    name: 'Maker (Sky)',
    symbol: 'MKR',
    geckoId: 'maker',
    buybackSource: 'DAI stability fees',
    buybackPct: 'Surplus above ~$50M buffer',
    businessModel: 'Issues DAI stablecoin. Stability fees accumulate in surplus buffer. Excess used to buy and burn MKR via Smart Burn Engine.',
    growthDrivers: 'DAI supply growth, RWA adoption, Sky rebrand',
    risks: 'DAI depeg risk, regulatory pressure, stablecoin competition',
    notes: ['Only burns when surplus exceeds buffer threshold'],
    verifyUrl: 'https://makerburn.com/',
  },
  {
    slug: 'aave-v3',
    name: 'Aave',
    symbol: 'AAVE',
    geckoId: 'aave',
    buybackSource: 'Lending protocol spread',
    buybackPct: '~$1M/week (~$50M/yr)',
    businessModel: 'Largest DeFi lending protocol. Treasury commits to weekly AAVE buybacks from market.',
    growthDrivers: 'DeFi lending growth, GHO adoption, institutional lending',
    risks: 'Bad debt events, lending competition, regulatory risk',
    notes: ['Fixed weekly amount, not % of revenue', 'Has token emissions for rewards'],
    verifyUrl: 'https://aave.com/governance',
  },
  {
    slug: 'raydium-amm',
    name: 'Raydium',
    symbol: 'RAY',
    geckoId: 'raydium',
    buybackSource: 'AMM trading fees',
    buybackPct: '12% of trading fees',
    businessModel: 'Primary AMM on Solana. 12% of 0.25% trading fees used to buy and burn RAY.',
    growthDrivers: 'Solana ecosystem growth, memecoin trading, Jupiter integration',
    risks: 'Orca competition, Solana issues, liquidity migration',
    notes: ['Only 12% of fees go to buybacks', 'Has liquidity mining emissions'],
    verifyUrl: 'https://raydium.io/swap/',
  },
  {
    slug: 'pancakeswap-amm-v3',
    name: 'PancakeSwap',
    symbol: 'CAKE',
    geckoId: 'pancakeswap-token',
    buybackSource: 'DEX trading fees',
    buybackPct: 'Variable (weekly burns)',
    businessModel: 'Largest DEX on BNB Chain. Trading fees buy and burn CAKE weekly.',
    growthDrivers: 'BNB Chain growth, multi-chain expansion',
    risks: 'BNB Chain declining, competition, farm emissions',
    notes: ['High farm emissions may offset burns', 'Check net inflation on their dashboard'],
    verifyUrl: 'https://pancakeswap.finance/info',
  },
  {
    slug: 'banana-gun-trading',
    name: 'Banana Gun',
    symbol: 'BANANA',
    geckoId: 'banana-gun',
    buybackSource: 'Telegram bot trading fees',
    buybackPct: '40% of fees',
    businessModel: 'Telegram trading bot. 40% of fees used to buy and burn BANANA from market.',
    growthDrivers: 'Memecoin trading volume, new chain support, bot features',
    risks: 'Bot competition (Maestro, Trojan), memecoin fatigue',
    verifyUrl: 'https://bananagun.io/',
  },
  {
    slug: 'helium-network',
    name: 'Helium',
    symbol: 'HNT',
    geckoId: 'helium',
    buybackSource: 'Helium Mobile subscriber revenue',
    buybackPct: '100% of Mobile revenue',
    businessModel: 'Decentralized wireless network. 100% of Helium Mobile subscription revenue buys and burns HNT daily.',
    growthDrivers: 'IoT adoption, Helium Mobile growth, 5G expansion',
    risks: 'Telecom competition, network adoption rates',
    notes: ['HNT mining emissions may offset buybacks', 'Data credits also burn HNT'],
    verifyUrl: 'https://explorer.helium.com/',
  },
  {
    slug: 'jupiter-perps',
    name: 'Jupiter',
    symbol: 'JUP',
    geckoId: 'jupiter-exchange-solana',
    buybackSource: 'Perp + aggregator fees',
    buybackPct: '50% of revenue',
    businessModel: 'Solana\'s top DEX aggregator and perps exchange. 50% of protocol revenue buys and burns JUP.',
    growthDrivers: 'Solana DeFi dominance, perps growth, launchpad',
    risks: 'Solana ecosystem risk, competition',
    notes: ['Large token unlock schedule ongoing', 'Dilution from unlocks'],
    verifyUrl: 'https://www.jup.ag/',
  },
  {
    slug: 'letsbonk.fun',
    name: 'BONK (letsBONK)',
    symbol: 'BONK',
    geckoId: 'bonk',
    buybackSource: 'letsBONK.fun launchpad fees',
    buybackPct: '50% of launchpad fees',
    businessModel: 'Solana memecoin with dedicated launchpad. 50% of letsBONK.fun fees buy and burn BONK.',
    growthDrivers: 'Memecoin cycles, launchpad volume, Solana growth',
    risks: 'Memecoin volatility, launchpad competition',
    notes: ['Only from letsBONK.fun activity', 'Not all BONK trading generates buybacks'],
    verifyUrl: 'https://letsbonk.fun/',
  },
  {
    slug: 'apex-omni',
    name: 'ApeX',
    symbol: 'APEX',
    geckoId: 'apex-token-2',
    buybackSource: 'Perp trading fees',
    buybackPct: '~$50K/week fixed',
    businessModel: 'Multi-chain perpetuals DEX. Weekly automated buybacks from market.',
    growthDrivers: 'Perp DEX adoption, multi-chain expansion',
    risks: 'Perp DEX competition, liquidity fragmentation',
    notes: ['Fixed weekly amount, not % of revenue'],
    verifyUrl: 'https://www.apex.exchange/',
  },
  {
    slug: 'graphite-protocol',
    name: 'Graphite',
    symbol: 'GP',
    geckoId: 'graphite-protocol',
    buybackSource: 'letsBONK.fun revenue share',
    buybackPct: '7.6% of partner fees',
    businessModel: 'Receives portion of letsBONK.fun fees. Aggressive DCA buyback to accumulate and burn GP.',
    growthDrivers: 'letsBONK.fun volume, BONK ecosystem',
    risks: 'Dependency on letsBONK, small market cap, liquidity',
    notes: ['Team retains mint authority', 'Dependent on letsBONK volume'],
    verifyUrl: 'https://graphiteprotocol.com/',
  },
  {
    slug: 'launch-coin-on-believe',
    name: 'Believe',
    symbol: 'BELIEVE',
    geckoId: 'ben-pasternak',
    buybackSource: 'Launchpad trading fees',
    buybackPct: 'Portion of 50% platform fee',
    businessModel: 'Memecoin launchpad. Platform takes 50% of fees, portion used for buybacks.',
    growthDrivers: 'Launchpad adoption, memecoin cycles',
    risks: 'Low current volume, platform history, competition',
    notes: ['Very low volume currently', 'Exact buyback % unclear'],
    verifyUrl: 'https://believe.app/',
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
