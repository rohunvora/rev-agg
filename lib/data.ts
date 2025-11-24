export interface TokenBuyback {
  id: string;
  name: string;
  symbol: string;
  logo: string;
  marketCap: number;
  price: number;
  annualBuybackAmount: number;
  buybackRate: number; // Annual buyback as % of market cap
  totalBuybackToDate: number;
  percentSupplyBoughtBack: number;
  revenueSource: string;
  mechanism: 'buyback' | 'buyback-burn' | 'buyback-distribute' | 'burn';
  chain: string;
  category: string;
  lastBuyback: string;
  monthlyBuybacks: number[];
  trend: 'up' | 'down' | 'stable';
  description: string;
}

// Real data based on research - values are approximations based on public data
export const buybackTokens: TokenBuyback[] = [
  {
    id: 'hyperliquid',
    name: 'Hyperliquid',
    symbol: 'HYPE',
    logo: '🔷',
    marketCap: 9_200_000_000,
    price: 28.45,
    annualBuybackAmount: 1_140_000_000,
    buybackRate: 12.39,
    totalBuybackToDate: 285_000_000,
    percentSupplyBoughtBack: 3.1,
    revenueSource: 'Trading Fees',
    mechanism: 'buyback-burn',
    chain: 'Hyperliquid L1',
    category: 'Perp DEX',
    lastBuyback: '2025-11-23',
    monthlyBuybacks: [89, 92, 95, 88, 99, 102, 98, 105, 110, 108, 112, 99],
    trend: 'up',
    description: '95% of protocol revenue used for continuous buybacks and burns'
  },
  {
    id: 'maker',
    name: 'Sky (Maker)',
    symbol: 'MKR',
    logo: '🏛️',
    marketCap: 1_850_000_000,
    price: 1_580,
    annualBuybackAmount: 98_000_000,
    buybackRate: 5.3,
    totalBuybackToDate: 420_000_000,
    percentSupplyBoughtBack: 22.7,
    revenueSource: 'Protocol Surplus',
    mechanism: 'buyback-burn',
    chain: 'Ethereum',
    category: 'Lending',
    lastBuyback: '2025-11-22',
    monthlyBuybacks: [7.2, 8.1, 7.8, 8.5, 9.2, 8.8, 9.1, 8.4, 7.9, 8.2, 8.6, 8.2],
    trend: 'stable',
    description: 'Smart Burn Engine uses DAI surplus to buy and burn MKR'
  },
  {
    id: 'aave',
    name: 'Aave',
    symbol: 'AAVE',
    logo: '👻',
    marketCap: 5_200_000_000,
    price: 348,
    annualBuybackAmount: 50_000_000,
    buybackRate: 0.96,
    totalBuybackToDate: 12_500_000,
    percentSupplyBoughtBack: 0.24,
    revenueSource: 'Lending Fees',
    mechanism: 'buyback-distribute',
    chain: 'Multi-chain',
    category: 'Lending',
    lastBuyback: '2025-11-20',
    monthlyBuybacks: [3.8, 4.1, 4.2, 4.0, 4.3, 4.5, 4.2, 4.1, 4.4, 4.2, 4.0, 4.2],
    trend: 'up',
    description: '$50M annual buyback program from protocol revenue'
  },
  {
    id: 'gmx',
    name: 'GMX',
    symbol: 'GMX',
    logo: '🔵',
    marketCap: 285_000_000,
    price: 30.20,
    annualBuybackAmount: 24_000_000,
    buybackRate: 8.42,
    totalBuybackToDate: 20_000_000,
    percentSupplyBoughtBack: 7.0,
    revenueSource: 'Trading Fees',
    mechanism: 'buyback-distribute',
    chain: 'Arbitrum',
    category: 'Perp DEX',
    lastBuyback: '2025-11-21',
    monthlyBuybacks: [1.8, 2.0, 1.9, 2.1, 2.2, 2.0, 1.9, 2.1, 2.0, 1.8, 2.0, 2.2],
    trend: 'stable',
    description: 'Continuous buybacks from 30% of trading fees'
  },
  {
    id: 'bnb',
    name: 'BNB',
    symbol: 'BNB',
    logo: '🟡',
    marketCap: 94_000_000_000,
    price: 630,
    annualBuybackAmount: 1_200_000_000,
    buybackRate: 1.28,
    totalBuybackToDate: 8_500_000_000,
    percentSupplyBoughtBack: 9.04,
    revenueSource: 'Exchange Revenue',
    mechanism: 'buyback-burn',
    chain: 'BNB Chain',
    category: 'Exchange',
    lastBuyback: '2025-10-15',
    monthlyBuybacks: [0, 0, 300, 0, 0, 320, 0, 0, 290, 0, 0, 290],
    trend: 'stable',
    description: 'Quarterly burns based on exchange profits + auto-burn'
  },
  {
    id: 'lido',
    name: 'Lido DAO',
    symbol: 'LDO',
    logo: '🌊',
    marketCap: 1_400_000_000,
    price: 1.48,
    annualBuybackAmount: 28_000_000,
    buybackRate: 2.0,
    totalBuybackToDate: 7_000_000,
    percentSupplyBoughtBack: 0.5,
    revenueSource: 'Staking Fees',
    mechanism: 'buyback',
    chain: 'Ethereum',
    category: 'Staking',
    lastBuyback: '2025-11-18',
    monthlyBuybacks: [2.0, 2.2, 2.4, 2.3, 2.5, 2.4, 2.3, 2.4, 2.3, 2.2, 2.3, 2.3],
    trend: 'up',
    description: 'Strategic buybacks using protocol revenue with price limits'
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    symbol: 'JUP',
    logo: '🪐',
    marketCap: 1_620_000_000,
    price: 1.18,
    annualBuybackAmount: 32_000_000,
    buybackRate: 1.98,
    totalBuybackToDate: 8_000_000,
    percentSupplyBoughtBack: 0.49,
    revenueSource: 'Swap Fees',
    mechanism: 'buyback',
    chain: 'Solana',
    category: 'DEX Aggregator',
    lastBuyback: '2025-11-19',
    monthlyBuybacks: [2.4, 2.6, 2.8, 2.7, 2.9, 2.8, 2.6, 2.7, 2.6, 2.5, 2.7, 2.7],
    trend: 'stable',
    description: 'Revenue sharing and buybacks from aggregator fees'
  },
  {
    id: 'pancakeswap',
    name: 'PancakeSwap',
    symbol: 'CAKE',
    logo: '🥞',
    marketCap: 680_000_000,
    price: 2.42,
    annualBuybackAmount: 145_000_000,
    buybackRate: 21.32,
    totalBuybackToDate: 980_000_000,
    percentSupplyBoughtBack: 144.1,
    revenueSource: 'Trading Fees',
    mechanism: 'buyback-burn',
    chain: 'BNB Chain',
    category: 'DEX',
    lastBuyback: '2025-11-22',
    monthlyBuybacks: [11.5, 12.0, 12.2, 11.8, 12.5, 12.8, 12.0, 11.9, 12.1, 11.8, 12.2, 12.2],
    trend: 'stable',
    description: 'Weekly burns from trading fees - deflationary tokenomics'
  },
  {
    id: 'dydx',
    name: 'dYdX',
    symbol: 'DYDX',
    logo: '📈',
    marketCap: 1_150_000_000,
    price: 1.52,
    annualBuybackAmount: 18_000_000,
    buybackRate: 1.57,
    totalBuybackToDate: 4_500_000,
    percentSupplyBoughtBack: 0.39,
    revenueSource: 'Trading Fees',
    mechanism: 'buyback-distribute',
    chain: 'dYdX Chain',
    category: 'Perp DEX',
    lastBuyback: '2025-11-20',
    monthlyBuybacks: [1.4, 1.5, 1.6, 1.5, 1.5, 1.4, 1.5, 1.6, 1.5, 1.4, 1.5, 1.6],
    trend: 'stable',
    description: 'Protocol revenue distributed to stakers via buybacks'
  },
  {
    id: 'synthetix',
    name: 'Synthetix',
    symbol: 'SNX',
    logo: '⚡',
    marketCap: 520_000_000,
    price: 1.58,
    annualBuybackAmount: 15_000_000,
    buybackRate: 2.88,
    totalBuybackToDate: 45_000_000,
    percentSupplyBoughtBack: 8.65,
    revenueSource: 'Trading Fees',
    mechanism: 'buyback-burn',
    chain: 'Optimism',
    category: 'Derivatives',
    lastBuyback: '2025-11-21',
    monthlyBuybacks: [1.1, 1.2, 1.3, 1.2, 1.4, 1.3, 1.2, 1.3, 1.2, 1.2, 1.3, 1.3],
    trend: 'up',
    description: 'SNX buyback and burn from perps and options fees'
  },
  {
    id: 'raydium',
    name: 'Raydium',
    symbol: 'RAY',
    logo: '☀️',
    marketCap: 1_280_000_000,
    price: 4.82,
    annualBuybackAmount: 96_000_000,
    buybackRate: 7.5,
    totalBuybackToDate: 48_000_000,
    percentSupplyBoughtBack: 3.75,
    revenueSource: 'Trading Fees',
    mechanism: 'buyback-burn',
    chain: 'Solana',
    category: 'DEX',
    lastBuyback: '2025-11-22',
    monthlyBuybacks: [7.2, 7.8, 8.2, 8.0, 8.5, 8.8, 8.2, 7.9, 8.0, 7.8, 8.1, 7.5],
    trend: 'up',
    description: '12% of protocol fees used for buyback and burn'
  },
  {
    id: 'pendle',
    name: 'Pendle',
    symbol: 'PENDLE',
    logo: '🔮',
    marketCap: 820_000_000,
    price: 5.12,
    annualBuybackAmount: 22_000_000,
    buybackRate: 2.68,
    totalBuybackToDate: 11_000_000,
    percentSupplyBoughtBack: 1.34,
    revenueSource: 'Protocol Fees',
    mechanism: 'buyback-distribute',
    chain: 'Multi-chain',
    category: 'Yield',
    lastBuyback: '2025-11-19',
    monthlyBuybacks: [1.6, 1.8, 1.9, 1.8, 2.0, 1.9, 1.8, 1.9, 1.8, 1.7, 1.9, 1.9],
    trend: 'stable',
    description: 'Protocol fees used for vePENDLE rewards and buybacks'
  },
];

