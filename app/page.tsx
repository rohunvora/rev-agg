'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { PROTOCOLS } from '@/lib/protocols';
import { fetchBuybackData, fetchMarketData } from '@/lib/defillama';
import { ProtocolData, SortKey } from '@/lib/types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

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

function Rank({ position }: { position: number }) {
  const cls = position === 1 ? 'rank-1' : position === 2 ? 'rank-2' : position === 3 ? 'rank-3' : 'rank-default';
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
  const [data, setData] = useState<ProtocolData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedProtocol, setSelectedProtocol] = useState<ProtocolData | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>('dailyAvg');
  const [sortDesc, setSortDesc] = useState(true);
  const [flashRows, setFlashRows] = useState<Set<string>>(new Set());
  const prevDataRef = useRef<Map<string, number>>(new Map());

  const loadData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    
    const geckoIds = PROTOCOLS.map(p => p.geckoId);
    const marketData = await fetchMarketData(geckoIds);
    
    const results = await Promise.all(
      PROTOCOLS.map(async (protocol) => {
        const buyback = await fetchBuybackData(protocol.slug);
        const market = marketData[protocol.geckoId] || { 
          price: 0, marketCap: 0, priceChange24h: 0, priceChange7d: 0, priceChange14d: 0, priceChange30d: 0 
        };
        
        const dailyAvg = buyback?.avg30d || 0;
        const annualized = dailyAvg * 365;
        const buybackToMcap = market.marketCap > 0 ? (annualized / market.marketCap) * 100 : 0;
        
        return {
          ...protocol,
          buyback,
          price: market.price,
          marketCap: market.marketCap,
          priceChange7d: market.priceChange7d,
          dailyAvg,
          buybackToMcap,
          buyback7d: buyback?.trends.change7d || 0,
        };
      })
    );
    
    const filtered = results.filter(p => p.buyback?.total30d && p.buyback.total30d > 0);
    
    // Flash detection
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
    
    setData(filtered);
    setLastUpdated(new Date());
    if (isInitial) setLoading(false);
  }, []);

  useEffect(() => {
    loadData(true);
    const interval = setInterval(() => loadData(false), 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const aVal = a[sortBy] ?? 0;
      const bVal = b[sortBy] ?? 0;
      return sortDesc ? bVal - aVal : aVal - bVal;
    });
  }, [data, sortBy, sortDesc]);

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

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="text-center py-8 sm:py-12 px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3 sm:mb-4">
          Buyback Tracker
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-xl mx-auto">
          Tokens that buy themselves back.<br className="hidden sm:block" />
          <span className="sm:hidden"> </span>Which ones are doing it the most?
        </p>
        {lastUpdated && (
          <p className="text-xs sm:text-sm text-gray-400 mt-4 sm:mt-6 num">
            Updated {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </header>

      {/* Table */}
      <main className="max-w-5xl mx-auto px-3 sm:px-6 pb-12 sm:pb-16">
        {loading ? (
          <div className="text-center py-16 sm:py-20 text-gray-400">Loading...</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto table-wrapper">
              <table className="leaderboard">
                <thead>
                  <tr>
                    <th style={{ width: 50 }}>#</th>
                    <th>Token</th>
                    <SortHeader label="Daily" sortKey="dailyAvg" className="text-right" />
                    <SortHeader label="% MCap" sortKey="buybackToMcap" className="text-right hidden sm:table-cell" />
                    <SortHeader label="7d" sortKey="buyback7d" className="text-right" />
                    <SortHeader label="Price" sortKey="priceChange7d" className="text-right" />
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((p, idx) => (
                    <tr
                      key={p.slug}
                      onClick={() => setSelectedProtocol(p)}
                      className={flashRows.has(p.slug) ? 'flash' : ''}
                    >
                      <td><Rank position={idx + 1} /></td>
                      <td>
                        <div className="font-semibold text-base sm:text-lg">{p.symbol}</div>
                        <div className="text-xs sm:text-sm text-gray-500 truncate max-w-[120px] sm:max-w-[200px]">
                          {p.buybackSource}
                        </div>
                      </td>
                      <td className="text-right">
                        <span className="num text-base sm:text-lg font-medium">{formatUSD(p.dailyAvg, true)}</span>
                      </td>
                      <td className="text-right hidden sm:table-cell">
                        <span className="num text-base sm:text-lg">{p.buybackToMcap.toFixed(1)}%</span>
                        <span className="text-xs text-gray-400 ml-1">/yr</span>
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
        )}

        <footer className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-400 px-4">
          Data from DefiLlama & CoinGecko · Updates every 30s · Tap any row for details
        </footer>
      </main>

      {/* Detail Modal */}
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

            <div className="p-4 sm:p-6 grid grid-cols-2 gap-4 sm:gap-6 border-b border-gray-100">
              <div>
                <div className="text-xs sm:text-sm text-gray-500">Daily Avg</div>
                <div className="text-lg sm:text-xl font-semibold num">{formatUSD(selectedProtocol.dailyAvg)}</div>
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
    </div>
  );
}
