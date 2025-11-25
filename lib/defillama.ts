/**
 * Data fetching from DefiLlama and CoinGecko APIs
 * 
 * DefiLlama: Buyback/revenue data via dailyHoldersRevenue
 * CoinGecko: Price and market cap data
 */

import { DailyDataPoint, BuybackTrends, BuybackData, MarketData } from './types';

export type { DailyDataPoint, BuybackTrends, BuybackData };

const DEFILLAMA_API = 'https://api.llama.fi';
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Simple in-memory cache for market data
let marketDataCache: { data: Record<string, MarketData>; timestamp: number } | null = null;
let revenueDataCache: { data: RevenueProtocol[]; timestamp: number } | null = null;
const CACHE_TTL = 30000; // 30 seconds

export interface RevenueProtocol {
  slug: string;
  name: string;
  logo: string;
  category: string;
  total24h: number;
  total7d: number;
  total30d: number;
  change7d: number;
  hasBuyback: boolean;
}

export interface RevenueDetail {
  slug: string;
  name: string;
  category: string;
  total24h: number;
  total7d: number;
  total30d: number;
  totalAllTime: number;
  change7d: number;
  change30d: number;
  dailyChart: DailyDataPoint[];
  hasBuyback: boolean;
}

/**
 * Calculate % change between two periods
 */
function calcChange(recent: number, prior: number): number {
  if (prior === 0) return recent > 0 ? 100 : 0;
  return ((recent - prior) / prior) * 100;
}

/**
 * Fetch with retry logic
 */
async function fetchWithRetry(url: string, retries = 2): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, { 
        cache: 'no-store',
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) return response;
      if (i < retries) await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    } catch (error) {
      if (i === retries) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw new Error(`Failed to fetch ${url}`);
}

/**
 * Fetch buyback data (holders revenue) for a protocol from DefiLlama
 */
export async function fetchBuybackData(slug: string): Promise<BuybackData | null> {
  try {
    const response = await fetchWithRetry(
      `${DEFILLAMA_API}/summary/fees/${slug}?dataType=dailyHoldersRevenue`
    );
    
    const data = await response.json();
    
    const dailyChart: DailyDataPoint[] = [];
    const rawChart = data.totalDataChart || [];
    
    for (const [timestamp, value] of rawChart) {
      dailyChart.push({
        timestamp,
        date: new Date(timestamp * 1000).toISOString().split('T')[0],
        value: value || 0,
      });
    }
    
    // Calculate sums for different periods
    const sum = (arr: DailyDataPoint[]) => arr.reduce((s, d) => s + d.value, 0);
    
    const last1d = dailyChart.slice(-1);
    const last7d = dailyChart.slice(-7);
    const last14d = dailyChart.slice(-14);
    const last30d = dailyChart.slice(-30);
    const last90d = dailyChart.slice(-90);
    
    const prior1d = dailyChart.slice(-2, -1);
    const prior7d = dailyChart.slice(-14, -7);
    const prior14d = dailyChart.slice(-28, -14);
    const prior30d = dailyChart.slice(-60, -30);
    const prior90d = dailyChart.slice(-180, -90);
    
    const sum1d = sum(last1d);
    const sum7d = sum(last7d);
    const sum14d = sum(last14d);
    const sum30d = sum(last30d);
    const sum90d = sum(last90d);
    
    const sumPrior1d = sum(prior1d);
    const sumPrior7d = sum(prior7d);
    const sumPrior14d = sum(prior14d);
    const sumPrior30d = sum(prior30d);
    const sumPrior90d = sum(prior90d);
    
    const trends: BuybackTrends = {
      change24h: calcChange(sum1d, sumPrior1d),
      change7d: calcChange(sum7d, sumPrior7d),
      change14d: calcChange(sum14d, sumPrior14d),
      change30d: calcChange(sum30d, sumPrior30d),
      change90d: calcChange(sum90d, sumPrior90d),
    };
    
    return {
      total24h: data.total24h ?? sum1d,
      total7d: sum7d,
      total30d: sum30d,
      totalAllTime: data.totalAllTime ?? 0,
      dailyChart: dailyChart.slice(-90),
      trends,
      avg24h: sum1d,
      avg7d: sum7d / 7,
      avg30d: sum30d / 30,
    };
  } catch (error) {
    console.error(`Failed to fetch buyback data for ${slug}:`, error);
    return null;
  }
}

