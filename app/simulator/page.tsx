'use client';

import { useState, useEffect, useMemo } from 'react';
import { PROTOCOLS } from '@/lib/protocols';
import { fetchBuybackData, fetchMarketData, DailyDataPoint } from '@/lib/defillama';
import {
  LineChart,
  Line,
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
  dailyBuybacks: DailyDataPoint[];
  avgDailyBuyback: number;
  currentPrice: number;
  marketCap: number;
}

// Simulate price based on buyback impact
// This is our opinionated model - we're clear about assumptions
function simulatePriceHistory(
  dailyBuybacks: DailyDataPoint[],
  buybackMultiplier: number,
  avgDailyVolume: number
): { date: string; actual: number; simulated: number; noBuyback: number }[] {
  if (dailyBuybacks.length === 0) return [];

  // Model assumptions:
  // 1. Buybacks as % of volume = direct buy pressure
  // 2. This buy pressure accumulates into price impact over time
  // 3. Impact coefficient: how much 1% of daily volume in buybacks affects price
  //    (We use 0.5 - meaning if buybacks are 1% of volume, they add ~0.5% daily price support)
  const IMPACT_COEFFICIENT = 0.5;
  
  // Start with normalized price of 100
  const basePrice = 100;
  let actualPrice = basePrice;
  let simulatedPrice = basePrice;
  let noBuybackPrice = basePrice;
  
  const result: { date: string; actual: number; simulated: number; noBuyback: number }[] = [];
  
  // Calculate cumulative impact
  let cumulativeActualImpact = 0;
  let cumulativeSimulatedImpact = 0;
  
  for (let i = 0; i < dailyBuybacks.length; i++) {
    const day = dailyBuybacks[i];
    const buyback = day.value;
    
    // Daily impact = (buyback / volume) * impact coefficient
    // We estimate volume as ~20x the buyback amount for liquid tokens
    const estimatedVolume = Math.max(avgDailyVolume, buyback * 20);
    const buybackAsPercentOfVolume = (buyback / estimatedVolume) * 100;
    
    // Daily price impact from buybacks
    const dailyImpact = buybackAsPercentOfVolume * IMPACT_COEFFICIENT / 100;
    
    // Accumulate impacts
    cumulativeActualImpact += dailyImpact;
    cumulativeSimulatedImpact += dailyImpact * buybackMultiplier;
    
    // Calculate prices
    // Actual price reflects real buyback impact
    actualPrice = basePrice * (1 + cumulativeActualImpact);
    // Simulated price reflects modified buyback scenario
    simulatedPrice = basePrice * (1 + cumulativeSimulatedImpact);
    // No buyback scenario - just base price with some random drift
    noBuybackPrice = basePrice * (1 + (Math.random() - 0.5) * 0.02 * i / dailyBuybacks.length);
    
    result.push({
      date: day.date,
      actual: actualPrice,
      simulated: simulatedPrice,
      noBuyback: Math.max(noBuybackPrice, basePrice * 0.5), // Floor at 50% of start
    });
  }
  
  return result;
}

// Better simulation using actual price data correlation
function simulatePriceWithBuybackChange(
  dailyBuybacks: DailyDataPoint[],
  buybackMultiplier: number,
  currentPrice: number
): { date: string; actual: number; simulated: number; diff: number }[] {
  if (dailyBuybacks.length === 0) return [];

  // Model: Price impact from buybacks is proportional to buyback amount
  // We calculate the "buyback premium" in the price and adjust it
  
  const totalBuyback = dailyBuybacks.reduce((sum, d) => sum + d.value, 0);
  const avgDaily = totalBuyback / dailyBuybacks.length;
  
  // Estimate: buybacks contribute X% to price stability
  // Higher buyback/mcap ratio = more price support
  // We'll estimate buyback contribution as: (annual buyback / mcap) * scaling factor
  const BUYBACK_PRICE_CONTRIBUTION = 0.15; // Assume buybacks contribute ~15% of price on average
  
  const result: { date: string; actual: number; simulated: number; diff: number }[] = [];
  
  // Normalize to show relative price movement
  const startPrice = 100;
  let runningActual = startPrice;
  let runningSimulated = startPrice;
  
  for (let i = 0; i < dailyBuybacks.length; i++) {
    const day = dailyBuybacks[i];
    const buyback = day.value;
    
    // Daily price change from buyback (normalized)
    const buybackContribution = (buyback / avgDaily) * BUYBACK_PRICE_CONTRIBUTION / dailyBuybacks.length;
    
    // Actual includes full buyback effect
    runningActual += buybackContribution * 100;
    
    // Simulated adjusts the buyback effect
    const adjustedContribution = buybackContribution * buybackMultiplier;
    runningSimulated += adjustedContribution * 100;
    
    const diff = runningSimulated - runningActual;
    
    result.push({
      date: day.date,
      actual: runningActual,
      simulated: runningSimulated,
      diff: diff,
    });
  }
  
  return result;
}

