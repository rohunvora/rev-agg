// DefiLlama API integration for fees, revenue, and buyback data

const DEFILLAMA_API = 'https://api.llama.fi';

// Protocols with known buyback mechanisms and their DefiLlama slugs
export const BUYBACK_PROTOCOLS = [
  {
    slug: 'hyperliquid',
    name: 'Hyperliquid',
    symbol: 'HYPE',
    geckoId: 'hyperliquid',
    mechanism: 'buyback-burn',
    buybackSource: 'holdersRevenue', // 99% of fees go to buying HYPE
    description: '99% of perp trading fees used to buy back HYPE tokens',
  },
  {
    slug: 'gmx',
    name: 'GMX',
    symbol: 'GMX',
    geckoId: 'gmx',
    mechanism: 'buyback-distribute',
    buybackSource: 'holdersRevenue', // 30% to GMX stakers
    description: '30% of trading fees distributed to GMX stakers',
  },
  {
    slug: 'aave',
    name: 'Aave',
    symbol: 'AAVE',
    geckoId: 'aave',
    mechanism: 'buyback-distribute',
    buybackSource: 'revenue', // DAO revenue used for buybacks
    description: 'DAO treasury revenue used for token buybacks',
  },
  {
    slug: 'maker',
    name: 'Maker (Sky)',
    symbol: 'MKR',
    geckoId: 'maker',
    mechanism: 'buyback-burn',
    buybackSource: 'revenue', // Surplus used for Smart Burn Engine
    description: 'Protocol surplus used to buy and burn MKR via Smart Burn Engine',
  },
  {
    slug: 'lido',
    name: 'Lido',
    symbol: 'LDO',
    geckoId: 'lido-dao',
    mechanism: 'buyback',
    buybackSource: 'revenue',
    description: 'Staking fees used for LDO buybacks',
  },
  {
    slug: 'pancakeswap',
    name: 'PancakeSwap',
    symbol: 'CAKE',
    geckoId: 'pancakeswap-token',
    mechanism: 'buyback-burn',
    buybackSource: 'revenue',
    description: 'Trading fees used to buy and burn CAKE weekly',
  },
  {
    slug: 'jupiter-aggregator',
    name: 'Jupiter',
    symbol: 'JUP',
    geckoId: 'jupiter-exchange-solana',
    mechanism: 'buyback',
    buybackSource: 'revenue',
    description: 'Aggregator fees used for JUP buybacks',
  },
  {
    slug: 'raydium',
    name: 'Raydium',
    symbol: 'RAY',
    geckoId: 'raydium',
    mechanism: 'buyback-burn',
    buybackSource: 'revenue',
    description: '12% of trading fees used for RAY buyback and burn',
  },
  {
    slug: 'dydx',
    name: 'dYdX',
    symbol: 'DYDX',
    geckoId: 'dydx-chain',
    mechanism: 'buyback-distribute',
    buybackSource: 'holdersRevenue',
    description: 'Trading fees distributed to DYDX stakers',
  },
  {
    slug: 'synthetix',
    name: 'Synthetix',
    symbol: 'SNX',
    geckoId: 'havven',
    mechanism: 'buyback-burn',
    buybackSource: 'revenue',
    description: 'Protocol fees used for SNX buyback and burn',
  },
  {
    slug: 'pendle',
    name: 'Pendle',
    symbol: 'PENDLE',
    geckoId: 'pendle',
    mechanism: 'buyback-distribute',
    buybackSource: 'revenue',
    description: 'Protocol fees distributed to vePENDLE holders',
  },
  {
    slug: 'banana-gun-trading',
    name: 'Banana Gun',
    symbol: 'BANANA',
    geckoId: 'banana-gun',
    mechanism: 'buyback-burn',
    buybackSource: 'revenue',
    description: '40% of bot revenue used for BANANA buyback and burn',
  },
  {
    slug: 'aerodrome',
    name: 'Aerodrome',
    symbol: 'AERO',
    geckoId: 'aerodrome-finance',
    mechanism: 'buyback-distribute',
    buybackSource: 'revenue',
    description: 'Trading fees distributed to veAERO holders',
  },
  {
    slug: 'convex',
    name: 'Convex',
    symbol: 'CVX',
    geckoId: 'convex-finance',
    mechanism: 'buyback-distribute',
    buybackSource: 'holdersRevenue',
    description: 'Platform fees distributed to CVX lockers',
  },
];

export interface DailyDataPoint {
  timestamp: number;
  date: string;
  value: number;
}

export interface ProtocolFeeData {
  slug: string;
  name: string;
  symbol: string;
  total24h: number | null;
  total7d: number | null;
  total30d: number | null;
  totalAllTime: number | null;
  dailyChart: DailyDataPoint[];
  holdersRevenue24h: number | null;
  holdersRevenue30d: number | null;
  methodology: string | null;
}