export const getAggregateStats = () => {
  const totalMarketCap = buybackTokens.reduce((sum, t) => sum + t.marketCap, 0);
  const totalAnnualBuybacks = buybackTokens.reduce((sum, t) => sum + t.annualBuybackAmount, 0);
  const totalBuybackToDate = buybackTokens.reduce((sum, t) => sum + t.totalBuybackToDate, 0);
  const avgBuybackRate = buybackTokens.reduce((sum, t) => sum + t.buybackRate, 0) / buybackTokens.length;
  
  return {
    totalMarketCap,
    totalAnnualBuybacks,
    totalBuybackToDate,
    avgBuybackRate,
    tokenCount: buybackTokens.length,
  };
};

export const getChartData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return months.map((month, i) => ({
    month,
    totalBuybacks: buybackTokens.reduce((sum, t) => sum + t.monthlyBuybacks[i], 0),
    hyperliquid: buybackTokens.find(t => t.id === 'hyperliquid')?.monthlyBuybacks[i] || 0,
    maker: buybackTokens.find(t => t.id === 'maker')?.monthlyBuybacks[i] || 0,
    gmx: buybackTokens.find(t => t.id === 'gmx')?.monthlyBuybacks[i] || 0,
  }));
};

export const getBuybackRateData = () => {
  return buybackTokens
    .sort((a, b) => b.buybackRate - a.buybackRate)
    .slice(0, 10)
    .map(t => ({
      name: t.symbol,
      rate: t.buybackRate,
      amount: t.annualBuybackAmount / 1_000_000,
      marketCap: t.marketCap / 1_000_000_000,
    }));
};

export const getCategoryData = () => {
  const categories: Record<string, { count: number; totalBuyback: number; avgRate: number }> = {};
  
  buybackTokens.forEach(t => {
    if (!categories[t.category]) {
      categories[t.category] = { count: 0, totalBuyback: 0, avgRate: 0 };
    }
    categories[t.category].count++;
    categories[t.category].totalBuyback += t.annualBuybackAmount;
    categories[t.category].avgRate += t.buybackRate;
  });
  
  return Object.entries(categories).map(([name, data]) => ({
    name,
    count: data.count,
    totalBuyback: data.totalBuyback / 1_000_000,
    avgRate: data.avgRate / data.count,
  }));
};