/**
 * Fetch combined buyback data for Jupiter (perps + aggregator)
 */
export async function fetchJupiterCombinedData(): Promise<BuybackData | null> {
  try {
    const [perpsData, aggData] = await Promise.all([
      fetchBuybackData('jupiter-perpetual-exchange'),
      fetchBuybackData('jupiter-aggregator'),
    ]);
    
    if (!perpsData && !aggData) return null;
    
    const p = perpsData || { total24h: 0, total7d: 0, total30d: 0, totalAllTime: 0, dailyChart: [], trends: { change24h: 0, change7d: 0, change14d: 0, change30d: 0, change90d: 0 }, avg24h: 0, avg7d: 0, avg30d: 0 };
    const a = aggData || { total24h: 0, total7d: 0, total30d: 0, totalAllTime: 0, dailyChart: [], trends: { change24h: 0, change7d: 0, change14d: 0, change30d: 0, change90d: 0 }, avg24h: 0, avg7d: 0, avg30d: 0 };
    
    // Combine daily charts (use perps as base, longer history)
    const combinedChart = p.dailyChart.map(day => {
      const aggDay = a.dailyChart.find(d => d.date === day.date);
      return {
        ...day,
        value: day.value + (aggDay?.value || 0),
      };
    });
    
    // Weighted average for trend calculation
    const total7d = p.total7d + a.total7d;
    const weightP = total7d > 0 ? p.total7d / total7d : 0.5;
    const weightA = total7d > 0 ? a.total7d / total7d : 0.5;
    
    return {
      total24h: p.total24h + a.total24h,
      total7d: p.total7d + a.total7d,
      total30d: p.total30d + a.total30d,
      totalAllTime: p.totalAllTime + a.totalAllTime,
      dailyChart: combinedChart,
      trends: {
        change24h: p.trends.change24h * weightP + a.trends.change24h * weightA,
        change7d: p.trends.change7d * weightP + a.trends.change7d * weightA,
        change14d: p.trends.change14d * weightP + a.trends.change14d * weightA,
        change30d: p.trends.change30d * weightP + a.trends.change30d * weightA,
        change90d: p.trends.change90d * weightP + a.trends.change90d * weightA,
      },
      avg24h: p.avg24h + a.avg24h,
      avg7d: p.avg7d + a.avg7d,
      avg30d: p.avg30d + a.avg30d,
    };
  } catch (error) {
    console.error('Failed to fetch combined Jupiter data:', error);
    return null;
  }
}

/**
 * Fetch market data from CoinGecko for multiple tokens
 * Uses in-memory cache to avoid rate limits
 */
