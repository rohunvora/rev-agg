'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { MarketCoin } from '@/lib/types';

type SortKey = 'marketCapRank' | 'price' | 'priceChange24h' | 'priceChange7d' | 'marketCap' | 'volume24h';

function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(2);
  if (price >= 0.01) return price.toFixed(4);
  return price.toPrecision(4);
}

function formatLargeNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(0)}K`;
  return `$${num.toFixed(0)}`;
}

function formatSupply(num: number, symbol: string): string {
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T ${symbol}`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B ${symbol}`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M ${symbol}`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(0)}K ${symbol}`;
  return `${num.toFixed(0)} ${symbol}`;
}

function PctChange({ value }: { value: number }) {
  if (!value || isNaN(value)) return <span className="text-gray-500">—</span>;
  const isPositive = value > 0;
  const isNegative = value < 0;
  return (
    <span className={isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-gray-400'}>
      {isPositive && '▲ '}{isNegative && '▼ '}{Math.abs(value).toFixed(2)}%
    </span>
  );
}

export default function MarketPage() {
  const [coins, setCoins] = useState<MarketCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('marketCapRank');
  const [sortAsc, setSortAsc] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    try {
      const response = await fetch('/api/data?type=market');
      const { data } = await response.json();
      if (data && data.length > 0) {
        setCoins(data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error loading market data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 120000); // Refresh every 2 min
    return () => clearInterval(interval);
  }, [loadData]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === 'marketCapRank'); // Ascending for rank, descending for others
    }
  };

  const sortedCoins = useMemo(() => {
    const sorted = [...coins].sort((a, b) => {
      let aVal = a[sortKey] ?? 0;
      let bVal = b[sortKey] ?? 0;
      if (sortAsc) return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });
    return sorted;
  }, [coins, sortKey, sortAsc]);

  const SortHeader = ({ label, sortKeyName, className = '' }: { label: string; sortKeyName: SortKey; className?: string }) => (
    <th 
      className={`px-3 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors select-none ${className}`}
      onClick={() => handleSort(sortKeyName)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortKey === sortKeyName && (
          <span className="text-blue-400">{sortAsc ? '↑' : '↓'}</span>
        )}
      </div>
    </th>
  );

  // Calculate totals
  const totalMarketCap = coins.reduce((sum, c) => sum + (c.marketCap || 0), 0);
  const totalVolume = coins.reduce((sum, c) => sum + (c.volume24h || 0), 0);

  return (
    <div className="min-h-screen bg-[#0d1421] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0d1421]/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-xl font-bold text-white hover:text-blue-400 transition-colors">
                ← Back
              </Link>
              <h1 className="text-2xl font-bold">
                Clean Market Cap
              </h1>
              <span className="text-sm text-gray-400 hidden sm:inline">
                No stablecoins · No wrapped tokens · No LSDs
              </span>
            </div>
            {lastUpdated && (
              <div className="text-sm text-gray-500">
                Updated {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="border-b border-gray-800 bg-[#0d1421]">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-8 text-sm">
            <div>
              <span className="text-gray-400">Total Market Cap: </span>
              <span className="font-semibold text-white">{formatLargeNumber(totalMarketCap)}</span>
            </div>
            <div>
              <span className="text-gray-400">24h Volume: </span>
              <span className="font-semibold text-white">{formatLargeNumber(totalVolume)}</span>
            </div>
            <div>
              <span className="text-gray-400">Coins: </span>
              <span className="font-semibold text-white">{coins.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="space-y-2">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-800/50 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-800">
                  <SortHeader label="#" sortKeyName="marketCapRank" className="w-12" />
                  <th className="px-3 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-48">Name</th>
                  <SortHeader label="Price" sortKeyName="price" className="text-right" />
                  <SortHeader label="24h %" sortKeyName="priceChange24h" className="text-right" />
                  <SortHeader label="7d %" sortKeyName="priceChange7d" className="text-right" />
                  <SortHeader label="Market Cap" sortKeyName="marketCap" className="text-right" />
                  <SortHeader label="Volume (24h)" sortKeyName="volume24h" className="text-right" />
                  <th className="px-3 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Circulating Supply</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {sortedCoins.map((coin, idx) => (
                  <tr 
                    key={coin.id} 
                    className="hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-3 py-4 text-sm text-gray-400">
                      {sortKey === 'marketCapRank' ? idx + 1 : coin.marketCapRank}
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-3">
                        {coin.image && (
                          <img 
                            src={coin.image} 
                            alt={coin.name} 
                            className="w-8 h-8 rounded-full"
                            loading="lazy"
                          />
                        )}
                        <div>
                          <div className="font-semibold text-white flex items-center gap-2">
                            {coin.name}
                            {coin.hasBuyback && (
                              <span className="px-1.5 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-400 rounded">
                                BUYBACK
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{coin.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-right font-mono text-white">
                      ${formatPrice(coin.price)}
                    </td>
                    <td className="px-3 py-4 text-right font-mono">
                      <PctChange value={coin.priceChange24h} />
                    </td>
                    <td className="px-3 py-4 text-right font-mono">
                      <PctChange value={coin.priceChange7d} />
                    </td>
                    <td className="px-3 py-4 text-right font-mono text-white">
                      {formatLargeNumber(coin.marketCap)}
                    </td>
                    <td className="px-3 py-4 text-right font-mono text-gray-300">
                      {formatLargeNumber(coin.volume24h)}
                    </td>
                    <td className="px-3 py-4 text-right font-mono text-gray-400 text-sm">
                      {coin.circulatingSupply > 0 ? formatSupply(coin.circulatingSupply, coin.symbol) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>Data from CoinGecko · Excludes stablecoins, wrapped tokens, LSDs, and CEX tokens</p>
          <p className="mt-1">
            <Link href="/" className="text-blue-400 hover:text-blue-300">
              ← Back to Buyback Tracker
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

