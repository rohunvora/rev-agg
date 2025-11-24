// DefiLlama API integration for ACTUAL buyback/holders revenue data

const DEFILLAMA_API = 'https://api.llama.fi';

// Protocols known to have buyback/distribution mechanisms
// We fetch dailyHoldersRevenue which is the ACTUAL amount going to token holders
export const PROTOCOL_CONFIG: Record<string, {
  name: string;
  symbol: string;
  geckoId: string;
  mechanism: string;
  description: string;
}> = {
  'hyperliquid': {
    name: 'Hyperliquid',
    symbol: 'HYPE',
    geckoId: 'hyperliquid',
    mechanism: 'buyback',
    description: '99% of perp fees → HYPE buybacks via Assistance Fund',
  },
  'pump.fun': {
    name: 'pump.fun',
    symbol: 'PUMP',
    geckoId: 'pump-fun',
    mechanism: 'buyback',
    description: 'Protocol revenue used for PUMP token buybacks',
  },
  'aerodrome': {
    name: 'Aerodrome',
    symbol: 'AERO',
    geckoId: 'aerodrome-finance',
    mechanism: 'distribute',
    description: 'Trading fees distributed to veAERO lockers',
  },
  'curve-dex': {
    name: 'Curve',
    symbol: 'CRV',
    geckoId: 'curve-dao-token',
    mechanism: 'distribute',
    description: 'Trading fees distributed to veCRV holders',
  },
  'aave': {
    name: 'Aave',
    symbol: 'AAVE',
    geckoId: 'aave',
    mechanism: 'buyback',
    description: 'Protocol revenue used for AAVE buybacks',
  },
  'ether.fi': {
    name: 'ether.fi',
    symbol: 'ETHFI',
    geckoId: 'ether-fi',
    mechanism: 'distribute',
    description: 'Restaking revenue distributed to token holders',
  },
  'pendle': {
    name: 'Pendle',
    symbol: 'PENDLE',
    geckoId: 'pendle',
    mechanism: 'distribute',
    description: 'Protocol fees distributed to vePENDLE holders',
  },
  'raydium': {
    name: 'Raydium',
    symbol: 'RAY',
    geckoId: 'raydium',
    mechanism: 'buyback-burn',
    description: '12% of trading fees → RAY buyback and burn',
  },
  'gmx': {
    name: 'GMX',
    symbol: 'GMX',
    geckoId: 'gmx',
    mechanism: 'distribute',
    description: '30% of trading fees distributed to GMX stakers',
  },
  'dydx': {
    name: 'dYdX',
    symbol: 'DYDX',
    geckoId: 'dydx-chain',
    mechanism: 'distribute',
    description: 'Trading fees distributed to DYDX stakers',
  },
  'sushiswap': {
    name: 'SushiSwap',
    symbol: 'SUSHI',
    geckoId: 'sushi',
    mechanism: 'distribute',
    description: 'Trading fees distributed to xSUSHI holders',
  },
  'pancakeswap-amm': {
    name: 'PancakeSwap',
    symbol: 'CAKE',
    geckoId: 'pancakeswap-token',
    mechanism: 'buyback-burn',
    description: 'Trading fees used to buy and burn CAKE',
  },
  'quickswap-dex': {
    name: 'QuickSwap',
    symbol: 'QUICK',
    geckoId: 'quickswap',
    mechanism: 'distribute',
    description: 'Trading fees distributed to QUICK stakers',
  },
  'orca': {
    name: 'Orca',
    symbol: 'ORCA',
    geckoId: 'orca',
    mechanism: 'distribute',
    description: 'Trading fees distributed to ORCA stakers',
  },
  'velodrome-v2': {
    name: 'Velodrome',
    symbol: 'VELO',
    geckoId: 'velodrome-finance',
    mechanism: 'distribute',
    description: 'Trading fees distributed to veVELO lockers',
  },
  'camelot-v3': {
    name: 'Camelot',
    symbol: 'GRAIL',
    geckoId: 'camelot-token',
    mechanism: 'distribute',
    description: 'Trading fees distributed to xGRAIL holders',
  },
  'thena-v2': {
    name: 'Thena',
    symbol: 'THE',
    geckoId: 'thena',
    mechanism: 'distribute',
    description: 'Trading fees distributed to veTHE lockers',
  },
  'trader-joe': {
    name: 'Trader Joe',
    symbol: 'JOE',
    geckoId: 'joe',
    mechanism: 'distribute',
    description: 'Trading fees distributed to sJOE stakers',
  },
  'balancer-v2': {
    name: 'Balancer',
    symbol: 'BAL',
    geckoId: 'balancer',
    mechanism: 'distribute',
    description: 'Protocol fees distributed to veBAL holders',
  },
  // Trading bots - these generate revenue, some do buybacks
  'banana-gun-trading': {
    name: 'Banana Gun',
    symbol: 'BANANA',
    geckoId: 'banana-gun',
    mechanism: 'buyback-burn',
    description: '40% of bot revenue → BANANA buyback and burn',
  },
  'maestro': {
    name: 'Maestro',
    symbol: 'MBS', 
    geckoId: 'maestro',
    mechanism: 'buyback',
    description: 'Trading bot revenue used for buybacks',
  },
  'unibot': {
    name: 'Unibot',
    symbol: 'UNIBOT',
    geckoId: 'unibot',
    mechanism: 'distribute',
    description: 'Trading fees distributed to UNIBOT holders',
  },
  // LSTs and staking
  'lido': {
    name: 'Lido',
    symbol: 'LDO',
    geckoId: 'lido-dao',
    mechanism: 'buyback',
    description: 'Staking protocol revenue for potential buybacks',
  },
  'rocketpool': {
    name: 'Rocket Pool',
    symbol: 'RPL',
    geckoId: 'rocket-pool',
    mechanism: 'distribute',
    description: 'Protocol fees distributed to RPL stakers',
  },
  // Additional major protocols
  'maker': {
    name: 'Maker (Sky)',
    symbol: 'MKR',
    geckoId: 'maker',
    mechanism: 'buyback-burn',
    description: 'Smart Burn Engine uses surplus to buy and burn MKR',
  },
  'frax': {
    name: 'Frax',
    symbol: 'FXS',
    geckoId: 'frax-share',
    mechanism: 'distribute',
    description: 'Protocol revenue distributed to veFXS holders',
  },
  'convex': {
    name: 'Convex',
    symbol: 'CVX',
    geckoId: 'convex-finance',
    mechanism: 'distribute',
    description: 'CRV bribes distributed to vlCVX holders',
  },
  'synthetix': {
    name: 'Synthetix',
    symbol: 'SNX',
    geckoId: 'havven',
    mechanism: 'buyback-burn',
    description: 'Protocol fees used for SNX buyback and burn',
  },
};