export interface MarketCapData {
  [geckoId: string]: {
    usd: number;
    usd_market_cap: number;
    usd_24h_change: number;
  };
}

// Fetch fee/revenue summary for a protocol
export async function fetchProtocolFees(slug: string, dataType: string = 'dailyRevenue'): Promise<any> {
  try {
    const response = await fetch(`${DEFILLAMA_API}/summary/fees/${slug}?dataType=${dataType}`);
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error(`Failed to fetch fees for ${slug}:`, error);
    return null;
  }
}

// Fetch all protocol data in parallel
export async function fetchAllProtocolData(): Promise<ProtocolFeeData[]> {
  const results: ProtocolFeeData[] = [];

  await Promise.all(
    BUYBACK_PROTOCOLS.map(async (protocol) => {
      try {
        // Fetch revenue data
        const revenueData = await fetchProtocolFees(protocol.slug, 'dailyRevenue');
        
        // Fetch holders revenue if that's the buyback source
        let holdersData = null;
        if (protocol.buybackSource === 'holdersRevenue') {
          holdersData = await fetchProtocolFees(protocol.slug, 'dailyHoldersRevenue');
        }

        // Parse daily chart data
        const chartData: DailyDataPoint[] = [];
        const rawChart = revenueData?.totalDataChart || holdersData?.totalDataChart || [];
        
        for (const [timestamp, value] of rawChart.slice(-90)) { // Last 90 days
          chartData.push({
            timestamp,
            date: new Date(timestamp * 1000).toISOString().split('T')[0],
            value: value || 0,
          });
        }

        results.push({
          slug: protocol.slug,
          name: protocol.name,
          symbol: protocol.symbol,
          total24h: holdersData?.total24h ?? revenueData?.total24h ?? null,
          total7d: holdersData?.total7d ?? revenueData?.total7d ?? null,
          total30d: holdersData?.total30d ?? revenueData?.total30d ?? null,
          totalAllTime: holdersData?.totalAllTime ?? revenueData?.totalAllTime ?? null,
          dailyChart: chartData,
          holdersRevenue24h: holdersData?.total24h ?? null,
          holdersRevenue30d: holdersData?.total30d ?? null,
          methodology: revenueData?.methodology?.HoldersRevenue || revenueData?.methodology?.Revenue || null,
        });
      } catch (error) {
        console.error(`Failed to process ${protocol.slug}:`, error);
      }
    })
  );

  return results.filter(r => r.total30d !== null && r.total30d > 0);
}

// Fetch market caps from CoinGecko
export async function fetchMarketCaps(): Promise<MarketCapData> {
  const geckoIds = BUYBACK_PROTOCOLS.map(p => p.geckoId).join(',');
  
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

// Combined data with buyback rates
export interface ProtocolBuybackData {
  slug: string;
  name: string;
  symbol: string;
  mechanism: string;
  description: string;
  price: number;
  marketCap: number;
  priceChange24h: number;
  buyback24h: number;
  buyback7d: number;
  buyback30d: number;
  buybackAllTime: number;
  buybackRate: number; // Annualized buyback as % of market cap
  dailyChart: DailyDataPoint[];
}

export async function fetchCombinedData(): Promise<ProtocolBuybackData[]> {
  const [feeData, marketCaps] = await Promise.all([
    fetchAllProtocolData(),
    fetchMarketCaps(),
  ]);

  const combined: ProtocolBuybackData[] = [];

  for (const fee of feeData) {
    const protocol = BUYBACK_PROTOCOLS.find(p => p.slug === fee.slug);
    if (!protocol) continue;

    const mcData = marketCaps[protocol.geckoId];
    const marketCap = mcData?.usd_market_cap || 0;
    const price = mcData?.usd || 0;
    const priceChange24h = mcData?.usd_24h_change || 0;

    // Calculate annualized buyback rate
    const annualizedBuyback = (fee.total30d || 0) * 12;
    const buybackRate = marketCap > 0 ? (annualizedBuyback / marketCap) * 100 : 0;

    combined.push({
      slug: fee.slug,
      name: fee.name,
      symbol: fee.symbol,
      mechanism: protocol.mechanism,
      description: protocol.description,
      price,
      marketCap,
      priceChange24h,
      buyback24h: fee.total24h || 0,
      buyback7d: fee.total7d || 0,
      buyback30d: fee.total30d || 0,
      buybackAllTime: fee.totalAllTime || 0,
      buybackRate,
      dailyChart: fee.dailyChart,
    });
  }

  // Sort by buyback rate descending
  return combined.sort((a, b) => b.buybackRate - a.buybackRate);
}

