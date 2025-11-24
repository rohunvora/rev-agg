// Real-time price data from CoinGecko API
// Maps our token IDs to CoinGecko IDs

export const COINGECKO_IDS: Record<string, string> = {
  'hyperliquid': 'hyperliquid',
  'maker': 'maker',
  'aave': 'aave',
  'gmx': 'gmx',
  'bnb': 'binancecoin',
  'lido': 'lido-dao',
  'jupiter': 'jupiter-exchange-solana',
  'pancakeswap': 'pancakeswap-token',
  'dydx': 'dydx-chain',
  'synthetix': 'havven',
  'raydium': 'raydium',
  'pendle': 'pendle',
};

export interface PriceData {
  usd: number;
  usd_market_cap: number;
  usd_24h_change: number;
  usd_24h_vol: number;
  last_updated_at: number;
}

export interface PriceResponse {
  [key: string]: PriceData;
}

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

export async function fetchPrices(): Promise<PriceResponse | null> {
  const ids = Object.values(COINGECKO_IDS).join(',');
  
  try {
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${ids}&vs_currencies=usd&include_market_cap=true&include_24hr_change=true&include_24hr_vol=true&include_last_updated_at=true`,
      {
        next: { revalidate: 30 }, // Cache for 30 seconds
        headers: {
          'Accept': 'application/json',
        }
      }
    );
    
    if (!response.ok) {
      console.error('CoinGecko API error:', response.status);
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.error('Failed to fetch prices:', error);
    return null;
  }
}

// Fetch 7-day sparkline data for charts
export async function fetchSparklineData(): Promise<Record<string, number[]> | null> {
  const ids = Object.values(COINGECKO_IDS).join(',');
  
  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=${ids}&sparkline=true&price_change_percentage=7d`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
        headers: {
          'Accept': 'application/json',
        }
      }
    );
    
    if (!response.ok) {
      console.error('CoinGecko sparkline API error:', response.status);
      return null;
    }
    
    const data = await response.json();
    const sparklines: Record<string, number[]> = {};
    
    for (const coin of data) {
      if (coin.sparkline_in_7d?.price) {
        // Downsample to ~24 points for performance
        const prices = coin.sparkline_in_7d.price;
        const step = Math.floor(prices.length / 24);
        sparklines[coin.id] = prices.filter((_: number, i: number) => i % step === 0);
      }
    }
    
    return sparklines;
  } catch (error) {
    console.error('Failed to fetch sparklines:', error);
    return null;
  }
}

// Map CoinGecko response back to our token IDs
export function mapPricesToTokens(prices: PriceResponse): Record<string, PriceData> {
  const mapped: Record<string, PriceData> = {};
  
  for (const [tokenId, geckoId] of Object.entries(COINGECKO_IDS)) {
    if (prices[geckoId]) {
      mapped[tokenId] = prices[geckoId];
    }
  }
  
  return mapped;
}

