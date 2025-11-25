'use client';

import { useState, useEffect, useMemo } from 'react';
import { PROTOCOLS } from '@/lib/protocols';
import { fetchBuybackData, fetchMarketData } from '@/lib/defillama';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import Link from 'next/link';

interface ProtocolData {
  slug: string;
  name: string;
  symbol: string;
  buybackSource: string;
  revenue30d: number;
  buybackPercent: number;
  buyback30d: number;
  marketCap: number;
  price: number;
  circulatingSupply: number;
}

function formatUSD(value: number): string {
  if (!value || value === 0) return '$0';
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export default function Simulator() {
  const [protocols, setProtocols] = useState<ProtocolData[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Scenario multipliers
  const [revenueMultiplier, setRevenueMultiplier] = useState(1);
  const [priceMultiplier, setPriceMultiplier] = useState(1);
  const [buybackPercent, setBuybackPercent] = useState(100); // Will be set from data

  // Load protocol data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      
      const geckoIds = PROTOCOLS.map(p => p.geckoId);
      const marketData = await fetchMarketData(geckoIds);
      
      const results: ProtocolData[] = [];
      
      for (const protocol of PROTOCOLS) {
        const buyback = await fetchBuybackData(protocol.slug);
        const market = marketData[protocol.geckoId];
        
        if (buyback?.total30d && buyback.total30d > 0 && market?.marketCap) {
          // Estimate revenue (buyback is usually a % of revenue)
          // For most protocols, we know the buyback %, so we can back-calculate
          const estimatedBuybackPercent = getEstimatedBuybackPercent(protocol.slug);
          const estimatedRevenue = buyback.total30d / (estimatedBuybackPercent / 100);
          
          results.push({
            slug: protocol.slug,
            name: protocol.name,
            symbol: protocol.symbol,
            buybackSource: protocol.buybackSource,
            revenue30d: estimatedRevenue,
            buybackPercent: estimatedBuybackPercent,
            buyback30d: buyback.total30d,
            marketCap: market.marketCap,
            price: market.price,
            circulatingSupply: market.marketCap / market.price,
          });
        }
      }
      
      // Sort by buyback amount
      results.sort((a, b) => b.buyback30d - a.buyback30d);
      
      setProtocols(results);
      if (results.length > 0) {
        setSelectedSlug(results[0].slug);
        setBuybackPercent(results[0].buybackPercent);
      }
      setLoading(false);
    }
    
    loadData();
  }, []);

  // Get selected protocol
  const selected = useMemo(() => {
    return protocols.find(p => p.slug === selectedSlug);
  }, [protocols, selectedSlug]);

  // When protocol changes, reset sliders
  useEffect(() => {
    if (selected) {
      setBuybackPercent(selected.buybackPercent);
      setRevenueMultiplier(1);
      setPriceMultiplier(1);
    }
  }, [selected]);

  // Calculate scenario metrics
  const metrics = useMemo(() => {
    if (!selected) return null;

    // Base values
    const baseRevenue30d = selected.revenue30d;
    const basePrice = selected.price;
    const baseMarketCap = selected.marketCap;
    const circulatingSupply = selected.circulatingSupply;

    // Scenario values
    const scenarioRevenue30d = baseRevenue30d * revenueMultiplier;
    const scenarioBuyback30d = scenarioRevenue30d * (buybackPercent / 100);
    const scenarioPrice = basePrice * priceMultiplier;
    const scenarioMarketCap = scenarioPrice * circulatingSupply;

    // Annualized
    const annualRevenue = scenarioRevenue30d * 12;
    const annualBuyback = scenarioBuyback30d * 12;

    // Key metrics
    const buybackYield = scenarioMarketCap > 0 ? (annualBuyback / scenarioMarketCap) * 100 : 0;
    const dailyBuyback = scenarioBuyback30d / 30;
    const hourlyBuyback = dailyBuyback / 24;
    const supplyAbsorption = (annualBuyback / scenarioMarketCap) * 100;
    const yearsToBuyFloat = annualBuyback > 0 ? scenarioMarketCap / annualBuyback : Infinity;

    // Compare to baseline
    const baseAnnualBuyback = selected.buyback30d * 12;
    const baseBuybackYield = baseMarketCap > 0 ? (baseAnnualBuyback / baseMarketCap) * 100 : 0;

    return {
      // Base
      baseRevenue30d,
      basePrice,
      baseMarketCap,
      baseBuybackYield,
      baseAnnualBuyback,
      // Scenario
      scenarioRevenue30d,
      scenarioBuyback30d,
      scenarioPrice,
      scenarioMarketCap,
      annualRevenue,
      annualBuyback,
      buybackYield,
      dailyBuyback,
      hourlyBuyback,
      supplyAbsorption,
      yearsToBuyFloat,
      circulatingSupply,
      // Changes
      yieldChange: buybackYield - baseBuybackYield,
    };
  }, [selected, revenueMultiplier, priceMultiplier, buybackPercent]);

  // Generate projection data for chart
  const projectionData = useMemo(() => {
    if (!metrics) return [];

    const data = [];
    const years = 5;
    const monthsPerPoint = 3; // Quarterly points
    const totalPoints = (years * 12) / monthsPerPoint;

    for (let i = 0; i <= totalPoints; i++) {
      const months = i * monthsPerPoint;
      const years_elapsed = months / 12;
      
      // Cumulative buyback
      const cumulativeBuyback = metrics.annualBuyback * years_elapsed;
      const cumulativeAsPercentOfMcap = (cumulativeBuyback / metrics.scenarioMarketCap) * 100;
      
      // Baseline comparison (no scenario changes)
      const baselineCumulative = metrics.baseAnnualBuyback * years_elapsed;
      const baselineAsPercent = (baselineCumulative / metrics.baseMarketCap) * 100;

      // No buyback scenario
      const noBuyback = 0;

      data.push({
        label: months === 0 ? 'Now' : `${years_elapsed.toFixed(1)}y`,
        months,
        scenario: Math.min(cumulativeAsPercentOfMcap, 200),
        baseline: Math.min(baselineAsPercent, 200),
        noBuyback,
        scenarioUSD: cumulativeBuyback,
        baselineUSD: baselineCumulative,
      });
    }

    return data;
  }, [metrics]);

  // Get insight text based on metrics
  const getInsight = () => {
    if (!metrics) return '';
    
    const { buybackYield, yearsToBuyFloat, yieldChange } = metrics;

    let insight = '';

    if (buybackYield >= 25) {
      insight = 'Extremely high buyback yield. If sustained, this creates massive buy pressure relative to market cap.';
    } else if (buybackYield >= 15) {
      insight = 'Very strong buyback yield. Comparable to the highest-yielding dividend stocks.';
    } else if (buybackYield >= 8) {
      insight = 'Solid buyback yield. This level of consistent buying provides meaningful price support.';
    } else if (buybackYield >= 3) {
      insight = 'Moderate buyback yield. Provides some support but other factors will likely dominate price.';
    } else {
      insight = 'Low buyback yield. Buybacks alone unlikely to significantly impact price.';
    }

    if (yieldChange > 5) {
      insight += ` In this scenario, yield increases by ${yieldChange.toFixed(1)}pp — significantly more buying power.`;
    } else if (yieldChange < -5) {
      insight += ` In this scenario, yield decreases by ${Math.abs(yieldChange).toFixed(1)}pp — less relative buying power.`;
    }

    if (priceMultiplier < 1) {
      insight += ' Note: Lower prices increase buyback yield — the protocol buys more tokens for the same dollars.';
    }

    return insight;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Loading protocol data...</div>
          <div className="text-sm muted mt-2">Fetching from DefiLlama & CoinGecko</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-lg font-semibold">Buyback Simulator</h1>
              <p className="text-sm muted">
                Model how buybacks impact token economics
              </p>
            </div>
            <Link href="/" className="text-sm">
              ← Back to Tracker
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Protocol Selector */}
        <div className="card p-4">
          <label className="block text-sm font-medium mb-2">Select Protocol</label>
          <select
            value={selectedSlug}
            onChange={(e) => setSelectedSlug(e.target.value)}
            className="w-full max-w-md"
          >
            {protocols.map(p => (
              <option key={p.slug} value={p.slug}>
                {p.symbol} — {p.name}
              </option>
            ))}
          </select>
          
          {selected && (
            <div className="mt-3 text-sm muted">
              <strong>Revenue source:</strong> {selected.buybackSource}
            </div>
          )}
        </div>

        {selected && metrics && (
          <>
            {/* Current Data */}
            <div className="card p-4">
              <h2 className="text-sm font-semibold mb-3 uppercase text-gray-500">
                Current Data (from DefiLlama)
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="muted">30-Day Revenue</div>
                  <div className="text-lg font-semibold mono">{formatUSD(metrics.baseRevenue30d)}</div>
                </div>
                <div>
                  <div className="muted">Buyback Rate</div>
                  <div className="text-lg font-semibold mono">{selected.buybackPercent}%</div>
                </div>
                <div>
                  <div className="muted">Market Cap</div>
                  <div className="text-lg font-semibold mono">{formatUSD(metrics.baseMarketCap)}</div>
                </div>
                <div>
                  <div className="muted">Current Yield</div>
                  <div className="text-lg font-semibold mono">{formatPercent(metrics.baseBuybackYield)}</div>
                </div>
              </div>
            </div>

            {/* Scenario Controls */}
            <div className="card p-4">
              <h2 className="text-sm font-semibold mb-4 uppercase text-gray-500">
                What If...
              </h2>
              
              <div className="space-y-6">
                {/* Revenue Slider */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Revenue changes to:</span>
                    <span className="mono">
                      {revenueMultiplier === 1 ? 'Current' : `${revenueMultiplier}x`} ({formatUSD(metrics.scenarioRevenue30d)}/30d)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.25"
                    max="3"
                    step="0.25"
                    value={revenueMultiplier}
                    onChange={(e) => setRevenueMultiplier(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs muted mt-1">
                    <span>0.25x</span>
                    <span>1x</span>
                    <span>2x</span>
                    <span>3x</span>
                  </div>
                </div>

                {/* Price Slider */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Price changes to:</span>
                    <span className="mono">
                      {priceMultiplier === 1 ? 'Current' : `${priceMultiplier > 1 ? '+' : ''}${((priceMultiplier - 1) * 100).toFixed(0)}%`} (${metrics.scenarioPrice.toFixed(metrics.scenarioPrice < 1 ? 4 : 2)})
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.25"
                    max="3"
                    step="0.25"
                    value={priceMultiplier}
                    onChange={(e) => setPriceMultiplier(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs muted mt-1">
                    <span>-75%</span>
                    <span>Current</span>
                    <span>+100%</span>
                    <span>+200%</span>
                  </div>
                </div>

                {/* Buyback % Slider */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Buyback % of revenue:</span>
                    <span className="mono">{buybackPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={buybackPercent}
                    onChange={(e) => setBuybackPercent(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs muted mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Calculated Results */}
            <div className="card p-4">
              <h2 className="text-sm font-semibold mb-3 uppercase text-gray-500">
                Scenario Results
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <div className="muted">Annual Buyback</div>
                  <div className="text-xl font-semibold mono">{formatUSD(metrics.annualBuyback)}</div>
                </div>
                <div>
                  <div className="muted">Buyback Yield</div>
                  <div className={`text-xl font-semibold mono ${metrics.buybackYield >= 15 ? 'text-green-700' : ''}`}>
                    {formatPercent(metrics.buybackYield)}
                  </div>
                  {metrics.yieldChange !== 0 && (
                    <div className={`text-xs ${metrics.yieldChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {metrics.yieldChange > 0 ? '+' : ''}{metrics.yieldChange.toFixed(1)}pp vs current
                    </div>
                  )}
                </div>
                <div>
                  <div className="muted">Daily Buying</div>
                  <div className="text-xl font-semibold mono">{formatUSD(metrics.dailyBuyback)}</div>
                </div>
                <div>
                  <div className="muted">Hourly Buying</div>
                  <div className="text-xl font-semibold mono">{formatUSD(metrics.hourlyBuyback)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm border-t border-gray-100 pt-4">
                <div>
                  <div className="muted">Supply absorbed per year</div>
                  <div className="font-semibold mono">{formatPercent(metrics.supplyAbsorption)}</div>
                </div>
                <div>
                  <div className="muted">Years to buy entire market cap</div>
                  <div className="font-semibold mono">
                    {metrics.yearsToBuyFloat === Infinity ? '∞' : `${metrics.yearsToBuyFloat.toFixed(1)} years`}
                  </div>
                </div>
              </div>
            </div>

            {/* Insight */}
            <div className="card p-4 bg-gray-50">
              <div className="text-sm">
                <strong>Insight:</strong> {getInsight()}
              </div>
            </div>

            {/* Chart */}
            <div className="card p-4">
              <h2 className="text-sm font-semibold mb-1 uppercase text-gray-500">
                Cumulative Buyback Over Time
              </h2>
              <p className="text-xs muted mb-4">
                Shows total buyback as % of market cap. At 100%, cumulative buybacks equal entire market cap.
              </p>
              
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projectionData}>
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#888', fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#888', fontSize: 11 }}
                      tickFormatter={(v) => `${v}%`}
                      domain={[0, 'auto']}
                      width={40}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#fff',
                        border: '1px solid #e5e5e5',
                        borderRadius: 4,
                        fontSize: 12,
                      }}
                      formatter={(value: number, name: string) => {
                        const labels: Record<string, string> = {
                          scenario: 'Scenario',
                          baseline: 'Current rate',
                        };
                        return [`${value.toFixed(1)}% of mcap`, labels[name] || name];
                      }}
                    />
                    <ReferenceLine y={100} stroke="#ccc" strokeDasharray="5 5" />
                    <Area
                      type="monotone"
                      dataKey="baseline"
                      stroke="#999"
                      strokeWidth={1}
                      fill="#f0f0f0"
                      strokeDasharray="4 4"
                      name="baseline"
                    />
                    <Area
                      type="monotone"
                      dataKey="scenario"
                      stroke="#111"
                      strokeWidth={2}
                      fill="#e5e5e5"
                      name="scenario"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex gap-6 text-xs muted mt-2">
                <span><span className="inline-block w-4 h-0.5 bg-black mr-1 align-middle"></span> Scenario</span>
                <span><span className="inline-block w-4 h-0.5 bg-gray-400 mr-1 align-middle border-dashed"></span> Current rate</span>
                <span><span className="inline-block w-4 h-0.5 bg-gray-300 mr-1 align-middle"></span> 100% = entire mcap</span>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="text-xs muted p-4 bg-gray-50 rounded-lg">
              <strong>⚠️ This is a simplified model.</strong> It does not predict price. Real prices depend on:
              market sentiment, macro conditions, token unlocks, whale activity, and countless other factors.
              Buyback yield is a fundamental metric (like dividend yield for stocks) — it shows protocol 
              commitment to returning value, not a price guarantee.
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// Helper function to estimate buyback % based on protocol
function getEstimatedBuybackPercent(slug: string): number {
  const estimates: Record<string, number> = {
    'hyperliquid': 99,
    'pump.fun': 80,
    'aerodrome': 100, // All fees to veAERO
    'curve-dex': 50,
    'aave': 100,
    'pendle': 80,
    'raydium': 12,
    'gmx': 30,
    'dydx': 100,
    'pancakeswap-amm': 20,
    'sushiswap': 17, // 0.05% of 0.3% fee
    'ether.fi': 50,
    'quickswap-dex': 50,
    'orca': 50,
    'velodrome-v2': 100,
    'camelot-v3': 50,
    'thena-v2': 100,
    'banana-gun-trading': 40,
    'unibot': 40,
    'maker': 100,
  };
  return estimates[slug] || 50;
}

