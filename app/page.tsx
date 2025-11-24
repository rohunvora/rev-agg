'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchAllBuybackData, ProtocolBuybackData } from '@/lib/defillama';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

function formatUSD(value: number, compact = false): string {
  if (!value || value === 0) return '-';
  if (compact) {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  }
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function formatPercent(value: number): string {
  if (!value) return '-';
  return `${value.toFixed(2)}%`;
}

type SortKey = 'buybackRate' | 'holdersRevenue30d' | 'marketCap' | 'totalFees30d';

export default function Dashboard() {
  const [data, setData] = useState<ProtocolBuybackData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedProtocol, setSelectedProtocol] = useState<ProtocolBuybackData | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>('holdersRevenue30d');
  const [sortDesc, setSortDesc] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAllBuybackData();
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to fetch data from DefiLlama');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, [loadData]);

  const sortedData = [...data].sort((a, b) => {
    const mult = sortDesc ? -1 : 1;
    return ((a[sortBy] || 0) - (b[sortBy] || 0)) * mult;
  });

  const totals = data.reduce(
    (acc, p) => ({
      holdersRevenue24h: acc.holdersRevenue24h + (p.holdersRevenue24h || 0),
      holdersRevenue30d: acc.holdersRevenue30d + (p.holdersRevenue30d || 0),
      totalFees30d: acc.totalFees30d + (p.totalFees30d || 0),
      marketCap: acc.marketCap + (p.marketCap || 0),
    }),
    { holdersRevenue24h: 0, holdersRevenue30d: 0, totalFees30d: 0, marketCap: 0 }
  );

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDesc(!sortDesc);
    } else {
      setSortBy(key);
      setSortDesc(true);
    }
  };

  const SortHeader = ({ label, sortKey }: { label: string; sortKey: SortKey }) => (
    <th
      className="cursor-pointer hover:text-white text-right"
      onClick={() => handleSort(sortKey)}
    >
      {label} {sortBy === sortKey && (sortDesc ? '↓' : '↑')}
    </th>
  );

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-6 border-b border-[#222] pb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold">BUYBACK TRACKER</h1>
            <p className="text-xs muted mt-1">
              Token buybacks &amp; holder distributions • Data from DefiLlama
            </p>
          </div>
          <div className="text-right">
            <button onClick={loadData} disabled={loading} className="text-xs">
              {loading ? 'LOADING...' : 'REFRESH'}
            </button>
            {lastUpdated && (
              <p className="text-xs muted mt-1">
                {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Summary Stats */}
      <section className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="border border-[#222] p-3">
          <div className="text-xs muted">24H TO HOLDERS</div>
          <div className="text-lg font-bold">
            {loading ? '...' : formatUSD(totals.holdersRevenue24h, true)}
          </div>
        </div>
        <div className="border border-[#222] p-3">
          <div className="text-xs muted">30D TO HOLDERS</div>
          <div className="text-lg font-bold positive">
            {loading ? '...' : formatUSD(totals.holdersRevenue30d, true)}
          </div>
        </div>
        <div className="border border-[#222] p-3">
          <div className="text-xs muted">30D TOTAL FEES</div>
          <div className="text-lg font-bold">
            {loading ? '...' : formatUSD(totals.totalFees30d, true)}
          </div>
        </div>
        <div className="border border-[#222] p-3">
          <div className="text-xs muted">PROTOCOLS</div>
          <div className="text-lg font-bold">{data.length}</div>
        </div>
      </section>

      {error && (
        <div className="mb-4 p-3 border border-red-500/50 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Main Table */}
      <section className="overflow-x-auto border border-[#222]">
        <table className="text-sm">
          <thead className="bg-[#111]">
            <tr>
              <th className="w-8 text-center">#</th>
              <th className="text-left">PROTOCOL</th>
              <th className="text-left">TYPE</th>
              <SortHeader label="30D BUYBACK" sortKey="holdersRevenue30d" />
              <SortHeader label="RATE" sortKey="buybackRate" />
              <SortHeader label="30D FEES" sortKey="totalFees30d" />
              <SortHeader label="MCAP" sortKey="marketCap" />
              <th className="text-right">24H Δ</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 12 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={8}>
                    <div className="skeleton h-4 w-full my-1" />
                  </td>
                </tr>
              ))
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 muted">
                  No data available
                </td>
              </tr>
            ) : (
              sortedData.map((p, idx) => (
                <tr
                  key={p.slug}
                  className="cursor-pointer hover:bg-[#0a0a0a]"
                  onClick={() => setSelectedProtocol(p)}
                >
                  <td className="text-center muted">{idx + 1}</td>
                  <td>
                    <div className="font-semibold">{p.symbol}</div>
                    <div className="text-xs muted">{p.name}</div>
                  </td>
                  <td>
                    <span className={`text-xs px-1.5 py-0.5 ${
                      p.mechanism.includes('burn') ? 'bg-red-900/30 text-red-400' :
                      p.mechanism === 'buyback' ? 'bg-green-900/30 text-green-400' :
                      'bg-blue-900/30 text-blue-400'
                    }`}>
                      {p.mechanism}
                    </span>
                  </td>
                  <td className="text-right font-mono">
                    <span className={p.holdersRevenue30d > 0 ? 'positive' : 'muted'}>
                      {formatUSD(p.holdersRevenue30d, true)}
                    </span>
                  </td>
                  <td className="text-right font-mono">
                    <span className={p.buybackRate >= 5 ? 'positive' : ''}>
                      {formatPercent(p.buybackRate)}
                    </span>
                  </td>
                  <td className="text-right font-mono muted">
                    {formatUSD(p.totalFees30d, true)}
                  </td>
                  <td className="text-right font-mono">
                    {formatUSD(p.marketCap, true)}
                  </td>
                  <td className="text-right font-mono">
                    <span className={p.priceChange24h >= 0 ? 'positive' : 'negative'}>
                      {p.priceChange24h ? `${p.priceChange24h >= 0 ? '+' : ''}${p.priceChange24h.toFixed(1)}%` : '-'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {/* Legend */}
      <div className="mt-4 flex gap-4 text-xs muted">
        <span><span className="text-green-400">■</span> buyback</span>
        <span><span className="text-red-400">■</span> buyback-burn</span>
        <span><span className="text-blue-400">■</span> distribute</span>
      </div>

      {/* Protocol Detail Modal */}
      {selectedProtocol && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedProtocol(null)}
        >
          <div
            className="bg-black border border-[#333] max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-[#222] flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold">
                  {selectedProtocol.symbol}
                  <span className="ml-2 text-sm muted font-normal">
                    {selectedProtocol.name}
                  </span>
                </h2>
                <p className="text-xs muted mt-1">{selectedProtocol.description}</p>
              </div>
              <button
                onClick={() => setSelectedProtocol(null)}
                className="bg-transparent text-white border border-[#333] hover:border-white px-2 py-1"
              >
                ✕
              </button>
            </div>

            {/* Stats */}
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3 border-b border-[#222] text-sm">
              <div>
                <div className="text-xs muted">30D TO HOLDERS</div>
                <div className="text-lg font-bold positive">
                  {formatUSD(selectedProtocol.holdersRevenue30d, true)}
                </div>
              </div>
              <div>
                <div className="text-xs muted">BUYBACK RATE</div>
                <div className="text-lg font-bold">
                  {formatPercent(selectedProtocol.buybackRate)}
                </div>
                <div className="text-xs muted">annualized / mcap</div>
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
                  {formatUSD(selectedProtocol.holdersRevenueAllTime, true)}
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="p-4">
              <h3 className="text-xs muted mb-3">DAILY HOLDER REVENUE (90D)</h3>
              {selectedProtocol.dailyChart.length > 0 ? (
                <div style={{ height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={selectedProtocol.dailyChart}>
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#666', fontSize: 9 }}
                        tickFormatter={(v) => v.slice(5)}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#666', fontSize: 9 }}
                        tickFormatter={(v) => v >= 1e6 ? `$${(v/1e6).toFixed(1)}M` : `$${(v/1e3).toFixed(0)}K`}
                        width={50}
                      />
                      <Tooltip
                        contentStyle={{
                          background: '#000',
                          border: '1px solid #333',
                          fontSize: 11,
                        }}
                        formatter={(value: number) => [formatUSD(value), 'Revenue']}
                        labelFormatter={(label) => label}
                      />
                      <Bar dataKey="value" fill="#00ff00" radius={[1, 1, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8 muted text-sm">
                  No daily chart data available
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="p-4 border-t border-[#222] text-xs">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="muted">24H:</span>{' '}
                  {formatUSD(selectedProtocol.holdersRevenue24h, true)}
                </div>
                <div>
                  <span className="muted">7D:</span>{' '}
                  {formatUSD(selectedProtocol.holdersRevenue7d, true)}
                </div>
                <div>
                  <span className="muted">Price:</span>{' '}
                  ${selectedProtocol.price?.toFixed(selectedProtocol.price < 1 ? 4 : 2)}
                </div>
              </div>
              <p className="muted mt-3">
                Buyback Rate = (30d Holder Revenue × 12) / Market Cap
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-8 pt-4 border-t border-[#222] text-xs muted">
        <p>
          <strong>Holder Revenue</strong> = fees/revenue distributed to token holders (buybacks, staking rewards, veToken distributions)
        </p>
        <p className="mt-1">
          Data: <a href="https://defillama.com" target="_blank">DefiLlama</a> (dailyHoldersRevenue) + <a href="https://coingecko.com" target="_blank">CoinGecko</a> (prices)
        </p>
        <p className="mt-1">Auto-refresh: 60s</p>
      </footer>
    </div>
  );
}
