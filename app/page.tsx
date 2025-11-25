'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { PROTOCOLS } from '@/lib/protocols';
import { fetchBuybackData, fetchMarketData, fetchRevenueData, fetchRevenueDetail, RevenueProtocol, RevenueDetail } from '@/lib/defillama';
import { ProtocolData, SortKey } from '@/lib/types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type ViewMode = 'revenue' | 'buybacks';

function formatUSD(value: number, short = false): string {
  if (!value || value === 0) return '—';
  if (value >= 1e9) return `$${(value / 1e9).toFixed(short ? 1 : 2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(short ? 1 : 2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(short ? 0 : 1)}K`;
  return `$${value.toFixed(0)}`;
}

function formatPct(value: number, showSign = true): string {
  if (value === 0 || isNaN(value) || !isFinite(value)) return '—';
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

function Rank({ position, mode }: { position: number; mode: ViewMode }) {
  const cls = position === 1 
    ? (mode === 'revenue' ? 'rank-1-gold' : 'rank-1') 
    : position === 2 
    ? 'rank-2' 
    : position === 3 
    ? 'rank-3' 
    : 'rank-default';
  return <span className={`rank ${cls}`}>{position}</span>;
}

function Pct({ value, showSign = true }: { value: number; showSign?: boolean }) {
  const isPos = value > 0;
  const isNeg = value < 0;
  
  return (
    <span className={`num ${isPos ? 'positive' : isNeg ? 'negative' : 'muted'}`}>
      {formatPct(value, showSign)}
    </span>
  );
}

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('buybacks');
  const [buybackData, setBuybackData] = useState<ProtocolData[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueProtocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedProtocol, setSelectedProtocol] = useState<ProtocolData | null>(null);
  const [selectedRevenue, setSelectedRevenue] = useState<RevenueDetail | null>(null);
  const [loadingRevDetail, setLoadingRevDetail] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>('dailyAvg');
  const [sortDesc, setSortDesc] = useState(true);
  const [revSortBy, setRevSortBy] = useState<'total24h' | 'change7d' | 'total30d'>('total24h');
  const [revSortDesc, setRevSortDesc] = useState(true);
  const [flashRows, setFlashRows] = useState<Set<string>>(new Set());
  const prevDataRef = useRef<Map<string, number>>(new Map());

  const loadBuybackData = useCallback(async (isInitial = false) => {
    try {
      const geckoIds = PROTOCOLS.map(p => p.geckoId);
      const marketData = await fetchMarketData(geckoIds);
      const hasMarketData = Object.keys(marketData).length > 0;
      
      const results = await Promise.all(
        PROTOCOLS.map(async (protocol) => {
          const buyback = await fetchBuybackData(protocol.slug);
          const market = marketData[protocol.geckoId] || { 
            price: 0, marketCap: 0, priceChange24h: 0, priceChange7d: 0, priceChange14d: 0, priceChange30d: 0 
          };
          
          const dailyAvg = buyback?.avg30d || 0;
          const annualized = dailyAvg * 365;
          const buybackToMcap = market.marketCap > 0 ? (annualized / market.marketCap) * 100 : 0;
          const peRatio = annualized > 0 ? market.marketCap / annualized : 0;
          
          return {
            ...protocol,
            buyback,
            price: market.price,
            marketCap: market.marketCap,
            priceChange7d: market.priceChange7d,
            dailyAvg,
            buybackToMcap,
            buyback7d: buyback?.trends.change7d || 0,
            peRatio,
          };
        })
      );
      
      const filtered = results.filter(p => p.buyback?.total30d && p.buyback.total30d > 0);
      
      if (filtered.length > 0 && (hasMarketData || buybackData.length === 0)) {
        const newFlash = new Set<string>();
        for (const p of filtered) {
          const prev = prevDataRef.current.get(p.slug);
          if (prev !== undefined && Math.abs(prev - p.dailyAvg) > 100) {
            newFlash.add(p.slug);
          }
          prevDataRef.current.set(p.slug, p.dailyAvg);
        }
        
        if (newFlash.size > 0) {
          setFlashRows(newFlash);
          setTimeout(() => setFlashRows(new Set()), 1200);
        }
        
        setBuybackData(filtered);
      }
    } catch (error) {
      console.error('Error loading buyback data:', error);
    }
  }, [buybackData.length]);

  const loadRevenueData = useCallback(async () => {
    try {
      const data = await fetchRevenueData();
      if (data.length > 0) {
        setRevenueData(data);
      }
    } catch (error) {
      console.error('Error loading revenue data:', error);
    }
  }, []);

  const loadAllData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    
    await Promise.all([
      loadBuybackData(isInitial),
      loadRevenueData(),
    ]);
    
    setLastUpdated(new Date());
    if (isInitial) setLoading(false);
  }, [loadBuybackData, loadRevenueData]);

  useEffect(() => {
    loadAllData(true);
    const interval = setInterval(() => loadAllData(false), 30000);
    return () => clearInterval(interval);
  }, [loadAllData]);

  const sortedBuybackData = useMemo(() => {
    return [...buybackData].sort((a, b) => {
      const aVal = a[sortBy] ?? 0;
      const bVal = b[sortBy] ?? 0;
      return sortDesc ? bVal - aVal : aVal - bVal;
    });
  }, [buybackData, sortBy, sortDesc]);

  const sortedRevenueData = useMemo(() => {
    return [...revenueData].sort((a, b) => {
      const aVal = a[revSortBy] ?? 0;
      const bVal = b[revSortBy] ?? 0;
      return revSortDesc ? bVal - aVal : aVal - bVal;
    });
  }, [revenueData, revSortBy, revSortDesc]);

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDesc(!sortDesc);
    } else {
      setSortBy(key);
      setSortDesc(true);
    }
  };

  const SortHeader = ({ label, sortKey, className = '' }: { label: string; sortKey: SortKey; className?: string }) => (
    <th 
      className={`sortable ${className}`}
      onClick={() => handleSort(sortKey)}
    >
      {sortBy === sortKey && (sortDesc ? '▼ ' : '▲ ')}
      {label}
    </th>
  );

  const handleRevSort = (key: 'total24h' | 'change7d' | 'total30d') => {
    if (revSortBy === key) {
      setRevSortDesc(!revSortDesc);
    } else {
      setRevSortBy(key);
      setRevSortDesc(true);
    }
  };

  const RevSortHeader = ({ label, sortKey, className = '' }: { label: string; sortKey: 'total24h' | 'change7d' | 'total30d'; className?: string }) => (
    <th 
      className={`sortable ${className}`}
      onClick={() => handleRevSort(sortKey)}
    >
      {revSortBy === sortKey && (revSortDesc ? '▼ ' : '▲ ')}
      {label}
    </th>
  );

  const handleRevenueClick = async (protocol: RevenueProtocol) => {
    setLoadingRevDetail(true);
    const detail = await fetchRevenueDetail(protocol.slug);
    if (detail) {
      setSelectedRevenue(detail);
    }
    setLoadingRevDetail(false);
  };

  const handleTabChange = (mode: ViewMode) => {
    setViewMode(mode);
    // Reset sort when switching tabs
    if (mode === 'revenue') {
      setSortBy('dailyAvg');
    } else {
      setSortBy('dailyAvg');
    }
    setSortDesc(true);
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${viewMode === 'revenue' ? 'bg-revenue' : 'bg-buyback'}`}>
      {/* Hero */}
      <header className="text-center py-8 sm:py-12 px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3 sm:mb-4">
          {viewMode === 'revenue' ? 'Revenue Tracker' : 'Buyback Tracker'}
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-xl mx-auto">
          {viewMode === 'revenue' 
            ? 'Top protocols by daily revenue. Who\'s making money?' 
            : 'Protocols that buy their token from the open market.'}
        </p>
        
        {/* Tabs */}
        <div className="flex justify-center mt-6 sm:mt-8">
          <div className="inline-flex bg-white rounded-full p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => handleTabChange('revenue')}
              className={`tab-btn ${viewMode === 'revenue' ? 'tab-active-revenue' : ''}`}
            >
              <span className="mr-1.5">💰</span>
              Revenue
            </button>
            <button
              onClick={() => handleTabChange('buybacks')}
              className={`tab-btn ${viewMode === 'buybacks' ? 'tab-active-buyback' : ''}`}
            >
              <span className="mr-1.5">🔄</span>
              Buybacks
            </button>
          </div>
        </div>

        {lastUpdated && (
          <p className="text-xs sm:text-sm text-gray-400 mt-4 sm:mt-6 num">
            Updated {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </header>

      {/* Table */}
      <main className="max-w-5xl mx-auto px-3 sm:px-6 pb-12 sm:pb-16">
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Loading header */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
              <div className="loading-spinner"></div>
              <span className="text-sm text-gray-500">Fetching live data from DefiLlama & CoinGecko...</span>
            </div>
            {/* Skeleton rows */}
            <div className="divide-y divide-gray-100">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <div className="skeleton w-8 h-8 rounded-md"></div>
                  <div className="flex-1">
                    <div className="skeleton h-5 w-20 mb-2"></div>
                    <div className="skeleton h-3 w-32"></div>
                  </div>
                  <div className="hidden sm:block skeleton h-5 w-16"></div>
                  <div className="skeleton h-5 w-14"></div>
                  <div className="hidden md:block skeleton h-5 w-12"></div>
                  <div className="hidden sm:block skeleton h-5 w-12"></div>
                  <div className="skeleton h-5 w-14"></div>
                  <div className="skeleton h-5 w-14"></div>
                </div>
              ))}
            </div>
          </div>
        ) : viewMode === 'buybacks' ? (
          /* Buybacks Table */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="leaderboard" style={{ minWidth: 700 }}>
                <colgroup>
                  <col style={{ width: 40 }} />
                  <col style={{ width: '22%' }} />
                  <col style={{ width: '12%' }} className="hidden sm:table-column" />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '9%' }} className="hidden md:table-column" />
                  <col style={{ width: '9%' }} className="hidden sm:table-column" />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '10%' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Token</th>
                    <SortHeader label="MCap" sortKey="marketCap" className="text-right hidden sm:table-cell" />
                    <SortHeader label="Daily Avg" sortKey="dailyAvg" className="text-right" />
                    <SortHeader label="P/E" sortKey="peRatio" className="text-right hidden md:table-cell" />
                    <SortHeader label="% MCap/yr" sortKey="buybackToMcap" className="text-right hidden sm:table-cell" />
                    <SortHeader label="BB 7d" sortKey="buyback7d" className="text-right" />
                    <SortHeader label="Price 7d" sortKey="priceChange7d" className="text-right" />
                  </tr>
                </thead>
                <tbody>
                  {sortedBuybackData.map((p, idx) => (
                    <tr
                      key={p.slug}
                      onClick={() => setSelectedProtocol(p)}
                      className={flashRows.has(p.slug) ? 'flash' : ''}
                    >
                      <td><Rank position={idx + 1} mode="buybacks" /></td>
                      <td>
                        <div className="font-semibold">{p.symbol}</div>
                        <div className="text-xs text-gray-500 truncate" style={{ maxWidth: 140 }}>
                          {p.buybackSource}
                        </div>
                      </td>
                      <td className="text-right hidden sm:table-cell">
                        <span className="num">{formatUSD(p.marketCap, true)}</span>
                      </td>
                      <td className="text-right">
                        <span className="num font-medium">{formatUSD(p.dailyAvg, true)}</span>
                      </td>
                      <td className="text-right hidden md:table-cell">
                        <span className="num">{p.peRatio > 0 ? p.peRatio.toFixed(1) + 'x' : '—'}</span>
                      </td>
                      <td className="text-right hidden sm:table-cell">
                        <span className="num">{p.buybackToMcap.toFixed(1)}%</span>
                      </td>
                      <td className="text-right">
                        <Pct value={p.buyback7d} />
                      </td>
                      <td className="text-right">
                        <Pct value={p.priceChange7d} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Revenue Table */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="leaderboard" style={{ minWidth: 600 }}>
                <colgroup>
                  <col style={{ width: 48 }} />
                  <col style={{ width: '35%' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '15%' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Protocol</th>
                    <RevSortHeader label="Daily" sortKey="total24h" className="text-right" />
                    <RevSortHeader label="7d Chg" sortKey="change7d" className="text-right" />
                    <RevSortHeader label="30d Total" sortKey="total30d" className="text-right" />
                  </tr>
                </thead>
                <tbody>
                  {sortedRevenueData.map((p, idx) => (
                    <tr key={p.slug} onClick={() => handleRevenueClick(p)}>
                      <td><Rank position={idx + 1} mode="revenue" /></td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-semibold flex items-center gap-2">
                              {p.name}
                              {p.hasBuyback && (
                                <span className="buyback-badge">🔄 Buyback</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">{p.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-right">
                        <span className="num font-medium">{formatUSD(p.total24h, true)}</span>
                      </td>
                      <td className="text-right">
                        <Pct value={p.change7d} />
                      </td>
                      <td className="text-right">
                        <span className="num">{formatUSD(p.total30d, true)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <footer className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-400 px-4">
          Data from DefiLlama & CoinGecko · {viewMode === 'buybacks' ? 'Verified buybacks only' : 'Top 30 by daily revenue'} · Tap row for details
        </footer>
      </main>

      {/* Detail Modal (Buybacks only) */}
      {selectedProtocol && (
        <div
          className="fixed inset-0 modal-backdrop flex items-end sm:items-center justify-center p-0 sm:p-4 z-50"
          onClick={() => setSelectedProtocol(null)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar for mobile */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
            </div>

            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">{selectedProtocol.symbol}</h2>
                  <p className="text-gray-500 text-sm sm:text-base">{selectedProtocol.name}</p>
                </div>
                <button
                  onClick={() => setSelectedProtocol(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none p-2 -mr-2"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-gray-50 border-b border-gray-100">
              <div className="text-xs sm:text-sm text-gray-500 mb-1">Buyback Source</div>
              <div className="text-base sm:text-lg">{selectedProtocol.buybackSource}</div>
            </div>

            <div className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 border-b border-gray-100">
              <div>
                <div className="text-xs sm:text-sm text-gray-500">Daily Avg</div>
                <div className="text-lg sm:text-xl font-semibold num">{formatUSD(selectedProtocol.dailyAvg)}</div>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-500">P/E Multiple</div>
                <div className="text-lg sm:text-xl font-semibold num">{selectedProtocol.peRatio > 0 ? selectedProtocol.peRatio.toFixed(1) + 'x' : '—'}</div>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-500">% of MCap / yr</div>
                <div className="text-lg sm:text-xl font-semibold num">{selectedProtocol.buybackToMcap.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-500">7d Buyback</div>
                <div className="text-lg sm:text-xl font-semibold"><Pct value={selectedProtocol.buyback7d} /></div>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-500">7d Price</div>
                <div className="text-lg sm:text-xl font-semibold"><Pct value={selectedProtocol.priceChange7d} /></div>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-500">Market Cap</div>
                <div className="text-lg sm:text-xl font-semibold num">{formatUSD(selectedProtocol.marketCap)}</div>
              </div>
            </div>

            <div className="p-4 sm:p-6 grid grid-cols-2 gap-3 sm:gap-6 border-b border-gray-100 text-sm">
              <div>
                <span className="text-gray-500">Price:</span>
                <span className="ml-2 num">${selectedProtocol.price < 1 ? selectedProtocol.price.toFixed(4) : selectedProtocol.price.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-500">MCap:</span>
                <span className="ml-2 num">{formatUSD(selectedProtocol.marketCap)}</span>
              </div>
              <div>
                <span className="text-gray-500">30d:</span>
                <span className="ml-2 num">{formatUSD(selectedProtocol.buyback?.total30d || 0)}</span>
              </div>
              <div>
                <span className="text-gray-500">All Time:</span>
                <span className="ml-2 num">{formatUSD(selectedProtocol.buyback?.totalAllTime || 0)}</span>
              </div>
            </div>

            {/* Chart */}
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="text-xs sm:text-sm text-gray-500 mb-3">Daily Buybacks (90 days)</div>
              {selectedProtocol.buyback?.dailyChart && selectedProtocol.buyback.dailyChart.length > 0 ? (
                <div style={{ height: 120 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={selectedProtocol.buyback.dailyChart}>
                      <defs>
                        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#999', fontSize: 9 }}
                        tickFormatter={(v) => v.slice(5)}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#999', fontSize: 9 }}
                        tickFormatter={(v) => v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : `${(v/1e3).toFixed(0)}K`}
                        width={40}
                      />
                      <Tooltip
                        contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 11 }}
                        formatter={(value: number) => [formatUSD(value), 'Buyback']}
                      />
                      <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} fill="url(#grad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400 text-sm">No chart data</div>
              )}
            </div>

            {/* Business Info */}
            <div className="p-4 sm:p-6 space-y-4 text-sm">
              <div>
                <div className="text-gray-500 mb-1">Business Model</div>
                <div className="text-gray-700">{selectedProtocol.businessModel}</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Risks</div>
                <div className="text-gray-700">{selectedProtocol.risks}</div>
              </div>
            </div>

            {/* Bottom safe area for mobile */}
            <div className="h-6 sm:hidden"></div>
          </div>
        </div>
      )}

      {/* Revenue Detail Modal */}
      {selectedRevenue && (
        <div
          className="fixed inset-0 modal-backdrop flex items-end sm:items-center justify-center p-0 sm:p-4 z-50"
          onClick={() => setSelectedRevenue(null)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar for mobile */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
            </div>

            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                    {selectedRevenue.name}
                    {selectedRevenue.hasBuyback && (
                      <span className="buyback-badge text-xs">🔄 Buyback</span>
                    )}
                  </h2>
                  <p className="text-gray-500 text-sm sm:text-base">{selectedRevenue.category}</p>
                </div>
                <button
                  onClick={() => setSelectedRevenue(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none p-2 -mr-2"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 border-b border-gray-100">
              <div>
                <div className="text-xs sm:text-sm text-gray-500">Daily Revenue</div>
                <div className="text-lg sm:text-xl font-semibold num">{formatUSD(selectedRevenue.total24h)}</div>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-500">7d Total</div>
                <div className="text-lg sm:text-xl font-semibold num">{formatUSD(selectedRevenue.total7d)}</div>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-500">30d Total</div>
                <div className="text-lg sm:text-xl font-semibold num">{formatUSD(selectedRevenue.total30d)}</div>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-500">7d Change</div>
                <div className="text-lg sm:text-xl font-semibold"><Pct value={selectedRevenue.change7d} /></div>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-500">30d Change</div>
                <div className="text-lg sm:text-xl font-semibold"><Pct value={selectedRevenue.change30d} /></div>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-500">All Time</div>
                <div className="text-lg sm:text-xl font-semibold num">{formatUSD(selectedRevenue.totalAllTime)}</div>
              </div>
            </div>

            {/* Chart */}
            <div className="p-4 sm:p-6">
              <div className="text-xs sm:text-sm text-gray-500 mb-3">Daily Revenue (90 days)</div>
              {selectedRevenue.dailyChart && selectedRevenue.dailyChart.length > 0 ? (
                <div style={{ height: 160 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={selectedRevenue.dailyChart}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3}/>
                          <stop offset="100%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#999', fontSize: 9 }}
                        tickFormatter={(v) => v.slice(5)}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#999', fontSize: 9 }}
                        tickFormatter={(v) => v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : `${(v/1e3).toFixed(0)}K`}
                        width={45}
                      />
                      <Tooltip
                        contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 11 }}
                        formatter={(value: number) => [formatUSD(value), 'Revenue']}
                      />
                      <Area type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} fill="url(#revGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400 text-sm">No chart data</div>
              )}
            </div>

            {/* Bottom safe area for mobile */}
            <div className="h-6 sm:hidden"></div>
          </div>
        </div>
      )}

      {/* Loading overlay for revenue detail */}
      {loadingRevDetail && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 shadow-lg flex items-center gap-3">
            <div className="loading-spinner"></div>
            <span className="text-sm text-gray-600">Loading details...</span>
          </div>
        </div>
      )}
    </div>
  );
}
