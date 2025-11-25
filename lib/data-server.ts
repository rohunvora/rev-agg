/**
 * Server-side data fetching with Next.js caching
 * 
 * Uses unstable_cache to cache API responses at the edge
 * This dramatically reduces load times and API calls
 */

import { unstable_cache } from 'next/cache';
import { PROTOCOLS } from './protocols';
import { ProtocolData, MarketData, BuybackData } from './types';

const DEFILLAMA_API = 'https://api.llama.fi';
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Revalidation time in seconds (2 minutes for balance of freshness vs API calls)
const REVALIDATE_SECONDS = 120;

interface DailyDataPoint {
  timestamp: number;
  date: string;
  value: number;
}

interface BuybackTrends {
  change24h: number;
  change7d: number;
  change14d: number;
  change30d: number;
  change90d: number;
}

function calcChange(recent: number, prior: number): number {
  if (prior === 0) return recent > 0 ? 100 : 0;
  return ((recent - prior) / prior) * 100;
}

/**
 * Fetch buyback data for a single protocol
 */
async function fetchBuybackDataRaw(slug: string): Promise<BuybackData | null> {
  try {
    const response = await fetch(
      `${DEFILLAMA_API}/summary/fees/${slug}?dataType=dailyHoldersRevenue`,
      { next: { revalidate: REVALIDATE_SECONDS } }
    );
    
    if (!response.ok) return null;
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
    
    const trends: BuybackTrends = {
      change24h: calcChange(sum1d, sum(prior1d)),
      change7d: calcChange(sum7d, sum(prior7d)),
      change14d: calcChange(sum14d, sum(prior14d)),
      change30d: calcChange(sum30d, sum(prior30d)),
      change90d: calcChange(sum90d, sum(prior90d)),
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
    console.error(`[Server] Failed to fetch buyback data for ${slug}:`, error);
    return null;
  }
}

/**
 * Fetch market data from CoinGecko
 */
async function fetchMarketDataRaw(geckoIds: string[]): Promise<Record<string, MarketData>> {
  try {
    const ids = geckoIds.join(',');
    const response = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h,7d,14d,30d`,
      { next: { revalidate: REVALIDATE_SECONDS } }
    );
    
    if (!response.ok) return {};
    const data = await response.json();
    
    if (!Array.isArray(data) || data.length === 0) return {};
    
    const result: Record<string, MarketData> = {};
    
    for (const coin of data) {
      const marketCap = coin.market_cap || coin.fully_diluted_valuation || 0;
      
      result[coin.id] = {
        price: coin.current_price || 0,
        marketCap,
        volume24h: coin.total_volume || 0,
        priceChange24h: coin.price_change_percentage_24h || 0,
        priceChange7d: coin.price_change_percentage_7d_in_currency || 0,
        priceChange14d: coin.price_change_percentage_14d_in_currency || 0,
        priceChange30d: coin.price_change_percentage_30d_in_currency || 0,
      };
    }
    
    return result;
  } catch (error) {
    console.error('[Server] Failed to fetch market data:', error);
    return {};
  }
}

/**
 * Revenue protocol type
 */
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

const BUYBACK_SLUGS = new Set([
  'hyperliquid-perps',
  'pump.fun',
  'ore-protocol',
  'sky-lending',
  'aave-v3',
  'raydium-amm',
  'pancakeswap-amm-v3',
  'banana-gun-trading',
  'helium-network',
  'jupiter-perpetual-exchange',
  'jupiter-aggregator',
  'letsbonk.fun',
  'apex-omni',
  'graphite-protocol',
  'launch-coin-on-believe',
  'clanker',
]);

/**
 * Fetch revenue data
 */
async function fetchRevenueDataRaw(): Promise<RevenueProtocol[]> {
  try {
    const response = await fetch(`${DEFILLAMA_API}/overview/fees`, {
      next: { revalidate: REVALIDATE_SECONDS }
    });
    
    if (!response.ok) return [];
    const data = await response.json();
    
    if (!data.protocols || !Array.isArray(data.protocols)) return [];
    
    return data.protocols
      .filter((p: any) => p.total24h && p.total24h > 10000)
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
  } catch (error) {
    console.error('[Server] Failed to fetch revenue data:', error);
    return [];
  }
}

/**
 * Cached function to get all buybacks data
 * Revalidates every 2 minutes
 */
export const getBuybacksData = unstable_cache(
  async (): Promise<ProtocolData[]> => {
    console.log('[Server] Fetching buybacks data (cache miss or revalidation)');
    
    // Fetch all buyback data in parallel
    const buybackPromises = PROTOCOLS.map(async (protocol) => {
      // Handle Jupiter specially (combines perps + aggregator)
      if (protocol.slug === 'jupiter-perps') {
        const [perpsData, aggData] = await Promise.all([
          fetchBuybackDataRaw('jupiter-perpetual-exchange'),
          fetchBuybackDataRaw('jupiter-aggregator'),
        ]);
        
        if (!perpsData && !aggData) return { protocol, buyback: null };
        
        const p = perpsData || { total24h: 0, total7d: 0, total30d: 0, totalAllTime: 0, dailyChart: [], trends: { change24h: 0, change7d: 0, change14d: 0, change30d: 0, change90d: 0 }, avg24h: 0, avg7d: 0, avg30d: 0 };
        const a = aggData || { total24h: 0, total7d: 0, total30d: 0, totalAllTime: 0, dailyChart: [], trends: { change24h: 0, change7d: 0, change14d: 0, change30d: 0, change90d: 0 }, avg24h: 0, avg7d: 0, avg30d: 0 };
        
        const combinedChart = p.dailyChart.map(day => {
          const aggDay = a.dailyChart.find((d: DailyDataPoint) => d.date === day.date);
          return { ...day, value: day.value + (aggDay?.value || 0) };
        });
        
        const total7d = p.total7d + a.total7d;
        const weightP = total7d > 0 ? p.total7d / total7d : 0.5;
        const weightA = total7d > 0 ? a.total7d / total7d : 0.5;
        
        const combinedBuyback: BuybackData = {
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
        
        return { protocol, buyback: combinedBuyback };
      }
      
      const buyback = await fetchBuybackDataRaw(protocol.slug);
      return { protocol, buyback };
    });
    
    const buybackResults = await Promise.all(buybackPromises);
    
    // Get all gecko IDs and fetch market data
    const geckoIds = PROTOCOLS.map(p => p.geckoId);
    const marketData = await fetchMarketDataRaw(geckoIds);
    
    // Combine data
    const results: ProtocolData[] = buybackResults
      .filter(r => r.buyback !== null)
      .map(({ protocol, buyback }) => {
        const market = marketData[protocol.geckoId] || {
          price: 0, marketCap: 0, volume24h: 0, priceChange24h: 0, priceChange7d: 0, priceChange14d: 0, priceChange30d: 0
        };
        
        const dailyAvg = buyback?.avg30d || 0;
        const annualized = dailyAvg * 365;
        const buybackToMcap = market.marketCap > 0 ? (annualized / market.marketCap) * 100 : 0;
        const peRatio = annualized > 0 ? market.marketCap / annualized : 0;
        const buybackVsVolume = market.volume24h > 0 ? (dailyAvg / market.volume24h) * 100 : 0;
        
        return {
          ...protocol,
          buyback,
          price: market.price,
          marketCap: market.marketCap,
          volume24h: market.volume24h,
          priceChange7d: market.priceChange7d,
          dailyAvg,
          buybackToMcap,
          buyback7d: buyback?.trends.change7d || 0,
          peRatio,
          buybackVsVolume,
        };
      })
      .sort((a, b) => b.dailyAvg - a.dailyAvg);
    
    return results;
  },
  ['buybacks-data'],
  { revalidate: REVALIDATE_SECONDS, tags: ['buybacks'] }
);

/**
 * Cached function to get revenue data
 */
export const getRevenueData = unstable_cache(
  async (): Promise<RevenueProtocol[]> => {
    console.log('[Server] Fetching revenue data (cache miss or revalidation)');
    return fetchRevenueDataRaw();
  },
  ['revenue-data'],
  { revalidate: REVALIDATE_SECONDS, tags: ['revenue'] }
);

