'use client';

import { LiveTokenData } from '@/lib/hooks';
import { AnimatedNumber } from './AnimatedNumber';
import { Sparkline } from './Sparkline';
import { X, TrendingUp, Coins, Flame, ExternalLink, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import clsx from 'clsx';

interface TokenModalProps {
  token: LiveTokenData | null;
  onClose: () => void;
}

export function TokenModal({ token, onClose }: TokenModalProps) {
  if (!token) return null;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartData = months.map((month, i) => ({
    month,
    buyback: token.monthlyBuybacks[i],
  }));

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl animate-count"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative border-b border-border/50 bg-gradient-to-r from-accent/10 to-transparent p-6">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-2 text-muted hover:bg-surface-light hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-light text-3xl shadow-lg ring-1 ring-border/50">
              {token.logo}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white">{token.name}</h2>
                <span className={clsx(
                  'rounded-full px-2 py-0.5 text-xs font-medium',
                  token.priceChange24h >= 0 ? 'bg-accent/10 text-accent' : 'bg-danger/10 text-danger'
                )}>
                  {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                </span>
              </div>
              <div className="mt-1 flex items-center gap-3">
                <span className="font-mono text-lg text-muted">{token.symbol}</span>
                <span className="rounded bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                  {token.chain}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted">
                  <Clock size={10} />
                  Updated {new Date(token.lastUpdated * 1000).toLocaleTimeString()}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-2xl font-bold text-white">
                ${token.livePrice < 1 
                  ? token.livePrice.toFixed(4) 
                  : token.livePrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
              <Sparkline data={token.sparkline} width={80} height={24} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Description */}
          <p className="text-muted leading-relaxed">{token.description}</p>

          {/* Stats Grid */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-surface-light p-4">
              <div className="flex items-center gap-2 text-muted">
                <TrendingUp size={14} />
                <span className="text-xs">Buyback Rate</span>
              </div>
              <div className="mt-1">
                <AnimatedNumber
                  value={token.liveBuybackRate}
                  format="percent"
                  decimals={2}
                  className="font-mono text-xl font-bold text-accent"
                  size="lg"
                />
              </div>
            </div>
            <div className="rounded-xl bg-surface-light p-4">
              <div className="flex items-center gap-2 text-muted">
                <Coins size={14} />
                <span className="text-xs">Annual Buyback</span>
              </div>
              <div className="mt-1">
                <AnimatedNumber
                  value={token.annualBuybackAmount}
                  format="currency"
                  decimals={0}
                  className="font-mono text-xl font-bold text-white"
                  size="lg"
                />
              </div>
            </div>
            <div className="rounded-xl bg-surface-light p-4">
              <div className="flex items-center gap-2 text-muted">
                <Flame size={14} />
                <span className="text-xs">Supply Bought</span>
              </div>
              <p className="mt-1 font-mono text-xl font-bold text-warning">
                {token.percentSupplyBoughtBack.toFixed(1)}%
              </p>
            </div>
            <div className="rounded-xl bg-surface-light p-4">
              <div className="flex items-center gap-2 text-muted">
                <span className="text-xs">💰</span>
                <span className="text-xs">Market Cap</span>
              </div>
              <div className="mt-1">
                <AnimatedNumber
                  value={token.liveMarketCap}
                  format="currency"
                  decimals={2}
                  className="font-mono text-xl font-bold text-white"
                  size="lg"
                />
              </div>
            </div>
          </div>

          {/* Monthly Chart */}
          <div className="mt-6">
            <h3 className="mb-4 text-sm font-medium text-muted">Monthly Buyback Activity (2025)</h3>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBuyback" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00ff88" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 10 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 10 }}
                    tickFormatter={(v) => `$${v}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a25',
                      border: '1px solid #2a2a3a',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#e5e5e5' }}
                    formatter={(value: number) => [`$${value.toFixed(1)}M`, 'Buyback']}
                  />
                  <Area
                    type="monotone"
                    dataKey="buyback"
                    stroke="#00ff88"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorBuyback)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border/50 pt-4">
            <div className="flex flex-wrap gap-2">
              <span className={clsx(
                'rounded-full px-3 py-1 text-xs font-medium',
                token.mechanism === 'buyback-burn' && 'bg-danger/10 text-danger',
                token.mechanism === 'buyback-distribute' && 'bg-accent/10 text-accent',
                token.mechanism === 'buyback' && 'bg-warning/10 text-warning',
              )}>
                {token.mechanism === 'buyback-burn' ? '🔥 Buyback & Burn' : 
                 token.mechanism === 'buyback-distribute' ? '💰 Buyback & Distribute' : '📈 Buyback'}
              </span>
              <span className="rounded-full bg-surface-light px-3 py-1 text-xs font-medium text-muted">
                {token.category}
              </span>
              <span className="rounded-full bg-surface-light px-3 py-1 text-xs font-medium text-muted">
                {token.revenueSource}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs text-muted">
                <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                Live data
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