export async function fetchMarketData(geckoIds: string[]): Promise<Record<string, MarketData>> {
  // Return cached data if fresh
  if (marketDataCache && Date.now() - marketDataCache.timestamp < CACHE_TTL) {
    return marketDataCache.data;
  }
  
  const ids = geckoIds.join(',');
  
  try {
    const response = await fetchWithRetry(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h,7d,14d,30d`
    );
    
    const data = await response.json();
    
    // Check if we got valid data
    if (!Array.isArray(data) || data.length === 0) {
      console.error('CoinGecko returned empty data');
      return marketDataCache?.data || {};
    }
    
    const result: Record<string, MarketData> = {};
    
    for (const coin of data) {
      // Use FDV as fallback if market_cap is missing (CoinGecko bug for some tokens like MKR)
      const marketCap = coin.market_cap || coin.fully_diluted_valuation || 0;
      
      result[coin.id] = {
        price: coin.current_price || 0,
        marketCap,
        priceChange24h: coin.price_change_percentage_24h || 0,
        priceChange7d: coin.price_change_percentage_7d_in_currency || 0,
        priceChange14d: coin.price_change_percentage_14d_in_currency || 0,
        priceChange30d: coin.price_change_percentage_30d_in_currency || 0,
      };
    }
    
    // Update cache
    marketDataCache = { data: result, timestamp: Date.now() };
    
    return result;
  } catch (error) {
    console.error('Failed to fetch market data:', error);
    // Return cached data if available
    return marketDataCache?.data || {};
  }
}

// Slugs of protocols with verified buybacks (for Revenue tab badge)
const BUYBACK_SLUGS = new Set([
  'hyperliquid-perps',
  'pump.fun',
  'ore-protocol',
  'sky-lending',
  'aave-v3',
  'raydium-amm',
  'pancakeswap-amm-v3',
  'sushiswap',
  'banana-gun-trading',
  'helium-network',
  'jupiter-perpetual-exchange',
  'jupiter-aggregator',
  'letsbonk.fun',
  'apex-omni',
  'graphite-protocol',
  'launch-coin-on-believe',
]);

// Jupiter has multiple revenue sources that should be combined
const JUPITER_SLUGS = ['jupiter-perpetual-exchange', 'jupiter-aggregator'];

/**
 * Fetch top revenue protocols from DefiLlama
 */
export async function fetchRevenueData(): Promise<RevenueProtocol[]> {
  // Return cached data if fresh
  if (revenueDataCache && Date.now() - revenueDataCache.timestamp < CACHE_TTL) {
    return revenueDataCache.data;
  }
  
  try {
    const response = await fetchWithRetry(`${DEFILLAMA_API}/overview/fees`);
    const data = await response.json();
    
    if (!data.protocols || !Array.isArray(data.protocols)) {
      return revenueDataCache?.data || [];
    }
    
    // Filter and sort by 24h revenue
    const protocols: RevenueProtocol[] = data.protocols
      .filter((p: any) => p.total24h && p.total24h > 10000) // Min $10k/day
      .sort((a: any, b: any) => (b.total24h || 0) - (a.total24h || 0))
      .slice(0, 30)
      .map((p: any) => {
        const prev7d = p.total7d ? (p.total7d / 7) : 0;
        const current = p.total24h || 0;
        const change7d = prev7d > 0 ? ((current - prev7d) / prev7d) * 100 : 0;
        
        return {
          slug: p.slug || p.name?.toLowerCase().replace(/\s+/g, '-'),
          name: p.name || 'Unknown',
          logo: p.logo || '',
          category: p.category || 'Other',
          total24h: p.total24h || 0,
          total7d: p.total7d || 0,
          total30d: p.total30d || 0,
          change7d,
          hasBuyback: BUYBACK_SLUGS.has(p.slug),
        };
      });
    
    // Update cache
    revenueDataCache = { data: protocols, timestamp: Date.now() };
    
    return protocols;
  } catch (error) {
    console.error('Failed to fetch revenue data:', error);
    return revenueDataCache?.data || [];
  }
}

/**
 * Fetch detailed revenue data for a single protocol
 */
export async function fetchRevenueDetail(slug: string): Promise<RevenueDetail | null> {
  try {
    const response = await fetchWithRetry(
      `${DEFILLAMA_API}/summary/fees/${slug}`
    );
    
    const data = await response.json();
    
    const dailyChart: DailyDataPoint[] = [];
    const rawChart = data.totalDataChart || [];
    
    for (const [timestamp, value] of rawChart) {
      dailyChart.push({
        timestamp,
        date: new Date(timestamp * 1000).toISOString().split('T')[0],
        value: value || 0,
      });
    }
    
    // Calculate sums and changes
    const sum = (arr: DailyDataPoint[]) => arr.reduce((s, d) => s + d.value, 0);
    const last7d = dailyChart.slice(-7);
    const last30d = dailyChart.slice(-30);
    const prior7d = dailyChart.slice(-14, -7);
    const prior30d = dailyChart.slice(-60, -30);
    
    const sum7d = sum(last7d);
    const sum30d = sum(last30d);
    const sumPrior7d = sum(prior7d);
    const sumPrior30d = sum(prior30d);
    
    return {
      slug,
      name: data.name || slug,
      category: data.category || 'Other',
      total24h: data.total24h || 0,
      total7d: sum7d,
      total30d: sum30d,
      totalAllTime: data.totalAllTime || 0,
      change7d: calcChange(sum7d, sumPrior7d),
      change30d: calcChange(sum30d, sumPrior30d),
      dailyChart: dailyChart.slice(-90),
      hasBuyback: BUYBACK_SLUGS.has(slug),
    };
  } catch (error) {
    console.error(`Failed to fetch revenue detail for ${slug}:`, error);
    return null;
  }
}