export interface DailyDataPoint {
  timestamp: number;
  date: string;
  value: number;
}

export interface ProtocolBuybackData {
  slug: string;
  name: string;
  symbol: string;
  mechanism: string;
  description: string;
  // Price data from CoinGecko
  price: number;
  marketCap: number;
  priceChange24h: number;
  // Buyback data from DefiLlama
  holdersRevenue24h: number;
  holdersRevenue7d: number;
  holdersRevenue30d: number;
  holdersRevenueAllTime: number;
  // Also fetch total fees for comparison
  totalFees24h: number;
  totalFees30d: number;
  // Calculated
  buybackRate: number; // Annualized as % of mcap
  // Historical chart
  dailyChart: DailyDataPoint[];
}

// Fetch holders revenue (actual buyback amount) for a protocol
async function fetchHoldersRevenue(slug: string): Promise<{
  total24h: number | null;
  total7d: number | null;
  total30d: number | null;
  totalAllTime: number | null;
  chart: DailyDataPoint[];
} | null> {
  try {
    const response = await fetch(
      `${DEFILLAMA_API}/summary/fees/${slug}?dataType=dailyHoldersRevenue`
    );
    if (!response.ok) return null;
    
    const data = await response.json();
    
    const chart: DailyDataPoint[] = [];
    const rawChart = data.totalDataChart || [];
    for (const [timestamp, value] of rawChart.slice(-90)) {
      chart.push({
        timestamp,
        date: new Date(timestamp * 1000).toISOString().split('T')[0],
        value: value || 0,
      });
    }
    
    return {
      total24h: data.total24h ?? null,
      total7d: data.total7d ?? null,
      total30d: data.total30d ?? null,
      totalAllTime: data.totalAllTime ?? null,
      chart,
    };
  } catch (error) {
    console.error(`Failed to fetch holders revenue for ${slug}:`, error);
    return null;
  }
}

