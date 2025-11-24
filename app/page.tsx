'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchCombinedData, ProtocolBuybackData, BUYBACK_PROTOCOLS } from '@/lib/defillama';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function formatUSD(value: number, compact = false): string {
  if (value === 0) return '$0';
  if (compact) {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  }
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export default function Dashboard() {
  const [data, setData] = useState<ProtocolBuybackData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedProtocol, setSelectedProtocol] = useState<ProtocolBuybackData | null>(null);
  const [sortBy, setSortBy] = useState<'buybackRate' | 'buyback30d' | 'marketCap'>('buybackRate');
  const [sortDesc, setSortDesc] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchCombinedData();
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [loadData]);

  const sortedData = [...data].sort((a, b) => {
    const mult = sortDesc ? -1 : 1;
    return (a[sortBy] - b[sortBy]) * mult;
  });

  const totals = data.reduce(
    (acc, p) => ({
      buyback24h: acc.buyback24h + p.buyback24h,
      buyback30d: acc.buyback30d + p.buyback30d,
      marketCap: acc.marketCap + p.marketCap,
    }),
    { buyback24h: 0, buyback30d: 0, marketCap: 0 }
  );

  const handleSort = (key: typeof sortBy) => {
    if (sortBy === key) {
      setSortDesc(!sortDesc);
    } else {
      setSortBy(key);
      setSortDesc(true);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold mb-2">BUYBACK TRACKER</h1>
        <p className="text-sm muted">
          Real-time token buyback data from DefiLlama
          {lastUpdated && (
            <span className="ml-4">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={loadData}
            disabled={loading}
            className="ml-4"
          >
            {loading ? 'LOADING...' : 'REFRESH'}
          </button>
        </p>
      </header>

      {/* Aggregate Stats */}
      <section className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border border-[#222] p-4">
          <div className="text-xs muted mb-1">24H BUYBACKS</div>
          <div className="text-xl font-bold">
            {loading ? '...' : formatUSD(totals.buyback24h, true)}
          </div>
        </div>
        <div className="border border-[#222] p-4">
          <div className="text-xs muted mb-1">30D BUYBACKS</div>
          <div className="text-xl font-bold">
            {loading ? '...' : formatUSD(totals.buyback30d, true)}
          </div>
        </div>
        <div className="border border-[#222] p-4">
          <div className="text-xs muted mb-1">TOTAL MCAP</div>
          <div className="text-xl font-bold">
            {loading ? '...' : formatUSD(totals.marketCap, true)}
          </div>
        </div>
        <div className="border border-[#222] p-4">
          <div className="text-xs muted mb-1">PROTOCOLS</div>
          <div className="text-xl font-bold">{data.length}</div>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 border border-red-500 text-red-500">
          {error}
        </div>
      )}

      {/* Main Table */}
      <section className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th className="w-8">#</th>
              <th>PROTOCOL</th>
              <th>MECHANISM</th>
              <th
                className="cursor-pointer hover:text-white text-right"
                onClick={() => handleSort('buybackRate')}
              >
                RATE/MCAP {sortBy === 'buybackRate' && (sortDesc ? '↓' : '↑')}
              </th>
              <th className="text-right">24H</th>
              <th
                className="cursor-pointer hover:text-white text-right"
                onClick={() => handleSort('buyback30d')}
              >
                30D {sortBy === 'buyback30d' && (sortDesc ? '↓' : '↑')}
              </th>
              <th className="text-right">ALL TIME</th>
              <th
                className="cursor-pointer hover:text-white text-right"
                onClick={() => handleSort('marketCap')}
              >
                MCAP {sortBy === 'marketCap' && (sortDesc ? '↓' : '↑')}
              </th>
              <th className="text-right">24H Δ</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={9}>
                    <div className="skeleton h-4 w-full" />
                  </td>
                </tr>
              ))
            ) : (
              sortedData.map((protocol, index) => (
                <tr
                  key={protocol.slug}
                  className="cursor-pointer"
                  onClick={() => setSelectedProtocol(protocol)}
                >
                  <td className="muted">{index + 1}</td>
                  <td>
                    <div className="font-semibold">{protocol.symbol}</div>
                    <div className="text-xs muted">{protocol.name}</div>
                  </td>
                  <td>
                    <span className="text-xs px-2 py-1 bg-[#111] border border-[#333]">
                      {protocol.mechanism}
                    </span>
                  </td>
                  <td className="text-right font-bold">
                    <span className={protocol.buybackRate >= 5 ? 'positive' : ''}>
                      {formatPercent(protocol.buybackRate)}
                    </span>
                  </td>
                  <td className="text-right">{formatUSD(protocol.buyback24h, true)}</td>
                  <td className="text-right">{formatUSD(protocol.buyback30d, true)}</td>
                  <td className="text-right muted">{formatUSD(protocol.buybackAllTime, true)}</td>
                  <td className="text-right">{formatUSD(protocol.marketCap, true)}</td>
                  <td className="text-right">
                    <span className={protocol.priceChange24h >= 0 ? 'positive' : 'negative'}>
                      {protocol.priceChange24h >= 0 ? '+' : ''}
                      {protocol.priceChange24h.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {/* Protocol Detail Modal */}
      {selectedProtocol && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedProtocol(null)}
        >
          <div
            className="bg-black border border-[#333] max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-[#222]">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">
                    {selectedProtocol.symbol}
                    <span className="ml-2 text-sm muted font-normal">
                      {selectedProtocol.name}
                    </span>
                  </h2>
                  <p className="text-sm muted mt-1">{selectedProtocol.description}</p>
                </div>
                <button
                  onClick={() => setSelectedProtocol(null)}
                  className="bg-transparent text-white border border-[#333] hover:border-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-[#222]">
              <div>
                <div className="text-xs muted">BUYBACK RATE</div>
                <div className="text-lg font-bold positive">
                  {formatPercent(selectedProtocol.buybackRate)}
                </div>
                <div className="text-xs muted">annualized / mcap</div>
              </div>
              <div>
                <div className="text-xs muted">30D BUYBACKS</div>
                <div className="text-lg font-bold">
                  {formatUSD(selectedProtocol.buyback30d, true)}
                </div>
              </div>
              <div>
                <div className="text-xs muted">MARKET CAP</div>
                <div className="text-lg font-bold">
                  {formatUSD(selectedProtocol.marketCap, true)}
                </div>
              </div>
              <div>
                <div className="text-xs muted">ALL TIME</div>
                <div className="text-lg font-bold">
                  {formatUSD(selectedProtocol.buybackAllTime, true)}
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="p-6">
              <h3 className="text-sm font-semibold mb-4">DAILY BUYBACK REVENUE (90D)</h3>
              {selectedProtocol.dailyChart.length > 0 ? (
                <div className="chart-container p-4" style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={selectedProtocol.dailyChart}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00ff00" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#00ff00" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#666', fontSize: 10 }}
                        tickFormatter={(v) => v.slice(5)} // MM-DD
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#666', fontSize: 10 }}
                        tickFormatter={(v) => `$${(v / 1e6).toFixed(1)}M`}
                      />
                      <Tooltip
                        contentStyle={{
                          background: '#000',
                          border: '1px solid #333',
                          fontFamily: 'IBM Plex Mono',
                          fontSize: 12,
                        }}
                        formatter={(value: number) => [formatUSD(value), 'Revenue']}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#00ff00"
                        strokeWidth={1}
                        fill="url(#colorValue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8 muted">No chart data available</div>
              )}
            </div>

            {/* Mechanism details */}
            <div className="p-6 border-t border-[#222]">
              <div className="text-xs muted mb-2">MECHANISM</div>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-1 bg-[#111] border border-[#333] text-sm">
                  {selectedProtocol.mechanism}
                </span>
              </div>
              <p className="text-sm muted">
                Data sourced from <a href="https://defillama.com" target="_blank" rel="noopener noreferrer">DefiLlama</a>.
                Buyback rate calculated as (30d buybacks × 12) / market cap.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-[#222] text-xs muted">
        <p>
          Data: <a href="https://defillama.com" target="_blank" rel="noopener noreferrer">DefiLlama</a> (fees/revenue) + <a href="https://coingecko.com" target="_blank" rel="noopener noreferrer">CoinGecko</a> (market caps)
        </p>
        <p className="mt-1">
          Buyback Rate = (30d Revenue × 12) / Market Cap
        </p>
        <p className="mt-1">
          Auto-refreshes every 60 seconds
        </p>
      </footer>
    </div>
  );
}
