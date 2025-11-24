// DefiLlama API for fetching buyback data

const DEFILLAMA_API = 'https://api.llama.fi';

export interface DailyDataPoint {
  timestamp: number;
  date: string;
  value: number;
}

export interface BuybackData {
  total24h: number;
  total7d: number;
  total30d: number;
  totalAllTime: number;
  dailyChart: DailyDataPoint[];
}

// Fetch holders revenue (buyback amount) for a protocol
export async function fetchBuybackData(slug: string): Promise<BuybackData | null> {
  try {
    const response = await fetch(
      `${DEFILLAMA_API}/summary/fees/${slug}?dataType=dailyHoldersRevenue`
    );
    if (!response.ok) return null;
    
    const data = await response.json();
    
    const dailyChart: DailyDataPoint[] = [];
    const rawChart = data.totalDataChart || [];
    for (const [timestamp, value] of rawChart.slice(-90)) {
      dailyChart.push({
        timestamp,
        date: new Date(timestamp * 1000).toISOString().split('T')[0],
        value: value || 0,
      });
    }
    
    return {
      total24h: data.total24h ?? 0,
      total7d: data.total7d ?? 0,
      total30d: data.total30d ?? 0,
      totalAllTime: data.totalAllTime ?? 0,
      dailyChart,
    };
  } catch (error) {
    console.error(`Failed to fetch buyback data for ${slug}:`, error);
    return null;
  }
}

// Fetch market data from CoinGecko
export async function fetchMarketData(geckoIds: string[]): Promise<Record<string, {
  price: number;
  marketCap: number;
  priceChange24h: number;
}>> {
  const ids = geckoIds.join(',');
  
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_market_cap=true&include_24hr_change=true`
    );
    if (!response.ok) return {};
    
    const data = await response.json();
    const result: Record<string, { price: number; marketCap: number; priceChange24h: number }> = {};
    
    for (const [id, values] of Object.entries(data)) {
      const v = values as any;
      result[id] = {
        price: v.usd || 0,
        marketCap: v.usd_market_cap || 0,
        priceChange24h: v.usd_24h_change || 0,
      };
    }
    
    return result;
  } catch (error) {
    console.error('Failed to fetch market data:', error);
    return {};
  }
}