// Fetch total fees for a protocol
async function fetchTotalFees(slug: string): Promise<{
  total24h: number | null;
  total30d: number | null;
} | null> {
  try {
    const response = await fetch(
      `${DEFILLAMA_API}/summary/fees/${slug}?dataType=dailyFees`
    );
    if (!response.ok) return null;
    
    const data = await response.json();
    return {
      total24h: data.total24h ?? null,
      total30d: data.total30d ?? null,
    };
  } catch (error) {
    return null;
  }
}

// Fetch market caps from CoinGecko
export async function fetchMarketCaps(): Promise<Record<string, {
  usd: number;
  usd_market_cap: number;
  usd_24h_change: number;
}>> {
  const geckoIds = Object.values(PROTOCOL_CONFIG)
    .map(p => p.geckoId)
    .filter(Boolean)
    .join(',');
  
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${geckoIds}&vs_currencies=usd&include_market_cap=true&include_24hr_change=true`
    );
    if (!response.ok) return {};
    return response.json();
  } catch (error) {
    console.error('Failed to fetch market caps:', error);
    return {};
  }
}

// Fetch all data
export async function fetchAllBuybackData(): Promise<ProtocolBuybackData[]> {
  const slugs = Object.keys(PROTOCOL_CONFIG);
  
  // Fetch market caps first
  const marketCaps = await fetchMarketCaps();
  
  // Fetch data for all protocols in parallel
  const results = await Promise.all(
    slugs.map(async (slug) => {
      const config = PROTOCOL_CONFIG[slug];
      
      const [holdersData, feesData] = await Promise.all([
        fetchHoldersRevenue(slug),
        fetchTotalFees(slug),
      ]);
      
      // Get market data
      const mcData = marketCaps[config.geckoId];
      const price = mcData?.usd || 0;
      const marketCap = mcData?.usd_market_cap || 0;
      const priceChange24h = mcData?.usd_24h_change || 0;
      
      // Calculate annualized buyback rate
      const holdersRev30d = holdersData?.total30d || 0;
      const annualized = holdersRev30d * 12;
      const buybackRate = marketCap > 0 ? (annualized / marketCap) * 100 : 0;
      
      return {
        slug,
        name: config.name,
        symbol: config.symbol,
        mechanism: config.mechanism,
        description: config.description,
        price,
        marketCap,
        priceChange24h,
        holdersRevenue24h: holdersData?.total24h || 0,
        holdersRevenue7d: holdersData?.total7d || 0,
        holdersRevenue30d: holdersData?.total30d || 0,
        holdersRevenueAllTime: holdersData?.totalAllTime || 0,
        totalFees24h: feesData?.total24h || 0,
        totalFees30d: feesData?.total30d || 0,
        buybackRate,
        dailyChart: holdersData?.chart || [],
      };
    })
  );
  
  // Filter out protocols with no data and sort by buyback rate
  return results
    .filter(p => p.holdersRevenue30d > 0 || p.totalFees30d > 10000)
    .sort((a, b) => b.buybackRate - a.buybackRate);
}

// Get overview fees data to discover more protocols
export async function fetchOverviewFees(): Promise<any[]> {
  try {
    const response = await fetch(
      `${DEFILLAMA_API}/overview/fees?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true`
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data.protocols || [];
  } catch (error) {
    console.error('Failed to fetch overview:', error);
    return [];
  }
}
