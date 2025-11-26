'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { MarketCoin } from '@/lib/types';

type SortKey = 'marketCapRank' | 'price' | 'priceChange24h' | 'priceChange7d' | 'marketCap' | 'volume24h';

function formatPrice(price: number): string {
  if (price >= 1000) return '$' + price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return '$' + price.toFixed(2);
  if (price >= 0.0001) return '$' + price.toFixed(4);
  return '$' + price.toPrecision(4);
}

function formatLargeNumber(num: number): string {
  if (num >= 1e12) return '$' + (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return '$' + (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return '$' + (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return '$' + (num / 1e3).toFixed(0) + 'K';
  return '$' + num.toFixed(0);
}

function formatSupply(num: number, symbol: string): string {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T ' + symbol;
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B ' + symbol;
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M ' + symbol;
  return num.toLocaleString() + ' ' + symbol;
}

function PctChange({ value }: { value: number }) {
  if (!value || isNaN(value)) return <span className="text-[#808a9d]">—</span>;
  const isPositive = value > 0;
  const isNegative = value < 0;
  const color = isPositive ? '#16c784' : isNegative ? '#ea3943' : '#808a9d';
  const arrow = isPositive ? '▲' : isNegative ? '▼' : '';
  return (
    <span style={{ color }} className="font-medium">
      {arrow} {Math.abs(value).toFixed(2)}%
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
    const interval = setInterval(loadData, 120000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === 'marketCapRank');
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

  // Calculate totals
  const totalMarketCap = coins.reduce((sum, c) => sum + (c.marketCap || 0), 0);
  const totalVolume = coins.reduce((sum, c) => sum + (c.volume24h || 0), 0);

  const SortableHeader = ({ label, sortKeyName, align = 'right' }: { label: string; sortKeyName: SortKey; align?: 'left' | 'right' }) => (
    <th 
      className={`py-4 px-2 font-medium text-[#808a9d] text-xs cursor-pointer hover:text-white transition-colors whitespace-nowrap ${align === 'right' ? 'text-right' : 'text-left'}`}
      onClick={() => handleSort(sortKeyName)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortKey === sortKeyName && (
          <span className="text-white">{sortAsc ? '↑' : '↓'}</span>
        )}
      </span>
    </th>
  );

  return (
    <div className="min-h-screen" style={{ background: '#0d1421' }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: '#323546', background: '#0d1421' }}>
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-white hover:text-[#6188ff] transition-colors font-semibold">
                ← Back
              </Link>
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-white">Clean Market Cap</h1>
                <span className="text-sm text-[#808a9d]">
                  No stablecoins · No wrapped tokens · No LSDs
                </span>
              </div>
            </div>
            {lastUpdated && (
              <span className="text-sm text-[#808a9d]">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-b" style={{ borderColor: '#323546' }}>
        <div className="max-w-[1400px] mx-auto px-6 py-3">
          <div className="flex items-center gap-8 text-sm">
            <div>
              <span className="text-[#808a9d]">Total Market Cap: </span>
              <span className="text-white font-semibold">{formatLargeNumber(totalMarketCap)}</span>
            </div>
            <div>
              <span className="text-[#808a9d]">24h Volume: </span>
              <span className="text-white font-semibold">{formatLargeNumber(totalVolume)}</span>
            </div>
            <div>
              <span className="text-[#808a9d]">Coins: </span>
              <span className="text-white font-semibold">{coins.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-[1400px] mx-auto px-6">
        {loading ? (
          <div className="py-8">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="h-16 mb-1 rounded" style={{ background: '#171924' }} />
            ))}
          </div>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0" style={{ background: '#0d1421' }}>
              <tr className="border-b" style={{ borderColor: '#323546' }}>
                <SortableHeader label="#" sortKeyName="marketCapRank" align="left" />
                <th className="py-4 px-2 text-left text-[#808a9d] text-xs font-medium">Name</th>
                <SortableHeader label="Price" sortKeyName="price" />
                <SortableHeader label="24h %" sortKeyName="priceChange24h" />
                <SortableHeader label="7d %" sortKeyName="priceChange7d" />
                <SortableHeader label="Market Cap" sortKeyName="marketCap" />
                <SortableHeader label="Volume(24h)" sortKeyName="volume24h" />
                <th className="py-4 px-2 text-right text-[#808a9d] text-xs font-medium whitespace-nowrap">Circulating Supply</th>
              </tr>
            </thead>
            <tbody>
              {sortedCoins.map((coin, idx) => (
                <tr 
                  key={coin.id} 
                  className="border-b hover:bg-[#171924] transition-colors"
                  style={{ borderColor: '#323546' }}
                >
                  <td className="py-4 px-2 text-[#808a9d] text-sm">
                    {sortKey === 'marketCapRank' ? idx + 1 : coin.marketCapRank}
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-3">
                      {coin.image && (
                        <img 
                          src={coin.image} 
                          alt={coin.name} 
                          className="w-6 h-6 rounded-full"
                          loading="lazy"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{coin.name}</span>
                          {coin.hasBuyback && (
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded" style={{ background: '#16c784', color: '#fff' }}>
                              BUYBACK
                            </span>
                          )}
                        </div>
                        <span className="text-[#808a9d] text-xs">{coin.symbol}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-right text-white font-medium">
                    {formatPrice(coin.price)}
                  </td>
                  <td className="py-4 px-2 text-right">
                    <PctChange value={coin.priceChange24h} />
                  </td>
                  <td className="py-4 px-2 text-right">
                    <PctChange value={coin.priceChange7d} />
                  </td>
                  <td className="py-4 px-2 text-right text-white">
                    {formatLargeNumber(coin.marketCap)}
                  </td>
                  <td className="py-4 px-2 text-right text-[#808a9d]">
                    {formatLargeNumber(coin.volume24h)}
                  </td>
                  <td className="py-4 px-2 text-right text-[#808a9d] text-sm">
                    {coin.circulatingSupply > 0 ? formatSupply(coin.circulatingSupply, coin.symbol) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div className="py-8 border-t mt-8" style={{ borderColor: '#323546' }}>
        <div className="max-w-[1400px] mx-auto px-6 text-center text-sm text-[#808a9d]">
          <p>Data from CoinGecko · Excludes stablecoins, wrapped tokens, LSDs, and CEX tokens</p>
          <p className="mt-2">
            <Link href="/" className="text-[#6188ff] hover:underline">
              ← Back to Buyback Tracker
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
