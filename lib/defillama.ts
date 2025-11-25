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

/**
 * Calculate % change between two periods
 */
function calcChange(recent: number, prior: number): number {
  if (prior === 0) return recent > 0 ? 100 : 0;
  return ((recent - prior) / prior) * 100;
}

/**
 * Fetch buyback data (holders revenue) for a protocol from DefiLlama
 */
export async function fetchBuybackData(slug: string): Promise<BuybackData | null> {
  try {
    const response = await fetch(
      `${DEFILLAMA_API}/summary/fees/${slug}?dataType=dailyHoldersRevenue`,
      { next: { revalidate: 60 } }
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
 * Fetch market data from CoinGecko for multiple tokens
 */
export async function fetchMarketData(geckoIds: string[]): Promise<Record<string, MarketData>> {
  const ids = geckoIds.join(',');
  
  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h,7d,14d,30d`,
      { next: { revalidate: 30 } }
    );
    if (!response.ok) return {};
    
    const data = await response.json();
    const result: Record<string, MarketData> = {};
    
    for (const coin of data) {
      result[coin.id] = {
        price: coin.current_price || 0,
        marketCap: coin.market_cap || 0,
        priceChange24h: coin.price_change_percentage_24h || 0,
        priceChange7d: coin.price_change_percentage_7d_in_currency || 0,
        priceChange14d: coin.price_change_percentage_14d_in_currency || 0,
        priceChange30d: coin.price_change_percentage_30d_in_currency || 0,
      };
    }
    
    return result;
  } catch (error) {
    console.error('Failed to fetch market data:', error);
    return {};
  }
}
