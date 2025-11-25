'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { PROTOCOLS, ProtocolConfig } from '@/lib/protocols';
import { fetchBuybackData, fetchMarketData, BuybackData } from '@/lib/defillama';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Link from 'next/link';

interface ProtocolData extends ProtocolConfig {
  buyback: BuybackData | null;
  price: number;
  marketCap: number;
  priceChange24h: number;
  // Calculated metrics
  hourlyAvg: number;
  dailyAvg: number;
  weeklyAvg: number;
  annualized: number;
  peRatio: number | null; // null if no buyback
  trend: number; // % change in buyback (recent vs prior)
}

function formatUSD(value: number): string {
  if (!value || value === 0) return '—';
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function formatNumber(value: number, decimals = 1): string {
  if (!value || value === 0) return '—';
  return value.toFixed(decimals);
}

function getPERating(pe: number | null): { label: string; class: string } {
  if (pe === null || pe <= 0) return { label: '—', class: 'muted' };
  if (pe < 10) return { label: `${pe.toFixed(1)}x`, class: 'pe-cheap' };
  if (pe < 25) return { label: `${pe.toFixed(1)}x`, class: 'pe-fair' };
  if (pe < 50) return { label: `${pe.toFixed(1)}x`, class: '' };
  return { label: `${pe.toFixed(0)}x`, class: 'pe-expensive' };
}

type SortKey = 'peRatio' | 'dailyAvg' | 'marketCap' | 'annualized';

export default function Dashboard() {
  const [data, setData] = useState<ProtocolData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedProtocol, setSelectedProtocol] = useState<ProtocolData | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>('dailyAvg');
  const [sortAsc, setSortAsc] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    
    // Fetch market data
    const geckoIds = PROTOCOLS.map(p => p.geckoId);
    const marketData = await fetchMarketData(geckoIds);
    
    // Fetch buyback data for all protocols in parallel
    const results = await Promise.all(
      PROTOCOLS.map(async (protocol) => {
        const buyback = await fetchBuybackData(protocol.slug);
        const market = marketData[protocol.geckoId] || { price: 0, marketCap: 0, priceChange24h: 0 };
        
        // Calculate metrics
        const total30d = buyback?.total30d || 0;
        const total7d = buyback?.total7d || 0;
        
        const dailyAvg = total30d / 30;
        const hourlyAvg = dailyAvg / 24;
        const weeklyAvg = total30d / 4.3;
        const annualized = total30d * 12;
        
        // P/E = Market Cap / Annualized Buyback
        const peRatio = annualized > 0 && market.marketCap > 0 
          ? market.marketCap / annualized 
          : null;
        
        // Trend: compare last 7d to prior 7d (rough approximation)
        const prior7d = total30d > 0 ? (total30d - total7d) / 3.3 : 0; // ~23 days / 3.3 weeks
        const trend = prior7d > 0 ? ((total7d - prior7d) / prior7d) * 100 : 0;
        
        return {
          ...protocol,
          buyback,
          price: market.price,
          marketCap: market.marketCap,
          priceChange24h: market.priceChange24h,
          hourlyAvg,
          dailyAvg,
          weeklyAvg,
          annualized,
          peRatio,
          trend,
        };
      })
    );
    
    setData(results.filter(p => p.buyback?.total30d && p.buyback.total30d > 0));
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 120000); // 2 min refresh
    return () => clearInterval(interval);
  }, [loadData]);

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let aVal = a[sortBy] ?? (sortAsc ? Infinity : -Infinity);
      let bVal = b[sortBy] ?? (sortAsc ? Infinity : -Infinity);
      
      // For P/E, lower is better so we handle nulls differently
      if (sortBy === 'peRatio') {
        if (aVal === null) aVal = sortAsc ? -Infinity : Infinity;
        if (bVal === null) bVal = sortAsc ? -Infinity : Infinity;
      }
      
      return sortAsc ? aVal - bVal : bVal - aVal;
    });
  }, [data, sortBy, sortAsc]);

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(key);
      setSortAsc(key === 'peRatio'); // Default ascending for P/E (lower is better)
    }
  };

  const SortHeader = ({ label, sortKey, align = 'right' }: { label: string; sortKey: SortKey; align?: string }) => (
    <th
      className={`cursor-pointer hover:text-black ${align === 'right' ? 'text-right' : 'text-left'}`}
      onClick={() => handleSort(sortKey)}
    >
      {label} {sortBy === sortKey && (sortAsc ? '↑' : '↓')}
    </th>
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-lg font-semibold">Crypto Buyback Tracker</h1>
              <p className="text-sm muted">
                Evaluate tokens by their buyback yield
              </p>
            </div>
            <Link href="/simulator" className="text-sm px-3 py-1.5 bg-gray-100 rounded hover:bg-gray-200 no-underline">
              Simulator →
            </Link>
            <div className="text-right">
              <button onClick={loadData} disabled={loading} className="text-sm">
                {loading ? 'Loading...' : 'Refresh'}
              </button>
              {lastUpdated && (
                <p className="text-xs muted mt-1">
                  Updated {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* P/E Guide */}
        <div className="card p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className="text-sm font-medium">P/E Ratio Guide</span>
              <span className="text-sm muted ml-2">
                (Market Cap ÷ Annual Buyback)
              </span>
            </div>
            <div className="flex gap-6 text-sm">
              <span><span className="pe-cheap font-medium">&lt;10x</span> Cheap</span>
              <span><span className="pe-fair font-medium">10-25x</span> Fair</span>
              <span><span className="font-medium">25-50x</span> Growth</span>
              <span><span className="pe-expensive font-medium">&gt;50x</span> Expensive</span>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th className="w-12">#</th>
                  <th className="text-left min-w-[180px]">Protocol</th>
                  <th className="text-left min-w-[200px]">Buyback Source</th>
                  <SortHeader label="Daily Avg" sortKey="dailyAvg" />
                  <th className="text-right">Weekly Avg</th>
                  <SortHeader label="Annual" sortKey="annualized" />
                  <SortHeader label="Market Cap" sortKey="marketCap" />
                  <SortHeader label="P/E" sortKey="peRatio" />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={8}>
                        <div className="skeleton h-5 w-full" />
                      </td>
                    </tr>
                  ))
                ) : sortedData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 muted">
                      No buyback data available
                    </td>
                  </tr>
                ) : (
                  sortedData.map((p, idx) => {
                    const pe = getPERating(p.peRatio);
                    return (
                      <tr
                        key={p.slug}
                        className="cursor-pointer"
                        onClick={() => setSelectedProtocol(p)}
                      >
                        <td className="muted">{idx + 1}</td>
                        <td>
                          <div className="font-medium">{p.symbol}</div>
                          <div className="text-xs muted">{p.name}</div>
                        </td>
                        <td>
                          <div className="text-sm text-gray-600 max-w-[250px] truncate">
                            {p.buybackSource}
                          </div>
                        </td>
                        <td className="text-right mono">
                          {formatUSD(p.dailyAvg)}
                        </td>
                        <td className="text-right mono muted">
                          {formatUSD(p.weeklyAvg)}
                        </td>
                        <td className="text-right mono">
                          {formatUSD(p.annualized)}
                        </td>
                        <td className="text-right mono">
                          {formatUSD(p.marketCap)}
                        </td>
                        <td className="text-right">
                          <span className={`mono font-medium ${pe.class}`}>
                            {pe.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-sm muted">
          <p>
            Data from <a href="https://defillama.com" target="_blank">DefiLlama</a> (buybacks) 
            and <a href="https://coingecko.com" target="_blank">CoinGecko</a> (prices).
            P/E = Market Cap ÷ Annualized Buyback. Lower P/E = higher buyback yield.
          </p>
        </footer>
      </main>

      {/* Protocol Detail Modal */}
      {selectedProtocol && (
        <div
          className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedProtocol(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">
                    {selectedProtocol.symbol}
                    <span className="ml-2 text-base font-normal muted">
                      {selectedProtocol.name}
                    </span>
                  </h2>
                  <p className="text-sm muted mt-1">
                    {selectedProtocol.buybackSource}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedProtocol(null)}
                  className="secondary text-sm px-3 py-1"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-gray-200">
              <div>
                <div className="text-xs muted uppercase">P/E Ratio</div>
                <div className={`text-2xl font-semibold mono ${getPERating(selectedProtocol.peRatio).class}`}>
                  {getPERating(selectedProtocol.peRatio).label}
                </div>
              </div>
              <div>
                <div className="text-xs muted uppercase">Daily Avg</div>
                <div className="text-2xl font-semibold mono">
                  {formatUSD(selectedProtocol.dailyAvg)}
                </div>
              </div>
              <div>
                <div className="text-xs muted uppercase">Annual</div>
                <div className="text-2xl font-semibold mono">
                  {formatUSD(selectedProtocol.annualized)}
                </div>
              </div>
              <div>
                <div className="text-xs muted uppercase">Market Cap</div>
                <div className="text-2xl font-semibold mono">
                  {formatUSD(selectedProtocol.marketCap)}
                </div>
              </div>
            </div>

            {/* Business Analysis */}
            <div className="p-6 space-y-4 border-b border-gray-200">
              <div>
                <h3 className="text-sm font-semibold mb-1">Business Model</h3>
                <p className="text-sm text-gray-600">{selectedProtocol.businessModel}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1">Growth Drivers</h3>
                <p className="text-sm text-gray-600">{selectedProtocol.growthDrivers}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1">Risks</h3>
                <p className="text-sm text-gray-600">{selectedProtocol.risks}</p>
              </div>
            </div>

            {/* Chart */}
            <div className="p-6">
              <h3 className="text-sm font-semibold mb-4">Daily Buyback (90 days)</h3>
              {selectedProtocol.buyback?.dailyChart && selectedProtocol.buyback.dailyChart.length > 0 ? (
                <div style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={selectedProtocol.buyback.dailyChart}>
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#888', fontSize: 10 }}
                        tickFormatter={(v) => v.slice(5)}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#888', fontSize: 10 }}
                        tickFormatter={(v) => v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : `${(v/1e3).toFixed(0)}K`}
                        width={45}
                      />
                      <Tooltip
                        contentStyle={{
                          background: '#fff',
                          border: '1px solid #e5e5e5',
                          borderRadius: 4,
                          fontSize: 12,
                        }}
                        formatter={(value: number) => [formatUSD(value), 'Buyback']}
                      />
                      <Bar dataKey="value" fill="#111" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8 muted">No chart data</div>
              )}
            </div>

            {/* Additional Stats */}
            <div className="p-6 bg-gray-50 rounded-b-lg">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="muted">Hourly Avg:</span>
                  <span className="ml-2 mono">{formatUSD(selectedProtocol.hourlyAvg)}</span>
                </div>
                <div>
                  <span className="muted">Weekly Avg:</span>
                  <span className="ml-2 mono">{formatUSD(selectedProtocol.weeklyAvg)}</span>
                </div>
                <div>
                  <span className="muted">All Time:</span>
                  <span className="ml-2 mono">{formatUSD(selectedProtocol.buyback?.totalAllTime || 0)}</span>
                </div>
                <div>
                  <span className="muted">Price:</span>
                  <span className="ml-2 mono">${selectedProtocol.price?.toFixed(selectedProtocol.price < 1 ? 4 : 2)}</span>
                </div>
                <div>
                  <span className="muted">24h Change:</span>
                  <span className="ml-2 mono">
                    {selectedProtocol.priceChange24h >= 0 ? '+' : ''}
                    {selectedProtocol.priceChange24h?.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="muted">30d Buyback:</span>
                  <span className="ml-2 mono">{formatUSD(selectedProtocol.buyback?.total30d || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
