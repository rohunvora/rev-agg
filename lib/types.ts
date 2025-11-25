// Core types for the Buyback Tracker

/**
 * Protocol configuration - static data about each tracked protocol
 */
export interface ProtocolConfig {
  slug: string;           // DefiLlama slug
  name: string;           // Display name
  symbol: string;         // Token symbol
  geckoId: string;        // CoinGecko ID for price data
  buybackSource: string;  // Where buyback funds come from
  buybackPct: string;     // What % of revenue goes to buybacks
  businessModel: string;  // How the protocol makes money
  growthDrivers: string;  // What could drive growth
  risks: string;          // Key risks to consider
  notes?: string[];       // Caveats, warnings, disclaimers
  verifyUrl?: string;     // Link to on-chain proof or dashboard
}

/**
 * Daily data point for charts
 */
export interface DailyDataPoint {
  timestamp: number;
  date: string;  // YYYY-MM-DD
  value: number; // USD value
}

/**
 * Buyback trend data across different time periods
 */
export interface BuybackTrends {
  change24h: number;  // % change vs prior 24h
  change7d: number;   // % change vs prior 7d
  change14d: number;  // % change vs prior 14d
  change30d: number;  // % change vs prior 30d
  change90d: number;  // % change vs prior 90d
}

/**
 * Buyback data from DefiLlama
 */
export interface BuybackData {
  total24h: number;
  total7d: number;
  total30d: number;
  totalAllTime: number;
  dailyChart: DailyDataPoint[];
  trends: BuybackTrends;
  avg24h: number;
  avg7d: number;
  avg30d: number;
}

/**
 * Market data from CoinGecko
 */
export interface MarketData {
  price: number;
  marketCap: number;
  priceChange24h: number;
  priceChange7d: number;
  priceChange14d: number;
  priceChange30d: number;
}

/**
 * Combined protocol data for display
 */
export interface ProtocolData extends ProtocolConfig {
  buyback: BuybackData | null;
  price: number;
  marketCap: number;
  priceChange7d: number;
  dailyAvg: number;         // 30-day average daily buyback
  buybackToMcap: number;    // Annualized buyback as % of market cap
  buyback7d: number;        // 7d buyback trend %
  peRatio: number;          // Market Cap / Annual Buybacks (like P/E)
}

/**
 * Sort options for the leaderboard
 */
export type SortKey = 'dailyAvg' | 'buybackToMcap' | 'buyback7d' | 'priceChange7d' | 'marketCap' | 'peRatio';