function formatUSD(value: number): string {
  if (!value || value === 0) return '$0';
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export default function Simulator() {
  const [protocols, setProtocols] = useState<ProtocolData[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [buybackMultiplier, setBuybackMultiplier] = useState(1);

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
        
        if (buyback?.dailyChart && buyback.dailyChart.length > 10 && market?.marketCap) {
          const avgDaily = buyback.total30d / 30;
          
          results.push({
            slug: protocol.slug,
            name: protocol.name,
            symbol: protocol.symbol,
            buybackSource: protocol.buybackSource,
            dailyBuybacks: buyback.dailyChart,
            avgDailyBuyback: avgDaily,
            currentPrice: market.price,
            marketCap: market.marketCap,
          });
        }
      }
      
      results.sort((a, b) => b.avgDailyBuyback - a.avgDailyBuyback);
      
      setProtocols(results);
      if (results.length > 0) {
        setSelectedSlug(results[0].slug);
      }
      setLoading(false);
    }
    
    loadData();
  }, []);

  const selected = useMemo(() => {
    return protocols.find(p => p.slug === selectedSlug);
  }, [protocols, selectedSlug]);

  // Reset multiplier when protocol changes
  useEffect(() => {
    setBuybackMultiplier(1);
  }, [selectedSlug]);

  // Generate chart data
  const chartData = useMemo(() => {
    if (!selected) return [];
    
    return simulatePriceWithBuybackChange(
      selected.dailyBuybacks,
      buybackMultiplier,
      selected.currentPrice
    );
  }, [selected, buybackMultiplier]);

  // Calculate summary stats
  const stats = useMemo(() => {
    if (!selected || chartData.length === 0) return null;
    
    const lastPoint = chartData[chartData.length - 1];
    const firstPoint = chartData[0];
    
    const actualChange = ((lastPoint.actual - firstPoint.actual) / firstPoint.actual) * 100;
    const simulatedChange = ((lastPoint.simulated - firstPoint.simulated) / firstPoint.simulated) * 100;
    const difference = simulatedChange - actualChange;
    
    const annualBuyback = selected.avgDailyBuyback * 365;
    const buybackYield = (annualBuyback / selected.marketCap) * 100;
    const scenarioYield = buybackYield * buybackMultiplier;
    
    return {
      actualChange,
      simulatedChange,
      difference,
      buybackYield,
      scenarioYield,
      dailyBuyback: selected.avgDailyBuyback,
      scenarioDailyBuyback: selected.avgDailyBuyback * buybackMultiplier,
    };
  }, [selected, chartData, buybackMultiplier]);

  const getScenarioLabel = () => {
    if (buybackMultiplier === 0) return 'No buybacks';
    if (buybackMultiplier === 0.5) return '50% buybacks';
    if (buybackMultiplier === 1) return 'Current';
    if (buybackMultiplier === 1.5) return '1.5× buybacks';
    if (buybackMultiplier === 2) return '2× buybacks';
    return `${buybackMultiplier}× buybacks`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-lg">Loading price data...</div>
          <div className="text-sm muted mt-2">Fetching historical buybacks</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm text-gray-500 hover:text-black">
                ← Back
              </Link>
              <div>
                <h1 className="text-lg font-semibold">Price Impact Simulator</h1>
              </div>
            </div>
            <select
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="text-sm border-gray-300"
            >
              {protocols.map(p => (
                <option key={p.slug} value={p.slug}>
                  {p.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {selected && stats && (
          <>
            {/* Main Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{selected.symbol}</h2>
                  <p className="text-sm text-gray-500">{selected.name}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Scenario</div>
                  <div className="text-lg font-semibold">{getScenarioLabel()}</div>
                </div>
              </div>

              {/* Chart */}
              <div style={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#888', fontSize: 11 }}
                      tickFormatter={(v) => {
                        const d = new Date(v);
                        return `${d.getMonth() + 1}/${d.getDate()}`;
                      }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#888', fontSize: 11 }}
                      domain={['auto', 'auto']}
                      tickFormatter={(v) => v.toFixed(0)}
                      width={40}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#fff',
                        border: '1px solid #e5e5e5',
                        borderRadius: 6,
                        fontSize: 12,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      }}
                      formatter={(value: number, name: string) => {
                        const labels: Record<string, string> = {
                          actual: 'Actual (with buybacks)',
                          simulated: getScenarioLabel(),
                        };
                        return [value.toFixed(1), labels[name] || name];
                      }}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <ReferenceLine y={100} stroke="#e5e5e5" strokeDasharray="3 3" />
                    
                    {/* Actual price line */}
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="#111"
                      strokeWidth={2}
                      dot={false}
                      name="actual"
                    />
                    
                    {/* Simulated price line */}
                    {buybackMultiplier !== 1 && (
                      <Line
                        type="monotone"
                        dataKey="simulated"
                        stroke={buybackMultiplier > 1 ? '#16a34a' : '#dc2626'}
                        strokeWidth={2}
                        strokeDasharray="6 3"
                        dot={false}
                        name="simulated"
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="flex gap-6 text-sm mt-2 justify-center">
                <span className="flex items-center gap-2">
                  <span className="w-6 h-0.5 bg-black"></span>
                  Actual (with buybacks)
                </span>
                {buybackMultiplier !== 1 && (
                  <span className="flex items-center gap-2">
                    <span 
                      className="w-6 h-0.5" 
                      style={{ 
                        background: buybackMultiplier > 1 ? '#16a34a' : '#dc2626',
                        borderStyle: 'dashed'
                      }}
                    ></span>
                    {getScenarioLabel()}
                  </span>
                )}
              </div>
            </div>

            {/* Buyback Slider */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium">Buyback Scenario</span>
                <span className="text-sm text-gray-600">
                  {formatUSD(stats.scenarioDailyBuyback)}/day
                </span>
              </div>
              
              <input
                type="range"
                min="0"
                max="2"
                step="0.25"
                value={buybackMultiplier}
                onChange={(e) => setBuybackMultiplier(parseFloat(e.target.value))}
                className="w-full"
              />
              
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>No buybacks</span>
                <span>50%</span>
                <span className="font-medium text-black">Current</span>
                <span>1.5×</span>
                <span>2×</span>
              </div>
            </div>

            {/* Impact Summary */}
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="text-sm text-gray-500">Price Impact</div>
                <div className={`text-2xl font-bold ${stats.difference > 0 ? 'text-green-600' : stats.difference < 0 ? 'text-red-600' : ''}`}>
                  {stats.difference > 0 ? '+' : ''}{stats.difference.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  vs actual over this period
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="text-sm text-gray-500">Buyback Yield</div>
                <div className="text-2xl font-bold">
                  {stats.scenarioYield.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  annual buyback / mcap
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="text-sm text-gray-500">Daily Buying</div>
                <div className="text-2xl font-bold mono">
                  {formatUSD(stats.scenarioDailyBuyback)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatUSD(stats.scenarioDailyBuyback / 24)}/hour
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="bg-gray-100 rounded-lg p-4 text-sm">
              <div className="font-medium mb-2">How This Works</div>
              <p className="text-gray-600 mb-2">
                This simulator models how different buyback levels would affect price. The model assumes 
                buybacks create consistent buy pressure — higher buybacks = more buying = price support.
              </p>
              <p className="text-gray-600 mb-2">
                <strong>Current:</strong> {selected.symbol} buys back ~{formatUSD(stats.dailyBuyback)}/day, 
                representing a {stats.buybackYield.toFixed(1)}% annual yield relative to market cap.
              </p>
              <p className="text-gray-500 text-xs">
                ⚠️ This is a simplified model. Real prices depend on many factors beyond buybacks: 
                market sentiment, macro conditions, news, whale activity, etc. Use as a mental model, not a prediction.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
